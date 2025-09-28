import React, { useState } from "react";
import { initializeSampleData } from "../services/supabaseService";

const SetupPage: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [isSetup, setIsSetup] = useState(false);
  const [error] = useState("");

  const handleSetup = async () => {
    try {
      setStatus("Setting up local storage...");

      // Initialize sample data
      initializeSampleData();

      setStatus("✅ Setup complete! Local storage is ready to use.");
      setIsSetup(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      setStatus(`❌ Setup failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            App Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Initialize the app with sample data
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to get started?
              </h3>
              <p className="text-sm text-gray-600">
                This will initialize the app with sample data for testing.
              </p>
            </div>

            <button
              onClick={handleSetup}
              disabled={isSetup}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSetup ? "Setting up..." : "Initialize App"}
            </button>

            {status && (
              <div
                className={`p-3 rounded-md ${
                  status.includes("✅")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
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
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              What this does:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Creates sample users (student and company)</li>
              <li>• Adds example projects and opportunities</li>
              <li>• Sets up the local storage system</li>
              <li>• Prepares the app for immediate use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
