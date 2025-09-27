import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { createUser, signInUser } from '../services/supabaseService';

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing Supabase connection...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setStatus('Testing Supabase Auth...');
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      setStatus('Testing Supabase Database...');
      
      // Test database connection
      const { data, error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      setStatus('Supabase connection successful! ✅');
    } catch (error: any) {
      setError(`Supabase connection failed: ${error.message}`);
      setStatus('Supabase connection failed ❌');
    }
  };

  const testUserCreation = async () => {
    try {
      setStatus('Testing user creation...');
      
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        type: 'student' as const,
        university: 'Test University',
        year: 3,
        major: 'Computer Science',
        skills: ['React', 'Node.js'],
        rating: 5.0,
        completed_projects: 0,
        total_earnings: 0,
        resume_uploaded: false,
        available_hours: 20,
        is_verified: false
      };

      await createUser(testUser, 'testpassword123');
      setStatus('User creation test successful! ✅');
    } catch (error: any) {
      setError(`User creation failed: ${error.message}`);
      setStatus('User creation failed ❌');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">Status: {status}</p>
          {error && (
            <p className="text-red-600 mt-2">Error: {error}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testSupabaseConnection}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Test Supabase Connection
          </button>
          
          <button
            onClick={testUserCreation}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test User Creation
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Supabase Config:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>Client: {supabase ? '✅ Initialized' : '❌ Not initialized'}</li>
            <li>Auth: {supabase?.auth ? '✅ Available' : '❌ Not available'}</li>
            <li>Database: {supabase?.from ? '✅ Available' : '❌ Not available'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;


