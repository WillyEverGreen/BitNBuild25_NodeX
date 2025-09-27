import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  (typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null) || 
  'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== 'undefined' ? localStorage.getItem('supabase_key') : null) || 
  'placeholder-key';

// Check if environment variables are properly set
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase environment variables not set! Please configure your .env file with:');
  console.warn('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.warn('Or use the setup page at /setup');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types based on your SQL schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar?: string;
          type: 'student' | 'company';
          created_at: string;
          is_verified: boolean;
          // Student fields
          university?: string;
          year?: number;
          major?: string;
          skills?: string[];
          interests?: string[];
          rating: number;
          completed_projects: number;
          total_earnings: number;
          resume_uploaded: boolean;
          resume_url?: string;
          available_hours: number;
          // Company fields
          company_name?: string;
          industry?: string;
          website?: string;
          contact_person?: string;
          posted_projects: number;
          total_spent: number;
          payment_method?: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar?: string;
          type: 'student' | 'company';
          created_at?: string;
          is_verified?: boolean;
          // Student fields
          university?: string;
          year?: number;
          major?: string;
          skills?: string[];
          interests?: string[];
          rating?: number;
          completed_projects?: number;
          total_earnings?: number;
          resume_uploaded?: boolean;
          resume_url?: string;
          available_hours?: number;
          // Company fields
          company_name?: string;
          industry?: string;
          website?: string;
          contact_person?: string;
          posted_projects?: number;
          total_spent?: number;
          payment_method?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string;
          type?: 'student' | 'company';
          created_at?: string;
          is_verified?: boolean;
          // Student fields
          university?: string;
          year?: number;
          major?: string;
          skills?: string[];
          interests?: string[];
          rating?: number;
          completed_projects?: number;
          total_earnings?: number;
          resume_uploaded?: boolean;
          resume_url?: string;
          available_hours?: number;
          // Company fields
          company_name?: string;
          industry?: string;
          website?: string;
          contact_person?: string;
          posted_projects?: number;
          total_spent?: number;
          payment_method?: string;
        };
      };
      projects: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          budget: number;
          deadline: string;
          duration: string;
          skills: string[];
          category: string;
          client_id: string;
          client_name: string;
          client_rating?: number;
          status?: 'open' | 'in-progress' | 'review' | 'completed' | 'cancelled';
          bids_count?: number;
          created_at?: string;
          assigned_to?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          budget?: number;
          deadline?: string;
          duration?: string;
          skills?: string[];
          category?: string;
          client_id?: string;
          client_name?: string;
          client_rating?: number;
          status?: 'open' | 'in-progress' | 'review' | 'completed' | 'cancelled';
          bids_count?: number;
          created_at?: string;
          assigned_to?: string;
        };
      };
      bids: {
        Row: {
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
        };
        Insert: {
          id?: string;
          project_id: string;
          student_id: string;
          student_name: string;
          student_rating?: number;
          amount: number;
          proposal: string;
          delivery_time: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          student_id?: string;
          student_name?: string;
          student_rating?: number;
          amount?: number;
          proposal?: string;
          delivery_time?: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'bid' | 'message' | 'project' | 'payment' | 'system';
          title: string;
          message: string;
          read: boolean;
          created_at: string;
          action_url?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'bid' | 'message' | 'project' | 'payment' | 'system';
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
          action_url?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'bid' | 'message' | 'project' | 'payment' | 'system';
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
          action_url?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          timestamp: string;
          read: boolean;
          attachments?: string[];
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          timestamp?: string;
          read?: boolean;
          attachments?: string[];
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          timestamp?: string;
          read?: boolean;
          attachments?: string[];
        };
      };
    };
  };
}

export default supabase;
