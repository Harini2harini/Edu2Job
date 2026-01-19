import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaServer,
  FaSearch,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBug,
  FaCalendar,
  FaTrash,
  FaDownload,
  FaEye,
  FaDatabase,
  FaCode
} from 'react-icons/fa';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/system-logs/`);
      setLogs(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      try {
        // In a real app, you would call an API endpoint to clear logs
        // For now, just clear the local state
        setLogs([]);
      } catch (error) {
        console.error('Error clearing logs:', error);
      }
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `system_logs_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <FaExclamationTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <FaBug className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaInfoCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'database':
        return <FaDatabase className="w-4 h-4" />;
      case 'api':
        return <FaCode className="w-4 h-4" />;
      default:
        return <FaServer className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
              <p className="text-gray-600 mt-2">
                Monitor system events, errors, and activities
              </p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={exportLogs}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaDownload />
                <span>Export Logs</span>
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash />
                <span>Clear Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Logs
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search log messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="model_training">Model Training</option>
                <option value="prediction">Prediction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 ${
                      log.level === 'error' || log.level === 'critical' ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLevelIcon(log.level)}
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(log.category)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {log.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.message}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Details: {JSON.stringify(log.details).substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.source || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="w-3 h-3 mr-1" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                        title="View Details"
                        onClick={() => {
                          alert(JSON.stringify(log.details || 'No additional details', null, 2));
                        }}
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FaServer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No system logs found</h3>
              <p className="text-gray-500">
                {searchTerm || filterLevel !== 'all' || filterCategory !== 'all'
                  ? 'Try changing your filters'
                  : 'No system logs available'}
              </p>
            </div>
          )}
        </div>

        {/* Stats and Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Log Levels Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Levels Distribution</h3>
            <div className="space-y-4">
              {['info', 'warning', 'error', 'critical'].map((level) => {
                const count = logs.filter(l => l.level === level).length;
                const percentage = logs.length > 0 ? (count / logs.length * 100).toFixed(1) : 0;
                
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{level} Logs</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full ${
                          level === 'info' ? 'bg-blue-500' :
                          level === 'warning' ? 'bg-yellow-500' :
                          level === 'error' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Categories</h3>
            <div className="space-y-3">
              {Array.from(new Set(logs.map(l => l.category))).map((category) => {
                const count = logs.filter(l => l.category === category).length;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(category)}
                      <span className="ml-2 text-sm capitalize">
                        {category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Critical Logs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Critical Logs</h3>
            <div className="space-y-3">
              {logs
                .filter(l => l.level === 'critical' || l.level === 'error')
                .slice(0, 5)
                .map((log) => (
                  <div key={log.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-800 capitalize">
                        {log.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-red-600">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 truncate">{log.message}</p>
                  </div>
                ))}
              
              {logs.filter(l => l.level === 'critical' || l.level === 'error').length === 0 && (
                <p className="text-gray-500 text-center py-4">No critical logs found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;