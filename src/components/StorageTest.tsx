import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { uploadChatFile } from '../services/storageService';

const StorageTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [logs, setLogs] = useState<string[]>([]);
  const [fileUrl, setFileUrl] = useState<string>('');

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkBucket = async () => {
    setStatus('Checking bucket...');
    addLog('Checking if chat-files bucket exists...');
    
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        addLog(`❌ Error listing buckets: ${error.message}`);
        setStatus('Error checking bucket');
        return;
      }
      
      addLog(`✅ Found ${data.length} buckets`);
      const chatBucket = data.find(b => b.id === 'chat-files');
      
      if (chatBucket) {
        addLog(`✅ chat-files bucket exists! Public: ${chatBucket.public}`);
        setStatus('Bucket exists');
      } else {
        addLog('❌ chat-files bucket NOT found');
        setStatus('Bucket missing');
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
      setStatus('Error');
    }
  };

  const testUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('Uploading...');
    addLog(`📤 Starting upload: ${file.name} (${file.size} bytes)`);

    try {
      // Test 1: Direct upload to storage
      addLog('Test 1: Direct upload to storage...');
      const filePath = `test/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        addLog(`❌ Upload failed: ${uploadError.message}`);
        setStatus('Upload failed');
        return;
      }

      addLog(`✅ Upload successful! Path: ${uploadData.path}`);

      // Test 2: Get public URL
      addLog('Test 2: Getting public URL...');
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        addLog(`✅ Public URL: ${urlData.publicUrl}`);
        setFileUrl(urlData.publicUrl);
        setStatus('Success!');
      } else {
        addLog('❌ Could not get public URL');
        setStatus('URL generation failed');
      }

      // Test 3: Using our service
      addLog('Test 3: Using uploadChatFile service...');
      const result = await uploadChatFile('test-conversation', file);
      addLog(`✅ Service upload successful! URL: ${result.url}`);

    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
      setStatus('Error: ' + err.message);
    }
  };

  const checkAuth = async () => {
    setStatus('Checking auth...');
    addLog('Checking authentication status...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`❌ Auth error: ${error.message}`);
        return;
      }
      
      if (session?.user) {
        addLog(`✅ Authenticated as: ${session.user.email}`);
        addLog(`   User ID: ${session.user.id}`);
        addLog(`   Role: ${session.user.role}`);
      } else {
        addLog('❌ Not authenticated');
      }
    } catch (err: any) {
      addLog(`❌ Exception: ${err.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setFileUrl('');
    setStatus('Ready to test');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Storage Upload Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <p className="text-lg font-semibold mb-2">Status: <span className="text-blue-600">{status}</span></p>
        </div>

        <div className="space-y-3">
          <button
            onClick={checkAuth}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            1. Check Authentication
          </button>

          <button
            onClick={checkBucket}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            2. Check Storage Bucket
          </button>

          <div>
            <label className="block mb-2 font-medium">3. Test File Upload:</label>
            <input
              type="file"
              onChange={testUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <button
            onClick={clearLogs}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {fileUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-green-800 mb-2">✅ File uploaded successfully!</p>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {fileUrl}
          </a>
        </div>
      )}

      <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Console Logs:</h2>
          <span className="text-gray-500">{logs.length} entries</span>
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Run a test above.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="py-1 border-b border-gray-800">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-900">
          <li>Click "Check Authentication" - you must be logged in</li>
          <li>Click "Check Storage Bucket" - chat-files bucket must exist</li>
          <li>Select a file to upload - watch the logs for errors</li>
          <li>If any step fails, the logs will show the exact error</li>
        </ol>
      </div>
    </div>
  );
};

export default StorageTest;
