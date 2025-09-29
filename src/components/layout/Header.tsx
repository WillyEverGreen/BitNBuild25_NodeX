import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, MessageCircle, User, Settings, LogOut, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">GigCampus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            
            {user.type === 'student' && (
              <>
                <Link
                  to="/projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/projects')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Browse Projects
                </Link>
                <Link
                  to="/my-bids"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-bids')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Bids
                </Link>
                <Link
                  to="/portfolio"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/portfolio')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Portfolio
                </Link>
              </>
            )}

            {user.type === 'company' && (
              <>
                <Link
                  to="/post-project"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/post-project')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Post Project
                </Link>
                <Link
                  to="/my-projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-projects')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Projects
                </Link>
              </>
            )}

            <Link
              to="/messages"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/messages')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Messages
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-blue-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Messages */}
            <button className="p-2 text-gray-600 hover:text-blue-600 relative">
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>
              
              {user.type === 'student' && (
                <>
                  <Link
                    to="/projects"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/projects')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Browse Projects
                  </Link>
                  <Link
                    to="/my-bids"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/my-bids')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Bids
                  </Link>
                  <Link
                    to="/portfolio"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/portfolio')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Portfolio
                  </Link>
                </>
              )}

              {user.type === 'company' && (
                <>
                  <Link
                    to="/post-project"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/post-project')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Post Project
                  </Link>
                  <Link
                    to="/my-projects"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/my-projects')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Projects
                  </Link>
                </>
              )}

              <Link
                to="/messages"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/messages')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Messages
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;