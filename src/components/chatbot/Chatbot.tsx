import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotService } from '../../services/chatbotService';
import { ChatMessage, QuickReply } from '../../types';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  RotateCcw
} from 'lucide-react';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    
    // Show welcome message if no messages exist
    if (messages.length === 0 && user) {
      const welcomeResponse = chatbotService.getWelcomeMessage(user.type);
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        content: welcomeResponse.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        quickReplies: welcomeResponse.quickReplies
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !user) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      // Get bot response
      const response = chatbotService.processMessage(message.trim(), user.type);
      
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        content: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        quickReplies: response.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Handle navigation action
      if (response.action?.type === 'navigate') {
        setTimeout(() => {
          navigate(response.action!.value);
        }, 1000);
      }
    }, 800);
  };

  const handleQuickReply = (quickReply: QuickReply) => {
    if (quickReply.action === 'navigate') {
      navigate(quickReply.value);
      // Also send the quick reply as a message
      handleSendMessage(quickReply.text);
    } else if (quickReply.action === 'message') {
      handleSendMessage(quickReply.value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  const clearChat = () => {
    setMessages([]);
    chatbotService.clearHistory();
    if (user) {
      const welcomeResponse = chatbotService.getWelcomeMessage(user.type);
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        content: welcomeResponse.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        quickReplies: welcomeResponse.quickReplies
      };
      setMessages([welcomeMessage]);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            ?
          </div>
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Need help? Ask me anything!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-96 w-80'
        }`}>
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-medium text-sm">GigCampus Assistant</h3>
                <p className="text-xs text-blue-100">
                  {user.type === 'student' ? 'Student Helper' : 'Company Helper'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleMinimizeChat}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleCloseChat}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((message) => (
                  <div key={message.id}>
                    {/* Message Bubble */}
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-xs ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        </div>
                        
                        {/* Message Content */}
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Quick Replies */}
                          {message.quickReplies && message.quickReplies.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.quickReplies.map((reply) => (
                                <button
                                  key={reply.id}
                                  onClick={() => handleQuickReply(reply)}
                                  className="block w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                                >
                                  {reply.icon && <span className="mr-1">{reply.icon}</span>}
                                  {reply.text}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
