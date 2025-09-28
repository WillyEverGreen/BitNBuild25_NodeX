import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAuthService } from '../services/supabaseAuthService';

const SupabaseAuthTest: React.FC = () => {
  const { user, login, register, logout, loading } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testName, setTestName] = useState('Test User');
  const [testType, setTestType] = useState<'student' | 'company'>('student');
  const [message, setMessage] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTestRegister = async () => {
    setAuthStatus('testing');
    setMessage('');
    
    try {
      const userData = {
        email: testEmail,
        name: testName,
        type: testType,
        ...(testType === 'student' ? {
          university: 'Test University',
          year: 3,
          major: 'Computer Science',
          skills: ['React', 'Node.js'],
        } : {
          company_name: 'Test Company',
          industry: 'Technology',
          contact_person: testName,
        })
      };

      await register(userData, testPassword);
      setMessage('Registration successful! Check your email for verification.');
      setAuthStatus('success');
    } catch (error: any) {
      setMessage(`Registration failed: ${error.message}`);
      setAuthStatus('error');
    }
  };

  const handleTestLogin = async () => {
    setAuthStatus('testing');
    setMessage('');
    
    try {
      await login(testEmail, testPassword);
      setMessage('Login successful!');
      setAuthStatus('success');
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`);
      setAuthStatus('error');
    }
  };

  const handleTestLogout = async () => {
    setAuthStatus('testing');
    setMessage('');
    
    try {
      await logout();
      setMessage('Logout successful!');
      setAuthStatus('success');
    } catch (error: any) {
      setMessage(`Logout failed: ${error.message}`);
      setAuthStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (authStatus) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '⏳';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Supabase Authentication Test</h2>
      
      {/* Current User Status */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current User Status:</h3>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : user ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Type:</strong> {user.type}</p>
            <p><strong>ID:</strong> {user.id}</p>
            {user.type === 'student' && (
              <p><strong>University:</strong> {(user as any).university}</p>
            )}
            {user.type === 'company' && (
              <p><strong>Company:</strong> {(user as any).company_name}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No user logged in</p>
        )}
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Registration Test */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test Registration</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'student' | 'company')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleTestRegister}
              disabled={authStatus === 'testing'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Register
            </button>
          </div>
        </div>

        {/* Login/Logout Test */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Test Login/Logout</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleTestLogin}
                disabled={authStatus === 'testing'}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test Login
              </button>
              <button
                onClick={handleTestLogout}
                disabled={authStatus === 'testing'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Test Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          authStatus === 'success' ? 'bg-green-50 border-green-200' :
          authStatus === 'error' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className={`font-medium ${getStatusColor()}`}>{message}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Make sure your Supabase project is set up with the updated schema</li>
          <li>Run the SQL from <code>supabase-schema.sql</code> in your Supabase SQL editor</li>
          <li>Test registration first - you'll receive an email verification link</li>
          <li>Click the verification link in your email</li>
          <li>Then test login with the same credentials</li>
          <li>Test logout to verify session management</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseAuthTest;
