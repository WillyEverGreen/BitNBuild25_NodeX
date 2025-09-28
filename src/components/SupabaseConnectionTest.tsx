import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Test basic connection by trying to fetch from a table
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (error) {
        // If table doesn't exist, that's expected - just means we need to set up the schema
        if (error.code === '42P01') {
          setConnectionStatus('connected');
          setErrorMessage('Connected to Supabase! Database schema needs to be set up.');
        } else {
          setConnectionStatus('error');
          setErrorMessage(`Database error: ${error.message}`);
        }
      } else {
        setConnectionStatus('connected');
        setTestData(data);
        setErrorMessage('Successfully connected to Supabase and fetched data!');
      }
    } catch (err) {
      setConnectionStatus('error');
      setErrorMessage(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            Status: {connectionStatus.toUpperCase()}
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <div className="space-y-1 text-sm">
            <div>
              <strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Connection Details:</h3>
          <div className="space-y-1 text-sm">
            <div><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
            <div><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'}</div>
          </div>
        </div>

        {errorMessage && (
          <div className={`p-4 rounded-lg ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            <strong>Message:</strong> {errorMessage}
          </div>
        )}

        {testData && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Data:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={testConnection}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Connection Again
        </button>

        {connectionStatus === 'connected' && !testData && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy the contents of <code>supabase-schema.sql</code> from your project</li>
              <li>Paste and run the SQL to create the database tables</li>
              <li>Refresh this page to test data operations</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;
