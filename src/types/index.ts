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

export interface Transaction {
  id: string;
  project_id: string;
  amount: number;
  type: 'payment' | 'withdrawal' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description: string;
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