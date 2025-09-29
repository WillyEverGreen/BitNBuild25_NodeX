import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMessagesByConversation, 
  createMessage, 
  getConversationsByUser,
  createNotification,
  getUserById,
  getProjectsByCompany,
  getBidsByProject,
  getBidsByStudent,
  getProjectById
} from '../../services/supabaseService';
import { Message } from '../../types';
import { 
  Search, 
  Phone, 
  Video, 
  Paperclip, 
  Send,
  Calendar,
  FileText,
  Image,
  Download,
  Bell,
  BellOff,
  CheckCircle2
} from 'lucide-react';
import BackButton from '../common/BackButton';
import { uploadChatFile } from '../../services/storageService';

interface EnhancedMessage extends Message {
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_type: 'student' | 'company';
  project_title?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

interface ScheduledCall {
  id: string;
  type: 'video' | 'voice';
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const EnhancedChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL params for direct chat
  const withUserId = searchParams.get('with');
  const withUserName = searchParams.get('name');
  const projectTitle = searchParams.get('project');

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [, setScheduledCalls] = useState<ScheduledCall[]>([]);

  // Call scheduling state
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');
  const [callDuration, setCallDuration] = useState(30);

  useEffect(() => {
    if (user) {
      loadConversations();
      // If direct chat params exist, create/select conversation
      if (withUserId && withUserName) {
        handleDirectChat(withUserId, withUserName, projectTitle);
      }
    }
  }, [user, withUserId, withUserName, projectTitle]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      let userConversations = await getConversationsByUser(user!.id);
      console.log('Loaded conversations for user', user!.id, ':', userConversations);

      // Transform DB conversations to UI format
      const transformedConversations: Conversation[] = userConversations.map((conv: any) => {
        const isUser1 = conv.user1_id === user!.id;
        return {
          id: conv.id,
          participant_id: isUser1 ? conv.user2_id : conv.user1_id,
          participant_name: isUser1 ? conv.user2_name : conv.user1_name,
          participant_type: isUser1 ? 'student' : 'company', // This is a guess, ideally store in DB
          project_title: conv.project_title,
          last_message: conv.last_message,
          last_message_time: conv.updated_at,
          unread_count: 0, // TODO: Calculate from messages
        };
      });

      // Fallback: derive conversations from bids if none found
      if (!transformedConversations || transformedConversations.length === 0) {
        const derived: Conversation[] = [];
        if (user?.type === 'company') {
          // Get company's projects and aggregate bidders
          try {
            const projects = await getProjectsByCompany(user.id);
            for (const p of projects) {
              const bids = await getBidsByProject(p.id);
              for (const b of bids) {
                const convId = [user.id, b.student_id].sort().join('_');
                if (!derived.find(c => c.id === convId)) {
                  derived.push({
                    id: convId,
                    participant_id: b.student_id,
                    participant_name: b.student_name,
                    participant_type: 'student',
                    project_title: p.title,
                    unread_count: 0,
                  });
                }
              }
            }
          } catch (e) {
            console.warn('Failed to derive company conversations from bids:', e);
          }
        } else if (user?.type === 'student') {
          // Get student's bids and map to project owners
          try {
            const bids = await getBidsByStudent(user.id);
            for (const b of bids) {
              const proj = await getProjectById(b.project_id);
              if (!proj) continue;
              const convId = [user.id, proj.client_id].sort().join('_');
              if (!derived.find(c => c.id === convId)) {
                derived.push({
                  id: convId,
                  participant_id: proj.client_id,
                  participant_name: proj.client_name,
                  participant_type: 'company',
                  project_title: proj.title,
                  unread_count: 0,
                });
              }
            }
          } catch (e) {
            console.warn('Failed to derive student conversations from bids:', e);
          }
        }
        userConversations = derived;
      } else {
        userConversations = transformedConversations;
      }

      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectChat = async (participantId: string, participantName: string, project?: string | null) => {
    // Create conversation ID based on user IDs (sorted for consistency)
    const conversationId = [user!.id, participantId].sort().join('_');
    console.log('Direct chat - User ID:', user!.id, 'Participant ID:', participantId, 'Conversation ID:', conversationId);
    
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.id === conversationId);
    
    if (!existingConv) {
      // Create new conversation entry
      const participant = await getUserById(participantId);
      const newConversation: Conversation = {
        id: conversationId,
        participant_id: participantId,
        participant_name: participantName,
        participant_type: participant?.type as 'student' | 'company',
        project_title: project || undefined,
        unread_count: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
    }
    
    setSelectedConversation(conversationId);
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await getMessagesByConversation(conversationId);
      console.log('Loaded messages for conversation', conversationId, ':', conversationMessages);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;
    try {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) return;

      const message: Omit<Message, 'id' | 'timestamp'> = {
        sender_id: user.id,
        receiver_id: conversation.participant_id,
        content: newMessage.trim(),
        read: false,
        conversation_id: selectedConversation
      };

      console.log('Sending message:', message);
      await createMessage(message);
      
      // Send notification to receiver
      if (notifications) {
        await createNotification({
          user_id: conversation.participant_id,
          type: 'message',
          title: 'New Message',
          message: `${user.name} sent you a message: "${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}"`,
          read: false,
          action_url: `/chat?with=${user.id}&name=${user.name}`
        });
      }

      setNewMessage('');
      await loadMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation || !user) {
      console.log('File upload blocked:', { file: !!file, selectedConversation, user: !!user });
      return;
    }
    
    console.log('Starting file upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    try {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) {
        console.error('Conversation not found:', selectedConversation);
        alert('Conversation not found. Please refresh and try again.');
        return;
      }

      console.log('Uploading to storage...');
      // Upload to Supabase Storage and get public URL
      const { url } = await uploadChatFile(selectedConversation, file);
      console.log('Upload successful, URL:', url);

      const message: Omit<EnhancedMessage, 'id' | 'timestamp'> = {
        sender_id: user.id,
        receiver_id: conversation.participant_id,
        content: `📎 Shared a file: ${file.name}`,
        read: false,
        conversation_id: selectedConversation,
        file_url: url,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      };

      console.log('Creating message with file attachment...');
      await createMessage(message);
      console.log('Message created, reloading messages...');
      await loadMessages(selectedConversation);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      const msg = (error as any)?.message || 'Failed to upload file. Please try again.';
      alert(`Upload failed: ${msg}`);
    }
  };

