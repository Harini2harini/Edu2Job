import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaHistory, FaChartLine, FaStar, FaCalendarAlt,
  FaArrowRight, FaEye, FaDownload, FaCheckCircle ,
  FaFilter, FaSearch, FaSortAmountDown
} from 'react-icons/fa';

const PredictionHistory = () => {
  const { user, token } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/predictions/history/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.predictions) {
        setPredictions(response.data.predictions);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = pred.top_prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pred.input_data?.degree_field?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || pred.top_prediction === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'confidence':
        return b.confidence_score - a.confidence_score;
      case 'role':
        return a.top_prediction.localeCompare(b.top_prediction);
      default:
        return 0;
    }
  });

  const uniqueRoles = [...new Set(predictions.map(p => p.top_prediction))];

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Prediction History</h1>
                <p className="text-white/80">
                  Track your career predictions and analyze your growth journey
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  to="/job-prediction"
                  className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <FaChartLine className="mr-2" />
                  Make New Prediction
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaHistory className="text-blue-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{predictions.length}</div>
                <div className="text-gray-600">Total Predictions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaStar className="text-green-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {predictions.length > 0 
                    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length)
                    : 0}%
                </div>
                <div className="text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{uniqueRoles.length}</div>
                <div className="text-gray-600">Unique Roles</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <FaCalendarAlt className="text-yellow-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {predictions.length > 0 
                    ? new Date(predictions[0].created_at).toLocaleDateString()
                    : 'N/A'}
                </div>
                <div className="text-gray-600">Last Prediction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                Search Predictions
              </label>
              <input
                type="text"
                placeholder="Search by job role or field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline mr-2" />
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSortAmountDown className="inline mr-2" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="date">Most Recent</option>
                <option value="confidence">Highest Confidence</option>
                <option value="role">Job Role</option>
              </select>
            </div>
          </div>
        </div>

        {/* Predictions List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {sortedPredictions.length === 0 ? (
            <div className="text-center py-12">
              <FaHistory className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Predictions Yet</h3>
              <p className="text-gray-600 mb-6">Make your first prediction to see your history here.</p>
              <Link
                to="/job-prediction"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                <FaChartLine className="mr-2" />
                Make Your First Prediction
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predicted Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPredictions.map((prediction) => (
                    <motion.tr
                      key={prediction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(prediction.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(prediction.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {prediction.top_prediction}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prediction.input_data?.highest_degree} in {prediction.input_data?.degree_field}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceBgColor(prediction.confidence_score)}`}>
                          {prediction.confidence_score}%
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          GPA: {prediction.input_data?.gpa_score || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Exp: {prediction.input_data?.total_experience_years || 0} years
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedPrediction(prediction)}
                            className="text-primary hover:text-primary-dark"
                            title="View Details"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => {/* Download functionality */}}
                            className="text-gray-600 hover:text-gray-900"
                            title="Download Report"
                          >
                            <FaDownload className="w-5 h-5" />
                          </button>
                          
                          <Link
                            to={`/job-prediction`}
                            state={{ fromHistory: true, predictionData: prediction.input_data }}
                            className="text-green-600 hover:text-green-900"
                            title="Re-run Prediction"
                          >
                            <FaArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Prediction Details Modal */}
        {selectedPrediction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Prediction Details</h2>
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white mb-6">
                      <h3 className="text-xl font-bold mb-2">{selectedPrediction.top_prediction}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{selectedPrediction.confidence_score}%</div>
                          <div className="text-white/80">Confidence Score</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">Predicted on</div>
                          <div className="font-semibold">
                            {new Date(selectedPrediction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Input Profile</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Education</div>
                            <div className="font-medium">
                              {selectedPrediction.input_data?.highest_degree} in {selectedPrediction.input_data?.degree_field}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">GPA</div>
                            <div className="font-medium">{selectedPrediction.input_data?.gpa_score || 'N/A'}/10</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Experience</div>
                            <div className="font-medium">{selectedPrediction.input_data?.total_experience_years || 0} years</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Industry</div>
                            <div className="font-medium">{selectedPrediction.input_data?.industry || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Top Skills Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedPrediction.input_data || {})
                            .filter(([key, value]) => key.startsWith('skill_') && value > 5)
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {key.replace('skill_', '').replace('_', ' ').title()}: {value}/10
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">All Predictions</h4>
                      <div className="space-y-3">
                        {selectedPrediction.all_predictions?.map((pred, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                index === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{pred.job_role}</div>
                                <div className="text-sm text-gray-500">
                                  ${pred.salary_range?.min?.toLocaleString()} - ${pred.salary_range?.max?.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className={`font-bold ${getConfidenceColor(pred.confidence_score)}`}>
                              {pred.confidence_score}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Recommendations</h4>
                      {selectedPrediction.missing_skills?.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-gray-600">Skills to develop:</p>
                          <ul className="space-y-2">
                            {selectedPrediction.missing_skills.map((skill, index) => (
                              <li key={index} className="flex items-center text-gray-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                {skill}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              <strong>Training Required:</strong> {selectedPrediction.training_required}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                          <p className="text-gray-600">Great profile match! No major skill gaps detected.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {/* Download full report */}}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
                  >
                    Download Full Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;