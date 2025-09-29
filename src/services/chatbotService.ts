import { ChatMessage, QuickReply, ChatIntent, ChatbotResponse, ChatbotConfig } from '../types';

// Intent patterns for different user queries
const INTENT_PATTERNS = {
  // Student intents
  'view_projects': [
    'view projects', 'see projects', 'available projects', 'find projects', 'browse projects',
    'project list', 'show projects', 'projects available', 'what projects'
  ],
  'view_payments': [
    'payments', 'my payments', 'payment history', 'earnings', 'wallet', 'balance',
    'money', 'funds', 'see payments', 'check payments'
  ],
  'withdraw_funds': [
    'withdraw', 'withdraw money', 'withdraw funds', 'cash out', 'transfer money',
    'bank transfer', 'get money', 'withdrawal'
  ],
  'my_bids': [
    'my bids', 'bid history', 'bids', 'proposals', 'submitted bids', 'view bids'
  ],
  'profile': [
    'profile', 'my profile', 'edit profile', 'update profile', 'resume', 'skills'
  ],
  'messages': [
    'messages', 'chat', 'conversations', 'inbox', 'communication'
  ],
  
  // Company intents
  'post_project': [
    'post project', 'create project', 'new project', 'add project', 'publish project',
    'hire student', 'find freelancer'
  ],
  'view_posted_projects': [
    'my projects', 'posted projects', 'project management', 'manage projects'
  ],
  'payment_history': [
    'payment history', 'transaction history', 'spending', 'expenses', 'payments made'
  ],
  'release_escrow': [
    'release funds', 'release escrow', 'pay student', 'release payment', 'escrow'
  ],
  'view_bids': [
    'view bids', 'received bids', 'bid management', 'student proposals'
  ],
  
  // General intents
  'help': [
    'help', 'how to', 'guide', 'tutorial', 'instructions', 'what can you do'
  ],
  'greeting': [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'
  ],
  'thanks': [
    'thank you', 'thanks', 'appreciate', 'grateful'
  ]
};

// Quick reply templates
const QUICK_REPLIES = {
  student: [
    { id: 'view_projects', text: '🔍 View Projects', action: 'navigate' as const, value: '/projects', icon: '🔍' },
    { id: 'my_bids', text: '📝 My Bids', action: 'navigate' as const, value: '/my-bids', icon: '📝' },
    { id: 'payments', text: '💰 Payments', action: 'navigate' as const, value: '/payments', icon: '💰' },
    { id: 'messages', text: '💬 Messages', action: 'navigate' as const, value: '/messages', icon: '💬' },
    { id: 'profile', text: '👤 Profile', action: 'navigate' as const, value: '/profile', icon: '👤' }
  ],
  company: [
    { id: 'post_project', text: '➕ Post Project', action: 'navigate' as const, value: '/post-project', icon: '➕' },
    { id: 'my_projects', text: '📋 My Projects', action: 'navigate' as const, value: '/my-projects', icon: '📋' },
    { id: 'payments', text: '💳 Payments', action: 'navigate' as const, value: '/payments', icon: '💳' },
    { id: 'messages', text: '💬 Messages', action: 'navigate' as const, value: '/messages', icon: '💬' },
    { id: 'dashboard', text: '🏠 Dashboard', action: 'navigate' as const, value: '/dashboard', icon: '🏠' }
  ]
};

// Response templates
const RESPONSES = {
  student: {
    greeting: "Hi there! 👋 I'm your GigCampus assistant. I'm here to help you navigate the platform, find projects, manage your bids, and handle payments. What would you like to do today?",
    view_projects: "Great! I can help you find available projects. You can browse all open projects where companies are looking for talented students like you. Click 'View Projects' below or I can take you there directly!",
    view_payments: "I'll help you check your payments and wallet balance. In your payments section, you can see your earnings, transaction history, and withdraw funds to your bank account.",
    withdraw_funds: "To withdraw your funds, go to the Payments section where you can transfer money from your GigCampus wallet to your linked bank account. Make sure you have a verified bank account set up!",
    my_bids: "You can view all your submitted bids and their status in the 'My Bids' section. This shows you which projects you've bid on and whether they're pending, accepted, or rejected.",
    profile: "Your profile is where you can showcase your skills, upload your resume, and let companies know what you're capable of. A complete profile gets more project opportunities!",
    messages: "The Messages section is where you can communicate with companies about projects, ask questions, and receive updates about your bids.",
    help: "I can help you with:\n• Finding and bidding on projects\n• Managing your payments and withdrawals\n• Updating your profile and resume\n• Communicating with companies\n• Understanding the platform features\n\nWhat specific area would you like help with?"
  },
  company: {
    greeting: "Welcome! 👋 I'm your GigCampus assistant for companies. I can help you post projects, manage bids, handle payments, and find the perfect students for your work. How can I assist you today?",
    post_project: "Ready to hire talented students? I can guide you through posting a new project. You'll need to provide project details, budget, timeline, and required skills. Let's get started!",
    view_posted_projects: "You can manage all your posted projects in the 'My Projects' section. Here you can view bids, communicate with students, and track project progress.",
    payment_history: "Your payment history shows all transactions, including escrow assignments, fund releases, and refunds. You can track all your spending and project payments in one place.",
    release_escrow: "When a student completes your project satisfactorily, you can release the escrowed funds from the project management page. This transfers the payment directly to the student's wallet.",
    view_bids: "You can review all received bids for your projects in the project management section. Compare proposals, student profiles, and select the best candidate for your project.",
    help: "I can help you with:\n• Posting new projects and finding students\n• Managing bids and selecting candidates\n• Handling payments and escrow releases\n• Communicating with students\n• Understanding platform features\n\nWhat would you like to know more about?"
  },
  general: {
    thanks: "You're welcome! 😊 I'm always here to help. Is there anything else you'd like to know about GigCampus?",
    fallback: "I'm not sure I understand that question. Could you try rephrasing it? I can help you with projects, payments, bids, messages, and general platform navigation. What specific area are you interested in?"
  }
};

