// googleoauth.js - Enhanced with better click protection
import React, { useState, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleOAuth = ({ buttonText = "Continue with Google" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const clickTimer = useRef(null);
  const isProcessing = useRef(false);

  const handleGoogleLogin = async () => {
    // Prevent multiple clicks within 3 seconds
    if (isProcessing.current) {
      console.log('Google login already in progress, please wait...');
      return;
    }
    
    // Clear any existing timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    
    isProcessing.current = true;
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting Google OAuth flow...');
      
      // First, clear any old OAuth state
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_timestamp');
      localStorage.removeItem('redirectAfterLogin');
      
      // Get current timestamp
      const timestamp = Date.now();
      localStorage.setItem('oauth_timestamp', timestamp.toString());
      
      // Check for recent OAuth attempts (within last 10 seconds)
      const lastOAuthAttempt = localStorage.getItem('last_oauth_attempt');
      if (lastOAuthAttempt && (timestamp - parseInt(lastOAuthAttempt)) < 10000) {
        console.log('⚠️ Too many OAuth attempts, please wait...');
        setIsLoading(false);
        isProcessing.current = false;
        return;
      }
      
      localStorage.setItem('last_oauth_attempt', timestamp.toString());
      
      const clientId = '687089464534-nlvqi1mhdfcjsi00e1c33fiq9fgp1dp4.apps.googleusercontent.com';
      const redirectUri = 'http://localhost:3000/oauth/callback';
      
      console.log('🔑 Google OAuth - Client ID:', clientId);
      console.log('🔄 Google OAuth - Redirect URI:', redirectUri);
      
      // Build Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      // Generate a more secure state parameter
      const state = btoa(JSON.stringify({
        timestamp: timestamp,
        random: Math.random().toString(36).substring(2, 15),
        origin: window.location.origin
      }));
      
      localStorage.setItem('oauth_state', state);
      
      // Required parameters
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'email profile openid');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'select_account'); // Changed to select_account
      authUrl.searchParams.append('state', state);
      
      // Store the current page to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      
      console.log('🌐 Redirecting to Google OAuth...');
      
      // Add a small delay before redirect to ensure state is saved
      clickTimer.current = setTimeout(() => {
        window.location.href = authUrl.toString();
      }, 300);
      
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      setIsLoading(false);
      isProcessing.current = false;
      
      // Clear the processing flag after error
      setTimeout(() => {
        isProcessing.current = false;
      }, 3000);
    }
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-md active:scale-95 ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      title={isLoading ? "Please wait..." : "Sign in with Google"}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600">Connecting...</span>
        </>
      ) : (
        <>
          <FcGoogle className="w-5 h-5" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleOAuth;