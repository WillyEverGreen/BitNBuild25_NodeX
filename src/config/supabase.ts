import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a mock Supabase client if environment variables are not set
let supabase: any;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not found. Using mock client. Please set up your .env.local file.');
  
  // Create a mock Supabase client that doesn't make real requests
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ error: null }),
      eq: function() { return this; },
      order: function() { return this; },
      limit: function() { return this; },
      single: function() { return this; },
      rpc: () => ({ error: null })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export interface Database {
  public: {
    Tables: {
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
          client_rating: number;
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
          amount: number;
          proposal: string;
          timeline: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          student_id: string;
          student_name: string;
          amount: number;
          proposal: string;
          timeline: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          student_id?: string;
          student_name?: string;
          amount?: number;
          proposal?: string;
          timeline?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          project_id?: string;
          content: string;
          created_at: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          project_id?: string;
          content: string;
          created_at?: string;
          read?: boolean;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          project_id?: string;
          content?: string;
          created_at?: string;
          read?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'bid' | 'project' | 'message' | 'payment' | 'system';
          read: boolean;
          created_at: string;
          project_id?: string;
          bid_id?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'bid' | 'project' | 'message' | 'payment' | 'system';
          read?: boolean;
          created_at?: string;
          project_id?: string;
          bid_id?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'bid' | 'project' | 'message' | 'payment' | 'system';
          read?: boolean;
          created_at?: string;
          project_id?: string;
          bid_id?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          description: string;
          company_id: string;
          company_name: string;
          requirements: string[];
          benefits: string[];
          location: string;
          type: 'internship' | 'job' | 'freelance';
          created_at: string;
          deadline?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          company_id: string;
          company_name: string;
          requirements: string[];
          benefits: string[];
          location: string;
          type: 'internship' | 'job' | 'freelance';
          created_at?: string;
          deadline?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          company_id?: string;
          company_name?: string;
          requirements?: string[];
          benefits?: string[];
          location?: string;
          type?: 'internship' | 'job' | 'freelance';
          created_at?: string;
          deadline?: string;
        };
      };
      escrows: {
        Row: {
          id: string;
          project_id: string;
          company_id: string;
          student_id: string;
          amount: number;
          status: 'pending' | 'released' | 'refunded';
          created_at: string;
          released_at?: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          company_id: string;
          student_id: string;
          amount: number;
          status?: 'pending' | 'released' | 'refunded';
          created_at?: string;
          released_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          company_id?: string;
          student_id?: string;
          amount?: number;
          status?: 'pending' | 'released' | 'refunded';
          created_at?: string;
          released_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          type: 'payment' | 'refund' | 'withdrawal';
          description: string;
          created_at: string;
          project_id?: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          type: 'payment' | 'refund' | 'withdrawal';
          description: string;
          created_at?: string;
          project_id?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          amount?: number;
          type?: 'payment' | 'refund' | 'withdrawal';
          description?: string;
          created_at?: string;
          project_id?: string;
        };
      };
    };
  };
}
