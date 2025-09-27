import React, { useState, useEffect } from "react";
import {
  getCurrentUser,
  initializeSampleData,
} from "../services/localStorageService";

const LocalStorageTest: React.FC = () => {
  const [status, setStatus] = useState<string>(
    "Testing localStorage connection..."
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    testLocalStorageConnection();
  }, []);

  const testLocalStorageConnection = async () => {
    try {
      setStatus("Testing localStorage functionality...");

      // Initialize sample data
      initializeSampleData();

      setStatus("Testing user authentication...");

      // Test getting current user
      await getCurrentUser();

      setStatus("localStorage connection successful! ✅");
      setStatus((prev) => prev + "\n🎉 Local storage is properly configured!");
      setStatus((prev) => prev + "\n📝 Sample data has been initialized");
      setStatus((prev) => prev + "\n🔐 Ready for user registration and login");
    } catch (error: any) {
      setError(`localStorage connection failed: ${error.message}`);
      setStatus("localStorage connection failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          🗄️ Local Storage Test
        </h1>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Connection Status
            </h2>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap">
              {status}
            </pre>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              ✅ Ready to Use
            </h2>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• User registration and login</li>
              <li>• Project management</li>
              <li>• Bid system</li>
              <li>• Real-time updates (simulated)</li>
              <li>• Offline functionality</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              🔐 Test Credentials
            </h2>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>
                <strong>Student:</strong> student@test.edu / password123
              </p>
              <p>
                <strong>Company:</strong> company@test.com / password123
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocalStorageTest;
