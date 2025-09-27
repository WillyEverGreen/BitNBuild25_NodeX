import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { getUserById, createUser, signInUser, signOutUser, getCurrentUserProfile } from '../services/supabaseService';
import { Student, Company, User } from '../types';

interface AuthContextType {
  user: (Student | Company) | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(Student | Company) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabaseConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
      
      if (!url || !key || url === 'https://placeholder.supabase.co' || key === 'placeholder-key') {
        // Only redirect if we're not already on the setup page
        if (window.location.pathname !== '/setup') {
          console.warn('Supabase not configured. Redirecting to setup page.');
          window.location.href = '/setup';
        }
        return false;
      }
      return true;
    };

    if (!checkSupabaseConfig()) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await getCurrentUserProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const userData = await getCurrentUserProfile();
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInUser(email, password);
      // User state will be updated by onAuthStateChange
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, password: string) => {
    setLoading(true);
    try {
      await createUser(userData, password);
      // User state will be updated by onAuthStateChange
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};