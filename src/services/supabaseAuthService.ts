import { supabase } from '../config/supabase';
import { Student, Company } from '../types';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Auth service using Supabase Auth
export const supabaseAuthService = {
  // Sign up a new user
  async signUp(email: string, password: string, userData: any): Promise<Student | Company> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in our custom table
      const profileData = {
        id: authData.user.id,
        email: authData.user.email!,
        name: userData.name,
        type: userData.type,
        created_at: new Date().toISOString(),
        is_verified: false,
        // Student fields
        ...(userData.type === 'student' && {
          university: userData.university,
          year: userData.year,
          major: userData.major,
          skills: userData.skills,
          rating: userData.rating || 5.0,
          completed_projects: userData.completed_projects || 0,
          total_earnings: userData.total_earnings || 0,
          resume_uploaded: userData.resume_uploaded || false,
          available_hours: userData.available_hours || 20,
        }),
        // Company fields
        ...(userData.type === 'company' && {
          company_name: userData.company_name,
          industry: userData.industry,
          website: userData.website,
          contact_person: userData.contact_person,
          posted_projects: userData.posted_projects || 0,
          total_spent: userData.total_spent || 0,
        }),
      };

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        console.error('Profile creation failed:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      return profile as Student | Company;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string): Promise<Student | Company> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to sign in');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      return profile as Student | Company;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out the current user
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get the current user
  async getCurrentUser(): Promise<Student | Company | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        return null;
      }

      if (!session?.user) {
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      return profile as Student | Company;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Student | Company>): Promise<Student | Company> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data as Student | Company;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: Student | Company | null) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: null } };
    }

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          callback(profile as Student | Company);
        } catch (error) {
          console.error('Auth state change error:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please check your environment variables.');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },
};
