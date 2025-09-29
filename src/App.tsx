import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import HomePage from "./components/HomePage";
import SetupPage from "./components/SetupPage";
import LocalStorageTest from "./components/SupabaseTest";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";
import SupabaseAuthTest from "./components/SupabaseAuthTest";
import StorageTest from "./components/StorageTest";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import CompanyDashboard from "./components/dashboard/CompanyDashboard";
import DashboardRedirect from "./components/dashboard/DashboardRedirect";
import ProjectBrowser from "./components/projects/ProjectBrowser";
import ProjectDetail from "./components/projects/ProjectDetail";
import ProjectBids from "./components/projects/ProjectBids";
import ProjectCompletion from "./components/projects/ProjectCompletion";
import EnhancedChatInterface from "./components/chat/EnhancedChatInterface";
import CompanyWallet from "./components/wallet/CompanyWallet";
import StudentWallet from "./components/wallet/StudentWallet";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import MyBids from "./components/pages/MyBids";
import MyProjects from "./components/pages/MyProjects";
import PostProject from "./components/pages/PostProject";
import Profile from "./components/pages/Profile";
// Route Messages to chat interface for simpler UX
import PaymentsRedirect from "./components/pages/PaymentsRedirect";
import NotFound from "./components/pages/NotFound";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes without navbar */}
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/test" element={<LocalStorageTest />} />
            <Route path="/supabase-test" element={<SupabaseConnectionTest />} />
            <Route path="/auth-test" element={<SupabaseAuthTest />} />
            <Route path="/storage-test" element={<StorageTest />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes with navbar */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardRedirect />} />
              <Route path="student-dashboard" element={<StudentDashboard />} />
              <Route path="company-dashboard" element={<CompanyDashboard />} />
              <Route path="projects" element={<ProjectBrowser />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/bids" element={<ProjectBids />} />
              <Route path="projects/:id/complete" element={<ProjectCompletion />} />
              <Route path="my-bids" element={<MyBids />} />
              <Route path="my-projects" element={<MyProjects />} />
              <Route path="post-project" element={<PostProject />} />
              <Route path="profile" element={<Profile />} />
              <Route path="messages" element={<EnhancedChatInterface />} />
              <Route path="payments" element={<PaymentsRedirect />} />
              <Route path="chat" element={<EnhancedChatInterface />} />
              <Route path="wallet" element={<StudentWallet />} />
              <Route path="company-wallet" element={<CompanyWallet />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
