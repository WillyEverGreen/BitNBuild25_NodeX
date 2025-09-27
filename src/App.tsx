import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import HomePage from "./components/HomePage";
import SetupPage from "./components/SetupPage";
import LocalStorageTest from "./components/SupabaseTest";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import CompanyDashboard from "./components/dashboard/CompanyDashboard";
import ProjectBrowser from "./components/projects/ProjectBrowser";
import ProjectDetail from "./components/projects/ProjectDetail";
import ProjectBids from "./components/projects/ProjectBids";
import ChatInterface from "./components/chat/ChatInterface";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import MyBids from "./components/pages/MyBids";
import MyProjects from "./components/pages/MyProjects";
import PostProject from "./components/pages/PostProject";
import Profile from "./components/pages/Profile";
import Messages from "./components/pages/Messages";
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
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes with navbar */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="company-dashboard" element={<CompanyDashboard />} />
              <Route path="projects" element={<ProjectBrowser />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/bids" element={<ProjectBids />} />
              <Route path="my-bids" element={<MyBids />} />
              <Route path="my-projects" element={<MyProjects />} />
              <Route path="post-project" element={<PostProject />} />
              <Route path="profile" element={<Profile />} />
              <Route path="messages" element={<Messages />} />
              <Route path="chat" element={<ChatInterface />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
