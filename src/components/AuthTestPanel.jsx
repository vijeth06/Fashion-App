import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { testFirebaseConnection, testGoogleLogin } from '../utils/authDebug';

const AuthTestPanel = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [testResults, setTestResults] = useState('');

  const handleTestLogin = async () => {
    setTestResults('Testing login...');
    try {
      const result = await signIn(email, password);
      setTestResults(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResults('Error: ' + error.message);
    }
  };

  const handleTestSignup = async () => {
    setTestResults('Testing signup...');
    try {
      const result = await signUp(email, password, 'Test User');
      setTestResults(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResults('Error: ' + error.message);
    }
  };

  const handleTestGoogle = async () => {
    setTestResults('Testing Google login...');
    try {
      const result = await testGoogleLogin();
      setTestResults(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResults('Error: ' + error.message);
    }
  };

  const handleTestConnection = () => {
    testFirebaseConnection();
    setTestResults('Check console for connection details');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="text-lg font-bold mb-3">ðŸ§ª Auth Test Panel</h3>
      
      {user ? (
        <div className="mb-3">
          <p className="text-green-600">âœ… User: {user.email}</p>
          <button 
            onClick={signOut}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-red-600">âŒ No user signed in</p>
          <div className="space-y-2 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <button 
          onClick={handleTestConnection}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Connection
        </button>
        <button 
          onClick={handleTestLogin}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Login
        </button>
        <button 
          onClick={handleTestSignup}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Signup
        </button>
        <button 
          onClick={handleTestGoogle}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Google
        </button>
      </div>
      
      {testResults && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
          <pre>{testResults}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthTestPanel;