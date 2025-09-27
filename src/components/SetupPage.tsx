import React, { useState, useEffect } from 'react';

const SetupPage: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing values from localStorage
    const savedUrl = localStorage.getItem('supabase_url');
    const savedKey = localStorage.getItem('supabase_key');
    
    if (savedUrl) setSupabaseUrl(savedUrl);
    if (savedKey) setSupabaseKey(savedKey);
  }, []);

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setError('Please enter both Supabase URL and Anon Key');
      return;
    }

    setStatus('Testing connection...');
    setError('');

    try {
      // Create a temporary client with the provided credentials
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(supabaseUrl, supabaseKey);

      // Test the connection
      const { data, error: testError } = await testClient
        .from('users')
        .select('count')
        .limit(1);

      if (testError) {
        throw new Error(`Database error: ${testError.message}`);
      }

      setStatus('✅ Connection successful!');
      setError('');
    } catch (err: any) {
      setError(`Connection failed: ${err.message}`);
      setStatus('❌ Connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Supabase Setup Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure your Supabase credentials to continue
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700">
                Supabase URL
              </label>
              <input
                id="supabase-url"
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700">
                Supabase Anon Key
              </label>
              <input
                id="supabase-key"
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="your-anon-key"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={testConnection}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Test Connection
              </button>
              <button
                onClick={() => {
                  if (supabaseUrl && supabaseKey) {
                    localStorage.setItem('supabase_url', supabaseUrl);
                    localStorage.setItem('supabase_key', supabaseKey);
                    setStatus('✅ Configuration saved! Redirecting...');
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 1000);
                  } else {
                    setError('Please enter both Supabase URL and Anon Key');
                  }
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Save & Continue
              </button>
            </div>

            {status && (
              <div className={`p-3 rounded-md ${status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">How to get your credentials:</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
              <li>2. Create a new project or select existing one</li>
              <li>3. Go to Settings → API</li>
              <li>4. Copy your Project URL and anon public key</li>
              <li>5. Paste them above and test the connection</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
