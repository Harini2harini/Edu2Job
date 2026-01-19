import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Debug = () => {
  const { testBackend, user } = useAuth();
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const checkBackend = async () => {
    addLog('Testing backend connection...');
    const result = await testBackend();
    if (result) {
      setBackendStatus('✅ Connected');
      addLog('Backend is running properly');
    } else {
      setBackendStatus('❌ Not Connected');
      addLog('Backend is not responding');
    }
  };

  const checkGoogleConfig = () => {
    addLog('Checking Google OAuth configuration...');
    const clientId = '687089464534-nlvqi1mhdfcjsi00e1c33fiq9fgp1dp4.apps.googleusercontent.com';
    addLog(`Google Client ID: ${clientId ? '✅ Set' : '❌ Missing'}`);
    addLog(`Redirect URI: http://localhost:3000/oauth/callback`);
  };

  useEffect(() => {
    checkBackend();
    checkGoogleConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">System Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium mr-2">Backend:</span>
                <span className={backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {backendStatus}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Frontend:</span>
                <span className="text-green-600">✅ Running</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">User Status:</span>
                <span className={user ? 'text-green-600' : 'text-yellow-600'}>
                  {user ? `✅ Logged in as ${user.email}` : '❌ Not logged in'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={checkBackend}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Backend Connection
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Registration Page
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click buttons above to test.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;