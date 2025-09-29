import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseAuthService } from "../services/supabaseAuthService";
import { initializeSampleData as initializeSupabaseData } from "../services/supabaseService";
import { initializeSampleData as initializeLocalData } from "../services/localStorageService";
import { getCurrentUser as getCurrentUserLocal, signInUser as signInLocal, createUser as createUserLocal } from "../services/localStorageService";
import { Student, Company } from "../types";

interface AuthContextType {
  user: (Student | Company) | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(Student | Company) | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize sample data only for the active backend
        if (isSupabaseConfigured) {
          await initializeSupabaseData();
        } else {
          initializeLocalData();
        }

        // Check for existing session strictly from Supabase if configured
        let currentUser: (Student | Company) | null = null;
        if (isSupabaseConfigured) {
          currentUser = await supabaseAuthService.getCurrentUser();
        } else {
          currentUser = await getCurrentUserLocal();
        }

        setUser(currentUser);

        // Listen for auth state changes
        const { data: { subscription } } = supabaseAuthService.onAuthStateChange((user) => {
          // When Supabase is configured, only trust Supabase sessions
          if (isSupabaseConfigured) {
            setUser(user);
          } else {
            setUser(user);
          }
        });

        // Cleanup subscription on unmount
        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // If Supabase is configured, do NOT fallback to localStorage (enforce real session)
      if (isSupabaseConfigured) {
        const supaUser = await supabaseAuthService.signIn(email, password);
        // Extra guard: enforce verified email
        if (!supaUser?.is_verified) {
          // signIn already throws a clear error for unconfirmed email, but keep guard
          throw new Error('Email not confirmed. Please verify your email to continue.');
        }
        setUser(supaUser);
      } else {
        // Local-only mode
        const localUser = await signInLocal(email, password);
        setUser(localUser);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supaUser = await supabaseAuthService.signUp(userData.email, password, userData);
        // If email confirmations are enabled, signUp will likely not return a session. Force user to verify.
        if (!supaUser) {
          // Keep UI consistent: no local placeholder user
          setUser(null);
          return;
        }
        setUser(supaUser);
      } else {
        const localUser = await createUserLocal(userData, password);
        setUser(localUser);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseAuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      let currentUser: (Student | Company) | null = null;
      if (isSupabaseConfigured) {
        currentUser = await supabaseAuthService.getCurrentUser();
      } else {
        currentUser = await getCurrentUserLocal();
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
