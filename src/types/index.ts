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
  user_id: string;
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
  status: 'assigned' | 'locked' | 'released' | 'refunded';
  assigned_at: string;
  locked_at?: string;
  released_at?: string;
  description: string;
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