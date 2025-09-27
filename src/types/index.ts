export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: 'student' | 'company';
  createdAt: string;
  isVerified: boolean;
}

export interface Student extends User {
  type: 'student';
  university: string;
  year: number;
  major: string;
  skills: string[];
  interests: string[];
  rating: number;
  completedProjects: number;
  totalEarnings: number;
  resumeUploaded: boolean;
  resumeUrl?: string;
  portfolio: PortfolioItem[];
  badges: Badge[];
  availableHours: number;
}

export interface Company extends User {
  type: 'company';
  companyName: string;
  industry: string;
  website?: string;
  contactPerson: string;
  postedProjects: number;
  totalSpent: number;
  paymentMethod?: string;
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
  clientId: string;
  clientName: string;
  clientRating: number;
  status: 'open' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  bidsCount: number;
  createdAt: string;
  assignedTo?: string;
}

export interface Bid {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  studentRating: number;
  amount: number;
  proposal: string;
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  images: string[];
  skills: string[];
  completedAt: string;
  clientRating: number;
  clientReview?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid' | 'message' | 'project' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  amount: number;
  type: 'payment' | 'withdrawal' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description: string;
}