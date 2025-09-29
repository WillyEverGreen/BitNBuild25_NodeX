import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseAuthService } from "../services/supabaseAuthService";
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const currentUser = await supabaseAuthService.getCurrentUser();

        setUser(currentUser);

        // Listen for auth state changes
        const { data: { subscription } } = supabaseAuthService.onAuthStateChange((user) => {
          setUser(user);
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
      const supaUser = await supabaseAuthService.signIn(email, password);
      setUser(supaUser);
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
      const supaUser = await supabaseAuthService.signUp(userData.email, password, userData);
      if (!supaUser) {
        setUser(null);
        return;
      }
      setUser(supaUser);
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
      const currentUser = await supabaseAuthService.getCurrentUser();
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
