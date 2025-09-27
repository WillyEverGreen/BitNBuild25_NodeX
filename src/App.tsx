import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './components/HomePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import SupabaseTest from './components/SupabaseTest';
import SetupPage from './components/SetupPage';
import StudentDashboard from './components/dashboard/StudentDashboard';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import ProjectBrowser from './components/projects/ProjectBrowser';
import ProjectDetail from './components/projects/ProjectDetail';
import ChatInterface from './components/chat/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard Router
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.type === 'student') {
    return <StudentDashboard />;
  } else if (user?.type === 'company') {
    return <CompanyDashboard />;
  }
  
  return <Navigate to="/login" replace />;
};

// Placeholder Components
const MyBids: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
    <p className="text-gray-600 mt-2">Track your project bids and their status</p>
  </div>
);

const Portfolio: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
    <p className="text-gray-600 mt-2">Showcase your completed projects and skills</p>
  </div>
);

const PostProject: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">Post a Project</h1>
    <p className="text-gray-600 mt-2">Create a new project and hire talented students</p>
  </div>
);

const MyProjects: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
    <p className="text-gray-600 mt-2">Manage your posted projects and hired students</p>
  </div>
);

const Messages: React.FC = () => <ChatInterface />;

const Profile: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
    <p className="text-gray-600 mt-2">Manage your profile information and settings</p>
  </div>
);

const Settings: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
    <p className="text-gray-600 mt-2">Configure your account preferences</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/supabase-test" element={<SupabaseTest />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projects" element={<ProjectBrowser />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/my-bids" element={<MyBids />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/post-project" element={<PostProject />} />
                        <Route path="/my-projects" element={<MyProjects />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;