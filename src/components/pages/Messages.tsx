import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getConversationsByUser, 
  getMessagesByConversation, 
  createMessage,
  markMessagesAsRead,
  createNotification
} from '../../services/localStorageService';
import { Message } from '../../types';
import BackButton from '../common/BackButton';
import { 
  Send, 
  User, 
  MessageSquare, 
  Paperclip, 
  Phone, 
  Video, 
  Calendar,
  FileText,
  Image,
  Download,
  Bell,
  BellOff,
  CheckCircle2
} from 'lucide-react';

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

interface EnhancedMessage extends Message {
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

interface ScheduledCall {
  id: string;
  type: 'video' | 'voice';
  scheduled_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Enhanced features state
  const [notifications, setNotifications] = useState(true);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');
  const [callDuration, setCallDuration] = useState(30);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation, user!.id);
    }
  }, [selectedConversation, user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userConversations = await getConversationsByUser(user.id);
      console.log('Loaded conversations for Messages tab:', userConversations);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
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
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) return;

      const messageData = {
        sender_id: user.id,
        receiver_id: conversation.participant_id,
        content: newMessage.trim(),
        read: false,
        conversation_id: selectedConversation
      };

      console.log('Sending message from Messages tab:', messageData);
      await createMessage(messageData);
      
      // Send notification to receiver
      if (notifications) {
        await createNotification({
          user_id: conversation.participant_id,
          type: 'message',
          title: 'New Message',
          message: `${user.name} sent you a message: "${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}"`,
          read: false,
          action_url: `/messages`
        });
      }
      
      setNewMessage('');
      await loadMessages(selectedConversation);
      await loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation || !user) return;

    // Simulate file upload (in real app, upload to cloud storage)
    const fileUrl = URL.createObjectURL(file);
    
    try {
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) return;

      const message: Omit<EnhancedMessage, 'id' | 'timestamp'> = {
        sender_id: user.id,
        receiver_id: conversation.participant_id,
        content: `📎 Shared a file: ${file.name}`,
        read: false,
        conversation_id: selectedConversation,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      };

      await createMessage(message);
      await loadMessages(selectedConversation);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
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
      type: 'message',
      title: `${callType === 'video' ? 'Video' : 'Voice'} Call Scheduled`,
      message: `${user?.name} scheduled a ${callType} call for ${scheduledDateTime.toLocaleString()}`,
      read: false,
      action_url: `/messages`
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <BackButton to={user.type === 'student' ? '/student-dashboard' : '/company-dashboard'} />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with other users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-[600px] flex">
          {/* Sidebar - Conversations List */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start by connecting with other users</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-3 text-left hover:bg-gray-100 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {conversation.participant_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.participant_name}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {conversation.participant_type}
                                {conversation.project_title && ` • ${conversation.project_title}`}
                              </p>
                            </div>
                          </div>
                          {conversation.last_message && (
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-600 truncate flex-1 mr-2">
                                {conversation.last_message}
                              </p>
                              {conversation.last_message_time && (
                                <p className="text-xs text-gray-400 flex-shrink-0">
                                  {formatRelativeTime(conversation.last_message_time)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  {(() => {
                    const conversation = conversations.find(conv => conv.id === selectedConversation);
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {conversation?.participant_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {conversation?.participant_name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {conversation?.participant_type}
                              {conversation?.project_title && ` • ${conversation.project_title}`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setNotifications(!notifications)}
                            className={`p-2 rounded-md transition-colors ${
                              notifications 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={notifications ? 'Notifications enabled' : 'Notifications disabled'}
                          >
                            {notifications ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                          </button>
                          
                          <button
                            onClick={() => setShowScheduleCall(true)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Schedule a call"
                          >
                            <Calendar className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => setCallType('voice')}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Voice call"
                          >
                            <Phone className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => setCallType('video')}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="Video call"
                          >
                            <Video className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                      <div>
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation below</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const enhancedMessage = message as EnhancedMessage;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              
                              {/* File attachment */}
                              {enhancedMessage.file_url && (
                                <div className="mt-2 p-2 bg-white bg-opacity-20 rounded border">
                                  <div className="flex items-center space-x-2">
                                    {getFileIcon(enhancedMessage.file_type || '')}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">
                                        {enhancedMessage.file_name}
                                      </p>
                                      <p className="text-xs opacity-75">
                                        {formatFileSize(enhancedMessage.file_size || 0)}
                                      </p>
                                    </div>
                                    <a
                                      href={enhancedMessage.file_url}
                                      download={enhancedMessage.file_name}
                                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                                    >
                                      <Download className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              <p className={`text-xs mt-1 ${
                                message.sender_id === user.id
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      {showScheduleCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Schedule a Call</h3>
              <button
                onClick={() => setShowScheduleCall(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCallType('video')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                      callType === 'video'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => setCallType('voice')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                      callType === 'voice'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Voice</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={callDuration}
                  onChange={(e) => setCallDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleCall(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCall}
                disabled={!callDate || !callTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
