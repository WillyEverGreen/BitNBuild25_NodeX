export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: 'student' | 'company';
  created_at: string;
  is_verified: boolean;
}

export interface Student extends User {
  type: 'student';
  university: string;
  year: number;
  major: string;
  skills: string[];
  interests: string[];
  rating: number;
  completed_projects: number;
  total_earnings: number;
  resume_uploaded: boolean;
  resume_url?: string;
  available_hours: number;
  resume_analysis?: {
    overallRating: number;
    skillRating: number;
    experienceRating: number;
    educationRating: number;
    summary: string;
    skills: string[];
    experience: string[];
    education: string[];
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    industryFit: string[];
    keywordMatches: number;
    technicalDepth: number;
    professionalLevel: number;
    confidence: number;
    analyzed_at: string;
  };
}

export interface Company extends User {
  type: 'company';
  company_name: string;
  industry: string;
  website?: string;
  contact_person: string;
  posted_projects: number;
  total_spent: number;
  payment_method?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  duration: string;
  skills: string[];
  category: string;
  client_id: string;
  client_name: string;
  client_rating: number;
  status: 'open' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  bids_count: number;
  created_at: string;
  assigned_to?: string;
}

export interface Bid {
  id: string;
  project_id: string;
  student_id: string;
  student_name: string;
  student_rating: number;
  amount: number;
  proposal: string;
  timeline: string;
  delivery_time: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  project_id: string;
  title: string;
  description: string;
  images: string[];
  skills: string[];
  completed_at: string;
  client_rating: number;
  client_review?: string;
}

export interface Badge {
  id: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
  conversation_id?: string;
  // File attachment fields
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_data?: string; // Base64 encoded file data for localStorage
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'bid' | 'message' | 'project' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id?: string; // For backward compatibility
  from_user_id?: string; // For escrow transactions
  to_user_id?: string; // For escrow transactions
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'escrow_assignment' | 'escrow_release' | 'project_payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  project_id?: string;
  escrow_id?: string;
  bank_account_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface Escrow {
  id: string;
  project_id: string;
  company_id: string;
  student_id?: string;
  amount: number;
  // Status supports both Supabase and legacy UI flows
  // pending: created but not released; assigned/locked: internal UI states; released/refunded: final states
  status: 'pending' | 'assigned' | 'locked' | 'released' | 'refunded';
  created_at?: string;
  released_at?: string;
  // Optional metadata used by localStorage flows; optional for Supabase
  assigned_at?: string;
  locked_at?: string;
  description?: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  is_verified: boolean;
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  duration: string;
  skills: string[];
  category: string;
  company_id: string;
  company_name: string;
  company_rating: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  bids_count: number;
  created_at: string;
  assigned_to?: string;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  quickReplies?: QuickReply[];
}

export interface QuickReply {
  id: string;
  text: string;
  action: 'navigate' | 'message' | 'function';
  value: string;
  icon?: string;
}

export interface ChatIntent {
  intent: string;
  confidence: number;
  entities?: { [key: string]: string };
}

export interface ChatbotResponse {
  message: string;
  quickReplies?: QuickReply[];
  action?: {
    type: 'navigate' | 'function';
    value: string;
  };
}

export interface ChatbotConfig {
  welcomeMessage: string;
  fallbackMessage: string;
  maxHistoryLength: number;
  enableQuickReplies: boolean;
}

// Rating System Types
export interface ProjectRating {
  id: string;
  project_id: string;
  rater_id: string; // Company or Student ID
  ratee_id: string; // Student or Company ID
  rater_type: 'company' | 'student';
  ratee_type: 'student' | 'company';
  overall_rating: number; // 1-5 stars
  communication_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  review_text?: string;
  would_work_again: boolean;
  created_at: string;
  is_public: boolean;
}

export interface RatingStats {
  user_id: string;
  user_type: 'student' | 'company';
  overall_rating: number;
  total_ratings: number;
  communication_avg: number;
  quality_avg: number;
  timeliness_avg: number;
  professionalism_avg: number;
  would_work_again_percentage: number;
  recent_ratings: ProjectRating[];
  rating_breakdown: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
}

export interface RatingFormData {
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  professionalism_rating: number;
  review_text: string;
  would_work_again: boolean;
  is_public: boolean;
}

export interface SkillRating {
  skill_name: string;
  rating: number; // 0-5 stars
  projects_completed: number;
  total_projects: number;
  success_rate: number; // percentage
  last_updated: string;
}

export interface StudentSkillStats {
  student_id: string;
  overall_skill_rating: number; // 0-5 stars
  skill_level: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  total_projects_completed: number;
  total_projects_failed: number;
  success_rate: number; // percentage
  skill_ratings: SkillRating[];
  total_skills: number;
  last_updated: string;
}