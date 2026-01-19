import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  MenuButton, 
  MenuItem, 
  MenuItems 
} from '@headlessui/react';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaInfoCircle, 
  FaHome,
  FaBars,
  FaTimes,
  FaUserShield,
  FaHistory,
  FaFileUpload,
  FaChartBar
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation links without Community
  const navLinks = [
    { path: '/', label: 'Home', icon: <FaHome className="w-4 h-4" /> },
    { path: '/dashboard', label: 'Dashboard', icon: <FaChartBar className="w-4 h-4" /> },
    { path: '/job-prediction', label: 'Job Prediction', icon: <FaFileUpload className="w-4 h-4" /> },
    { path: '/prediction-history', label: 'Prediction History', icon: <FaHistory className="w-4 h-4" /> },
    { path: '/about', label: 'About', icon: <FaInfoCircle className="w-4 h-4" /> },
  ];

  // Check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E2J</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Edu<span className="text-secondary">2</span>Job</h1>
                <p className="text-xs text-gray-500 -mt-1">AI Career Platform</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${isActive(link.path) 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }
                `}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.path === '/dashboard' && user && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 text-xs rounded-full">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden md:flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors duration-300"
                  >
                    <FaUserShield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center space-x-3 focus:outline-none group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                      </p>
                    </div>
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg border border-gray-200 py-2 focus:outline-none z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Welcome back!</p>
                    </div>
                    
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/dashboard"
                          className={`flex items-center space-x-3 px-4 py-3 ${
                            focus ? 'bg-gray-50' : ''
                          }`}
                        >
                          <FaChartBar className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/profile"
                          className={`flex items-center space-x-3 px-4 py-3 ${
                            focus ? 'bg-gray-50' : ''
                          }`}
                        >
                          <FaUser className="w-4 h-4 text-gray-500" />
                          <span>Profile</span>
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/prediction-history"
                          className={`flex items-center space-x-3 px-4 py-3 ${
                            focus ? 'bg-gray-50' : ''
                          }`}
                        >
                          <FaHistory className="w-4 h-4 text-gray-500" />
                          <span>Prediction History</span>
                        </Link>
                      )}
                    </MenuItem>
                    <div className="border-t border-gray-200 my-2"></div>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={handleLogout}
                          className={`flex items-center space-x-3 w-full px-4 py-3 text-red-600 ${
                            focus ? 'bg-red-50' : ''
                          }`}
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-md transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-gray-200 py-4 bg-white"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors
                    ${isActive(link.path) 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }
                  `}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Member'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                    >
                      <FaUserShield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <FaUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium hover:shadow-md"
                  >
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;