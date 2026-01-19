// AuthContext.js - COMPLETE FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: true
  });
  const navigate = useNavigate();

  // API Configuration
  const API_URL = 'http://localhost:8000/api';
  
  // Configure axios defaults
  useEffect(() => {
    const token = authState.token || localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Axios authorization header set');
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  const initializeAuth = () => {
    console.log('🔍 Initializing auth from localStorage...');
    
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    console.log('📦 Storage check - Token:', token ? `✅ Found (${token.substring(0, 20)}...)` : '❌ Missing');
    console.log('📦 Storage check - User:', userStr ? '✅ Found' : '❌ Missing');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('👤 User loaded from storage:', userData.email);
        
        // Update auth state
        setAuthState({
          user: userData,
          token: token,
          refreshToken: refreshToken,
          isAuthenticated: true,
          loading: false
        });
        
        console.log('✅ Auth initialized successfully');
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        clearAuth();
      }
    } else {
      console.log('ℹ️ No auth data found in storage');
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false
      });
    }
  };

  const testBackend = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/test/`);
      console.log('✅ Backend is running:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const backendOk = await testBackend();
      if (!backendOk) {
        return { 
          success: false, 
          error: 'Backend server is not responding' 
        };
      }

      const response = await axios.post(`${API_URL}/auth/login/`, {
        email,
        password,
      });
      
      console.log('✅ Login response received');
      
      const { user, tokens } = response.data;
      
      // Save everything to localStorage
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('📦 Data saved to localStorage');
      
      // Update auth state
      setAuthState({
        user: user,
        token: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        loading: false
      });
      
      console.log('✅ Login successful, user:', user.email);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.detail || 
               'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration:', userData);
      
      const backendOk = await testBackend();
      if (!backendOk) {
        return { 
          success: false, 
          error: 'Backend server is not responding' 
        };
      }

      const response = await axios.post(`${API_URL}/auth/register/`, userData);
      
      console.log('✅ Registration response received');
      
      const { user, tokens } = response.data;
      
      // Save everything to localStorage
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth state
      setAuthState({
        user: user,
        token: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        loading: false
      });
      
      console.log('✅ Registration successful, user:', user.email);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      
      if (error.response?.data?.details) {
        const errors = error.response.data.details;
        const errorMessages = Object.keys(errors).map(key => 
          `${key}: ${errors[key].join(', ')}`
        );
        return { 
          success: false, 
          error: errorMessages.join('. ') 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 
               'Registration failed. Please try again.' 
      };
    }
  };

  // FIXED: Google OAuth callback handler - SIMPLIFIED VERSION
  const handleGoogleCallback = async (code) => {
    try {
      console.log('🔄 Processing Google callback with code...');
      
      const backendOk = await testBackend();
      if (!backendOk) {
        console.error('❌ Backend not responding');
        return { 
          success: false, 
          error: 'Backend server is not responding' 
        };
      }

      console.log('📡 Sending code to backend...');
      
      const response = await axios.post(`${API_URL}/auth/google/`, {
        code: code,
      });
      
      console.log('✅ Google auth response received');
      
      if (!response.data.tokens || !response.data.user) {
        console.error('❌ Invalid response from server:', response.data);
        throw new Error('Invalid response from server');
      }
      
      const { user, tokens } = response.data;
      
      // CRITICAL FIX: Save to localStorage FIRST
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('📦 Auth data saved to localStorage');
      console.log('👤 User saved:', user.email);
      
      // CRITICAL FIX: Return SUCCESS IMMEDIATELY without complex state updates
      // Let the OAuthCallback page handle the redirect
      return { 
        success: true, 
        data: response.data,
        user: user,
        tokens: tokens
      };
      
    } catch (error) {
      console.error('❌ Google callback error:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.details || 
               error.message || 
               'Google authentication failed.' 
      };
    }
  };

  const clearAuth = () => {
    console.log('🧹 Clearing auth data...');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear state
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false
    });
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    clearAuth();
    navigate('/login', { replace: true });
  };

  // Initialize auth on mount
  useEffect(() => {
    console.log('🚀 AuthProvider mounted, initializing auth...');
    initializeAuth();
  }, []);

  const value = {
    user: authState.user,
    token: authState.token,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'admin' || authState.user?.is_superuser,
    login,
    register,
    handleGoogleCallback,
    logout,
    testBackend,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};