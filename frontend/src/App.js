import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobPrediction from './pages/JobPrediction';
import Profile from './pages/Profile';
import Community from './pages/Community';
import About from './pages/About';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Debug from './pages/Debug';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import PredictionLogs from './pages/admin/PredictionLogs';
import SystemLogs from './pages/admin/SystemLogs';
import ModelManagement from './pages/admin/ModelManagement';

// User Pages
import PredictionHistory from './pages/PredictionHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/debug" element={<Debug />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Routes (Regular Users) */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/job-prediction" element={
                <PrivateRoute>
                  <JobPrediction />
                </PrivateRoute>
              } />
              
              <Route path="/prediction-history" element={
                <PrivateRoute>
                  <PredictionHistory />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/community" element={
                <PrivateRoute>
                  <Community />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/predictions" element={
                <AdminRoute>
                  <PredictionLogs />
                </AdminRoute>
              } />
              
              <Route path="/admin/logs" element={
                <AdminRoute>
                  <SystemLogs />
                </AdminRoute>
              } />
              
              <Route path="/admin/models" element={
                <AdminRoute>
                  <ModelManagement />
                </AdminRoute>
              } />
              
              {/* Catch all route - Redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;