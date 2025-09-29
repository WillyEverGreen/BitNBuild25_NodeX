import React from 'react';
import { MessageCircle, Bot, Zap, Navigation, Users, Shield } from 'lucide-react';

const ChatbotDemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">GigCampus AI Assistant</h1>
        </div>
        <p className="text-lg text-gray-600">
          Your intelligent helper for navigating the GigCampus platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Features */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
            Key Features
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <MessageCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <span className="text-gray-700">Instant help with platform navigation</span>
            </li>
            <li className="flex items-start">
              <Navigation className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span className="text-gray-700">Smart routing to relevant pages</span>
            </li>
            <li className="flex items-start">
              <Users className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
              <span className="text-gray-700">Tailored responses for students & companies</span>
            </li>
            <li className="flex items-start">
              <Shield className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <span className="text-gray-700">Quick-reply buttons for common actions</span>
            </li>
          </ul>
        </div>

        {/* How to Use */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Click the floating chat button</p>
                <p className="text-sm text-gray-600">Look for the blue chat icon in the bottom-right corner</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Ask your question</p>
                <p className="text-sm text-gray-600">Type naturally or use quick-reply buttons</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Get instant help</p>
                <p className="text-sm text-gray-600">Receive tailored guidance and navigation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Try These Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-600 mb-2">For Students:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• "How do I view available projects?"</li>
              <li>• "Where can I see my payments?"</li>
              <li>• "How do I withdraw funds?"</li>
              <li>• "Show me my bids"</li>
              <li>• "Help me update my profile"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-600 mb-2">For Companies:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• "How do I post a project?"</li>
              <li>• "Where can I view payment history?"</li>
              <li>• "How do I release escrow payments?"</li>
              <li>• "Show me received bids"</li>
              <li>• "Help with project management"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
          <p className="text-blue-800 font-medium mb-2">Ready to get started?</p>
          <p className="text-blue-600 text-sm">
            Look for the chat button in the bottom-right corner and ask me anything!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDemo;