  const handleScheduleCall = async () => {
    if (!callDate || !callTime || !selectedConversation) return;

    const scheduledDateTime = new Date(`${callDate}T${callTime}`);
    const conversation = conversations.find(conv => conv.id === selectedConversation);
    
    if (!conversation) return;

    const newCall: ScheduledCall = {
      id: Date.now().toString(),
      type: callType,
      scheduled_time: scheduledDateTime.toISOString(),
      duration: callDuration,
      status: 'scheduled'
    };

    setScheduledCalls(prev => [...prev, newCall]);

    // Send notification about scheduled call
    await createNotification({
      user_id: conversation.participant_id,
      type: 'system',
      title: `${callType === 'video' ? 'Video' : 'Voice'} Call Scheduled`,
      message: `${user?.name} scheduled a ${callType} call for ${scheduledDateTime.toLocaleString()}`,
      read: false,
      action_url: `/chat?with=${user?.id}&name=${user?.name}`
    });

    // Send message about the scheduled call
    const message: Omit<Message, 'id' | 'timestamp'> = {
      sender_id: user!.id,
      receiver_id: conversation.participant_id,
      content: `📅 Scheduled a ${callType} call for ${scheduledDateTime.toLocaleString()} (${callDuration} minutes)`,
      read: false,
      conversation_id: selectedConversation
    };

    await createMessage(message);
    await loadMessages(selectedConversation);

    setShowScheduleCall(false);
    setCallDate('');
    setCallTime('');
    alert('Call scheduled successfully!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.participant_name && conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (conv.project_title && conv.project_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton to="/dashboard" />
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNotifications(!notifications)}
              className={`p-2 rounded-lg transition-colors ${
                notifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {notifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start chatting by bidding on projects!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {(conversation.participant_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.participant_name || 'Unknown User'}
                        </h3>
                        {conversation.last_message_time && (
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.last_message_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      {conversation.project_title && (
                        <p className="text-xs text-blue-600 truncate">
                          📋 {conversation.project_title}
                        </p>
                      )}
                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.last_message}
                        </p>
                      )}
                      {conversation.unread_count > 0 && (
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600 ml-1">
                            {conversation.unread_count} new
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConv.participant_name || 'Unknown User'}
                    </h2>
                    {selectedConv.project_title && (
                      <p className="text-sm text-gray-600">📋 {selectedConv.project_title}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => alert('Voice call feature coming soon!')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => alert('Video call feature coming soon!')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowScheduleCall(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* File attachment */}
                        {(message as EnhancedMessage).file_url && (
                          <div className="mt-2 p-2 bg-white bg-opacity-20 rounded border">
                            <div className="flex items-center space-x-2">
                              {getFileIcon((message as EnhancedMessage).file_type || '')}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate">{(message as EnhancedMessage).file_name}</p>
                                <p className="text-xs opacity-75">
                                  {formatFileSize((message as EnhancedMessage).file_size || 0)}
                                </p>
                              </div>
                              <a
                                href={(message as EnhancedMessage).file_url}
                                download={(message as EnhancedMessage).file_name}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                              >
                                <Download className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {message.sender_id === user?.id && (
                            <CheckCircle2 className={`h-3 w-3 ${
                              message.read ? 'text-blue-200' : 'text-blue-300'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg">Select a conversation to start chatting</p>
                <p className="text-sm mt-2">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Schedule Call Modal */}
      {showScheduleCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Schedule a Call</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Type</label>
                <select
                  value={callType}
                  onChange={(e) => setCallType(e.target.value as 'video' | 'voice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video">Video Call</option>
                  <option value="voice">Voice Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <select
                  value={callDuration}
                  onChange={(e) => setCallDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleCall(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCall}
                disabled={!callDate || !callTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatInterface;