class ChatbotService {
  private config: ChatbotConfig = {
    welcomeMessage: "Hello! I'm your GigCampus assistant. How can I help you today?",
    fallbackMessage: "I'm not sure I understand. Could you try rephrasing your question?",
    maxHistoryLength: 50,
    enableQuickReplies: true
  };

  private chatHistory: ChatMessage[] = [];

  // Detect intent from user message
  detectIntent(message: string, userType: 'student' | 'company'): ChatIntent {
    const normalizedMessage = message.toLowerCase().trim();
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (normalizedMessage.includes(pattern.toLowerCase())) {
          return {
            intent,
            confidence: 0.8,
            entities: { userType }
          };
        }
      }
    }

    // Fallback intent
    return {
      intent: 'unknown',
      confidence: 0.1,
      entities: { userType }
    };
  }

  // Generate response based on intent
  generateResponse(intent: ChatIntent, userType: 'student' | 'company'): ChatbotResponse {
    const intentName = intent.intent;
    
    // Handle greetings
    if (intentName === 'greeting') {
      return {
        message: RESPONSES[userType].greeting,
        quickReplies: QUICK_REPLIES[userType]
      };
    }

    // Handle thanks
    if (intentName === 'thanks') {
      return {
        message: RESPONSES.general.thanks,
        quickReplies: QUICK_REPLIES[userType]
      };
    }

    // Handle specific intents
    if (RESPONSES[userType][intentName as keyof typeof RESPONSES[typeof userType]]) {
      const response = RESPONSES[userType][intentName as keyof typeof RESPONSES[typeof userType]];
      
      // Add navigation action for certain intents
      const navigationIntents: { [key: string]: string } = {
        view_projects: '/projects',
        view_payments: '/payments',
        withdraw_funds: '/payments',
        my_bids: '/my-bids',
        profile: '/profile',
        messages: '/messages',
        post_project: '/post-project',
        view_posted_projects: '/my-projects',
        payment_history: '/payments',
        view_bids: '/my-projects'
      };

      return {
        message: response,
        quickReplies: this.getRelevantQuickReplies(intentName, userType),
        action: navigationIntents[intentName] ? {
          type: 'navigate',
          value: navigationIntents[intentName]
        } : undefined
      };
    }

    // Handle help intent
    if (intentName === 'help') {
      return {
        message: RESPONSES[userType].help,
        quickReplies: QUICK_REPLIES[userType]
      };
    }

    // Fallback response
    return {
      message: RESPONSES.general.fallback,
      quickReplies: QUICK_REPLIES[userType]
    };
  }

  // Get relevant quick replies based on intent
  private getRelevantQuickReplies(intent: string, userType: 'student' | 'company'): QuickReply[] {
    // Return contextual quick replies based on the intent
    const contextualReplies: { [key: string]: QuickReply[] } = {
      view_projects: [
        { id: 'view_projects', text: '🔍 Browse Projects', action: 'navigate', value: '/projects' },
        { id: 'my_bids', text: '📝 My Bids', action: 'navigate', value: '/my-bids' }
      ],
      payments: [
        { id: 'payments', text: '💰 View Wallet', action: 'navigate', value: '/payments' },
        { id: 'withdraw', text: '🏦 Withdraw Funds', action: 'message', value: 'How do I withdraw funds?' }
      ],
      post_project: [
        { id: 'post_project', text: '➕ Post New Project', action: 'navigate', value: '/post-project' },
        { id: 'my_projects', text: '📋 My Projects', action: 'navigate', value: '/my-projects' }
      ]
    };

    return contextualReplies[intent] || QUICK_REPLIES[userType].slice(0, 3);
  }

  // Process user message and return bot response
  processMessage(userMessage: string, userType: 'student' | 'company'): ChatbotResponse {
    // Detect intent
    const intent = this.detectIntent(userMessage, userType);
    
    // Generate response
    const response = this.generateResponse(intent, userType);
    
    // Add to chat history
    const userChatMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const botChatMessage: ChatMessage = {
      id: `bot_${Date.now()}`,
      content: response.message,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      quickReplies: response.quickReplies
    };

    this.addToHistory(userChatMessage);
    this.addToHistory(botChatMessage);

    return response;
  }

  // Add message to chat history
  private addToHistory(message: ChatMessage): void {
    this.chatHistory.push(message);
    
    // Limit history length
    if (this.chatHistory.length > this.config.maxHistoryLength) {
      this.chatHistory = this.chatHistory.slice(-this.config.maxHistoryLength);
    }
  }

  // Get chat history
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  // Clear chat history
  clearHistory(): void {
    this.chatHistory = [];
  }

  // Get welcome message
  getWelcomeMessage(userType: 'student' | 'company'): ChatbotResponse {
    return {
      message: RESPONSES[userType].greeting,
      quickReplies: QUICK_REPLIES[userType]
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<ChatbotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get configuration
  getConfig(): ChatbotConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
export default chatbotService;
