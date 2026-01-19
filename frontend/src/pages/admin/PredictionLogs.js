import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaDatabase,
  FaSearch,
  FaEye,
  FaFlag,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaCalendar,
  FaUser,
  FaDownload,
} from 'react-icons/fa';

const PredictionLogs = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/predictions/`);
      setPredictions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = searchTerm === '' || 
      prediction.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(prediction.prediction_result).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prediction.status === filterStatus;
    
    const matchesDate = (!dateRange.start && !dateRange.end) || 
      (!dateRange.start || new Date(prediction.created_at) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(prediction.created_at) <= new Date(dateRange.end));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleFlagPrediction = async (predictionId) => {
    try {
      await axios.post(`${API_URL}/admin/predictions/${predictionId}/flag/`, {
        flag_reason: 'admin_review',
        flag_details: 'Flagged by admin for manual review'
      });
      
      setPredictions(predictions.map(p => 
        p.id === predictionId ? { ...p, status: 'flagged', is_flagged: true } : p
      ));
    } catch (error) {
      console.error('Error flagging prediction:', error);
    }
  };

  const handleResolvePrediction = async (predictionId) => {
    try {
      await axios.patch(`${API_URL}/admin/predictions/${predictionId}/`, {
        status: 'resolved',
        reviewed_by: 'admin'
      });
      
      setPredictions(predictions.map(p => 
        p.id === predictionId ? { ...p, status: 'resolved' } : p
      ));
    } catch (error) {
      console.error('Error resolving prediction:', error);
    }
  };

  const exportPredictions = () => {
    const dataStr = JSON.stringify(predictions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `predictions_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <FaFlag className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaChartLine className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading predictions...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Prediction Logs</h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage all job prediction requests
              </p>
            </div>
            <button
              onClick={exportPredictions}
              className="mt-4 md:mt-0 flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FaDownload />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search predictions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Predictions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prediction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {filteredPredictions.map((prediction) => (
                  <motion.tr
                    key={prediction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {prediction.user_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prediction.user_email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {prediction.prediction_result?.job_role || 
                         prediction.prediction_result?.top_prediction ||
                         'No prediction data'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Model: {prediction.model_name || 'Default'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                            style={{ width: `${prediction.confidence_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(prediction.confidence_score || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(prediction.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          prediction.status === 'success' ? 'bg-green-100 text-green-800' :
                          prediction.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prediction.status?.charAt(0).toUpperCase() + prediction.status?.slice(1) || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="w-3 h-3 mr-1" />
                        {new Date(prediction.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {prediction.status !== 'flagged' && (
                        <button
                          onClick={() => handleFlagPrediction(prediction.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50"
                          title="Flag for Review"
                        >
                          <FaFlag className="w-4 h-4" />
                        </button>
                      )}
                      {prediction.status === 'flagged' && (
                        <button
                          onClick={() => handleResolvePrediction(prediction.id)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                          title="Mark as Resolved"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPredictions.length === 0 && (
            <div className="text-center py-12">
              <FaDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions found</h3>
              <p className="text-gray-500">
                {searchTerm || dateRange.start || dateRange.end || filterStatus !== 'all' 
                  ? 'Try changing your filters' 
                  : 'No prediction logs available'}
              </p>
            </div>
          )}

          {/* Stats Summary */}
          {filteredPredictions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredPredictions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredPredictions.filter(p => p.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredPredictions.filter(p => p.status === 'flagged').length}
                  </div>
                  <div className="text-sm text-gray-600">Flagged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredPredictions.filter(p => p.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts and Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Success Rate Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Success Rate</h3>
            <div className="space-y-4">
              {['success', 'flagged', 'failed'].map((status) => {
                const count = filteredPredictions.filter(p => p.status === status).length;
                const percentage = filteredPredictions.length > 0 
                  ? (count / filteredPredictions.length * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status} Predictions</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full ${
                          status === 'success' ? 'bg-green-500' :
                          status === 'flagged' ? 'bg-yellow-500' :
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

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prediction Activity</h3>
            <div className="space-y-4">
              {filteredPredictions.slice(0, 5).map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      {prediction.user_name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prediction.prediction_result?.job_role || 'No role predicted'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {(prediction.confidence_score || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prediction.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionLogs;