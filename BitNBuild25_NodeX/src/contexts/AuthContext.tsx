import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, Company, User } from '../types';

interface AuthContextType {
  user: (Student | Company) | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
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

// Mock data for demonstration
const mockUsers: (Student | Company)[] = [
  {
    id: '1',
    email: 'john@university.edu',
    name: 'John Smith',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    type: 'student',
    university: 'University of California',
    year: 3,
    major: 'Computer Science',
    skills: ['React', 'Node.js', 'Python', 'UI/UX Design'],
    interests: ['Web Development', 'Mobile Apps', 'AI/ML'],
    rating: 4.8,
    completedProjects: 12,
    totalEarnings: 5640,
    resumeUploaded: true,
    portfolio: [],
    badges: [],
    availableHours: 20,
    createdAt: '2024-01-15',
    isVerified: true
  },
  {
    id: '2',
    email: 'contact@techcorp.com',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    type: 'company',
    companyName: 'TechCorp Solutions',
    industry: 'Technology',
    website: 'https://techcorp.com',
    contactPerson: 'Sarah Johnson',
    postedProjects: 8,
    totalSpent: 15400,
    createdAt: '2024-01-10',
    isVerified: true
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(Student | Company) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('gigcampus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('gigcampus_user', JSON.stringify(foundUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        isVerified: false
      };
      
      setUser(newUser);
      localStorage.setItem('gigcampus_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gigcampus_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};