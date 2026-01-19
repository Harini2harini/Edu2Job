import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaGoogle,
  FaArrowRight,
  FaHome,
  FaSignInAlt,
  FaUserCheck,
  FaShieldAlt
} from 'react-icons/fa';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing Google login...');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const { handleGoogleCallback } = useAuth();

  // Get redirect path from localStorage or default
  const getRedirectPath = () => {
    const savedPath = localStorage.getItem('redirectAfterLogin');
    const validPaths = ['/dashboard', '/profile', '/home', '/admin'];
    
    if (savedPath && validPaths.some(path => savedPath.startsWith(path))) {
      return savedPath;
    }
    return '/dashboard';
  };

  // Enhanced OAuth processing with better error handling
  const processOAuth = async () => {
    try {
      console.log('🔄 Starting enhanced OAuth processing...');
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');
      const state = urlParams.get('state');
      
      console.log('📊 OAuth Parameters:', { 
        hasCode: !!code, 
        hasState: !!state,
        error: errorParam 
      });

      // Handle OAuth errors from Google
      if (errorParam) {
        let errorMessage = `Google authentication error: ${errorParam}`;
        
        // User-friendly error messages
        const errorMap = {
          'access_denied': 'You denied access to your Google account.',
          'invalid_request': 'Invalid authentication request.',
          'unauthorized_client': 'This app is not authorized.',
          'unsupported_response_type': 'Unsupported response type.',
          'invalid_scope': 'Invalid permissions requested.',
          'server_error': 'Google authentication server error.'
        };
        
        if (errorMap[errorParam]) {
          errorMessage = errorMap[errorParam];
        }
        
        throw new Error(errorMessage);
      }

      // Check for authorization code
      if (!code) {
        // Check if user is already logged in (page refresh scenario)
        const existingToken = localStorage.getItem('token');
        const existingUser = localStorage.getItem('user');
        
        if (existingToken && existingUser) {
          console.log('✅ User already authenticated, redirecting...');
          setStatus('success');
          setMessage('Already logged in! Redirecting...');
          startRedirectCountdown();
          return;
        }
        
        throw new Error('No authorization code received from Google. Please try again.');
      }

      setMessage('Verifying credentials with Google...');
      setProgress(30);

      // Process with backend
      const result = await handleGoogleCallback(code);
      
      if (result.success) {
        console.log('✅ OAuth successful! User:', result.user?.email);
        setProgress(80);
        
        // Update message based on user
        if (result.user) {
          setMessage(`Welcome back, ${result.user.name || result.user.email}!`);
        } else {
          setMessage('Login successful! Redirecting...');
        }
        
        setStatus('success');
        setProgress(100);
        
        // Start redirect countdown
        startRedirectCountdown();
        
      } else {
        // Handle specific backend errors
        let errorMsg = result.error || 'Authentication failed';
        
        if (errorMsg.includes('Invalid token') || errorMsg.includes('expired')) {
          errorMsg = 'The authentication link has expired. Please try again.';
        } else if (errorMsg.includes('already exists') || errorMsg.includes('registered')) {
          errorMsg = 'This email is already registered. Please try logging in with email/password.';
        } else if (errorMsg.includes('domain') || errorMsg.includes('organization')) {
          errorMsg = 'Please use your organization email address.';
        }
        
        throw new Error(errorMsg);
      }
      
    } catch (err) {
      console.error('❌ OAuth processing error:', err);
      
      // Set error state
      setStatus('error');
      setMessage('Login failed');
      setError(err.message);
      
      // Cleanup on error
      localStorage.removeItem('redirectAfterLogin');
      
      // Auto-retry for network errors
      if (err.message.includes('network') || err.message.includes('connection')) {
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    }
  };

  // Start countdown for redirect
  const startRedirectCountdown = () => {
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(timer);
        performRedirect();
      }
    }, 1000);
  };

  // Perform the actual redirect
  const performRedirect = () => {
    const redirectPath = getRedirectPath();
    console.log(`🚀 Redirecting to: ${redirectPath}`);
    
    // Clean up
    localStorage.removeItem('redirectAfterLogin');
    
    // Use window.location.replace for guaranteed navigation
    window.location.replace(redirectPath);
  };

  // Manual redirect button handler
  const handleManualRedirect = () => {
    setCountdown(0);
    performRedirect();
  };

  // Retry login
  const handleRetry = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Run on component mount
  useEffect(() => {
    console.log('🚀 Enhanced OAuthCallback mounted');
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      processOAuth();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation for progress bar
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90; // Cap at 90% until success
          return prev + 1;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [status]);

  // Render loading screen
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaGoogle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Google Authentication</h1>
                <p className="text-white/90">Connecting to your account</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <FaSpinner className="w-20 h-20 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaShieldAlt className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Securing Connection</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaUserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Identity</p>
                  <p className="text-xs text-gray-500">Verifying</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaShieldAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Security</p>
                  <p className="text-xs text-gray-500">Encrypted</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaArrowRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Redirect</p>
                  <p className="text-xs text-gray-500">Preparing</p>
                </div>
              </div>
              
              {/* Help text */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  <span className="inline-block animate-pulse">⏳</span> This may take a few moments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render success screen
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <FaCheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
              <p className="text-white/90">Authentication Successful</p>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  <span className="text-green-600">✓</span> Login Successful
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {/* Countdown timer */}
                <div className="mb-8">
                  <div className="text-5xl font-bold text-green-600 mb-4 animate-bounce">
                    {countdown}
                  </div>
                  <p className="text-gray-500">Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(3 - countdown) * 33.33}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleManualRedirect}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3 font-semibold"
                >
                  <FaArrowRight className="w-5 h-5" />
                  Go to Dashboard Now
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Skip wait
                  </span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <FaHome className="w-4 h-4" />
                    Home
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="bg-blue-50 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  >
                    <FaUserCheck className="w-4 h-4" />
                    Profile
                  </button>
                </div>
              </div>
              
              {/* Security note */}
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start gap-3">
                  <FaShieldAlt className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Secure Connection</p>
                    <p className="text-xs text-green-600 mt-1">
                      Your login is secured with end-to-end encryption. You're being redirected to a protected area.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error screen
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Oops!</h1>
              <p className="text-white/90">Authentication Failed</p>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Login Unsuccessful</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                
                {/* Error details */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-6">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3 font-semibold"
                >
                  <FaSignInAlt className="w-5 h-5" />
                  Try Login Again
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-blue-50 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    Login Page
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <FaHome className="w-4 h-4" />
                    Home
                  </button>
                </div>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  ↻ Refresh Page
                </button>
              </div>
              
              {/* Troubleshooting tips */}
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting Tips:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Clear browser cache and cookies</li>
                  <li>• Try using a different browser</li>
                  <li>• Ensure third-party cookies are enabled</li>
                  <li>• Check your internet connection</li>
                  <li>• Contact support if issue persists</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Add CSS animations (add to your global CSS or in a style tag)
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
`;

export default OAuthCallback;