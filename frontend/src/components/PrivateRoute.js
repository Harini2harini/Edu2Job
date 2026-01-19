// PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);

  useEffect(() => {
    console.log('🔐 PrivateRoute State:');
    console.log('- Loading:', loading);
    console.log('- User from context:', user ? `✅ ${user.email}` : '❌ None');
    console.log('- Token from localStorage:', localStorage.getItem('token') ? '✅ Found' : '❌ Missing');
    console.log('- User from localStorage:', localStorage.getItem('user') ? '✅ Found' : '❌ Missing');
    console.log('- Path:', window.location.pathname);

    // Check if user data exists in localStorage (fallback)
    const localStorageUser = localStorage.getItem('user');
    const localStorageToken = localStorage.getItem('token');
    
    if (localStorageUser && localStorageToken && !user) {
      console.log('⚠️ User data in localStorage but not in context - will redirect to login');
      // If we have localStorage data but context doesn't have user, redirect to login
      setShouldRedirect(true);
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [user, loading, redirectTimer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  // Check if we should redirect
  if (shouldRedirect) {
    console.log('🔀 Redirecting to login due to auth state mismatch');
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    setRedirectTimer(timer);
    return null;
  }

  // Check authentication - look for user in context OR localStorage
  const hasAuth = user || localStorage.getItem('user');
  
  console.log('🔐 Final auth check in PrivateRoute:');
  console.log('- Has user in context:', !!user);
  console.log('- Has user in localStorage:', !!localStorage.getItem('user'));
  console.log('- Has token in localStorage:', !!localStorage.getItem('token'));
  console.log('- HasAuth result:', hasAuth);

  if (!hasAuth) {
    console.log('🚫 Not authenticated, redirecting to login');
    // Force a hard redirect to ensure login page loads fresh
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    return null;
  }

  console.log('✅ User is authenticated, rendering protected content');
  
  // If we have localStorage data but not context, try to force a state update
  if (!user && localStorage.getItem('user')) {
    console.log('🔄 Attempting to sync auth state from localStorage');
    setTimeout(() => {
      window.location.reload(); // Force reload to sync state
    }, 100);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-600">Syncing authentication state...</span>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;