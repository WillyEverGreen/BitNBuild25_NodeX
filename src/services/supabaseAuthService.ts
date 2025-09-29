import { supabase } from '../config/supabase';
import { Student, Company } from '../types';

// Auth service using Supabase Auth
export const supabaseAuthService = {
  // Internal helper to ensure a profile exists for the current auth user
  async ensureProfile(userId: string, fallbackData?: any): Promise<Student | Company> {
    // Try to fetch profile
    const { data: existing, error: fetchErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existing) return existing as Student | Company;

    // If not found, attempt to create minimal profile using available metadata
    const sessionRes = await supabase.auth.getUser();
    const authUser = sessionRes.data.user;
    const email = authUser?.email || fallbackData?.email;
    const name = (authUser?.user_metadata?.name as string) || fallbackData?.name || email || 'User';
    const type = (authUser?.user_metadata?.type as string) || fallbackData?.type || 'student';

    const profileData: any = {
      id: userId,
      email,
      name,
      type,
      created_at: new Date().toISOString(),
      is_verified: !!authUser?.email_confirmed_at,
    };

    if (type === 'student') {
      Object.assign(profileData, {
        university: fallbackData?.university || '',
        year: fallbackData?.year ?? null,
        major: fallbackData?.major || '',
        skills: fallbackData?.skills || [],
        rating: 5.0,
        completed_projects: 0,
        total_earnings: 0,
        resume_uploaded: false,
        available_hours: 20,
      });
    } else {
      Object.assign(profileData, {
        company_name: fallbackData?.company_name || name,
        industry: fallbackData?.industry || '',
        website: fallbackData?.website || '',
        contact_person: fallbackData?.contact_person || name,
        posted_projects: 0,
        total_spent: 0,
      });
    }

    const { data: created, error: createErr } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (createErr) {
      throw new Error(`Failed to create user profile: ${createErr.message}`);
    }

    return created as Student | Company;
  },
  // Sign up a new user
  async signUp(email: string, password: string, userData: any): Promise<Student | Company> {
    try {
      // Create user in Supabase Auth
      const normalizedEmail = (email || '').trim().toLowerCase();
      const userType = (userData?.type || '').toString();

      // Enforce .edu emails for student signups (client-side validation)
      if (userType === 'student' && !/\.edu$/i.test(normalizedEmail)) {
        throw new Error('Students must use a .edu email address.');
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/reset-password`,
          data: {
            name: userData.name,
            type: userData.type,
          },
        },
      });

      if (authError) {
        // Map common Supabase errors to clearer messages
        const msg = authError.message?.toLowerCase() || '';
        if (msg.includes('email') && msg.includes('already registered')) {
          throw new Error('This email is already registered. Try logging in or resetting your password.');
        }
        throw new Error(authError.message);
      }

      // If email confirmations are enabled, there might be no active session yet.
      // We don't create profile here to avoid RLS issues; it will be created on first sign-in.
      if (!authData.user) {
        throw new Error('Account created. Please verify your email to continue.');
      }

      // If session exists (email confirmations disabled), ensure profile now
      return await this.ensureProfile(authData.user.id, userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string): Promise<Student | Company> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Provide clearer guidance for common cases
        const msg = authError.message?.toLowerCase() || '';
        if (msg.includes('invalid login credentials')) {
          throw new Error('Invalid email or password.');
        }
        if (msg.includes('email') && msg.includes('confirm')) {
          throw new Error('Email not confirmed. Please check your inbox for the verification email.');
        }
        throw new Error(authError.message || 'Failed to sign in');
      }

      if (!authData.user) {
        throw new Error('Failed to sign in');
      }

      // Ensure profile exists (create if missing)
      return await this.ensureProfile(authData.user.id);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out the current user
  async signOut(): Promise<void> {
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

      // Ensure profile exists
      return await this.ensureProfile(session.user.id);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Student | Company>): Promise<Student | Company> {
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
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const ensured = await supabaseAuthService.ensureProfile(session.user.id);
          callback(ensured);
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

  // Resend email verification link
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
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
