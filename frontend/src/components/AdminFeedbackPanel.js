import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaStar,
  FaDatabase,
  FaDownload,
  FaChartLine,
  FaComments,
  FaThumbsUp,
  FaThumbsDown,
  FaUser,
  FaEye,
  FaTrash,
  FaCalendar,
  FaTag,
  FaSortAmountDown,
  FaSearch,
  FaExclamationCircle,
  FaSmile,
  FaMeh,
  FaFrown,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaHistory,
  FaBrain,
  FaRobot
} from 'react-icons/fa';

const AdminFeedbackPanel = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'insights'
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchFeedback();
    fetchFeedbackStats();
  }, [filterRating, dateRange]);

  // Fetch feedback from multiple sources
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      let allFeedback = [];

      // Try to fetch from the feedback API endpoint first
      try {
        const feedbackResponse = await axios.get(`${API_URL}/predictions/feedback/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (feedbackResponse.data && Array.isArray(feedbackResponse.data)) {
          allFeedback = feedbackResponse.data.map(fb => ({
            ...fb,
            source: 'api',
            type: 'prediction_feedback'
          }));
        }
      } catch (error) {
        console.log('Feedback API endpoint not available, trying alternatives...');
      }

      // Try to fetch from prediction history
      try {
        const historyResponse = await axios.get(`${API_URL}/predictions/history/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          const historyFeedback = historyResponse.data
            .filter(prediction => prediction.feedback_rating || prediction.feedback_comment)
            .map(prediction => ({
              id: prediction.id,
              user_email: prediction.user_email,
              prediction_id: prediction.id,
              rating: prediction.feedback_rating || 0,
              comment: prediction.feedback_comment || '',
              submitted_at: prediction.prediction_date || new Date().toISOString(),
              prediction_details: {
                job_role: prediction.top_prediction || prediction.predicted_role,
                confidence: prediction.confidence_score || 0.85
              },
              source: 'history',
              type: 'prediction_feedback',
              helpful: prediction.feedback_rating >= 3,
              would_recommend: prediction.feedback_rating >= 4,
              accuracy_match: prediction.feedback_rating || 3
            }));
          
          allFeedback = [...allFeedback, ...historyFeedback];
        }
      } catch (error) {
        console.log('History endpoint not available:', error.message);
      }

      // Check localStorage for feedback
      try {
        const localFeedback = JSON.parse(localStorage.getItem('predictionFeedback') || '[]');
        const formattedLocalFeedback = localFeedback.map(fb => ({
          id: fb.prediction_id || `local_${Date.now()}_${Math.random()}`,
          user_email: fb.user_email || 'Anonymous',
          prediction_id: fb.prediction_id,
          rating: fb.rating || 0,
          comment: fb.comment || '',
          submitted_at: fb.timestamp || new Date().toISOString(),
          prediction_details: {
            job_role: 'Unknown',
            confidence: 0.85
          },
          source: 'localStorage',
          type: 'prediction_feedback',
          helpful: fb.rating >= 3,
          would_recommend: fb.rating >= 4,
          accuracy_match: fb.rating || 3,
          is_anonymous: !fb.user_email
        }));
        
        allFeedback = [...allFeedback, ...formattedLocalFeedback];
      } catch (error) {
        console.log('Error reading local feedback:', error);
      }

      // Apply filters
      let filteredFeedback = allFeedback;
      
      // Filter by rating
      if (filterRating !== 'all') {
        const minRating = parseInt(filterRating);
        filteredFeedback = filteredFeedback.filter(fb => fb.rating >= minRating);
      }

      // Filter by date range
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        filteredFeedback = filteredFeedback.filter(fb => 
          new Date(fb.submitted_at) >= startDate
        );
      }

      // Sort feedback
      if (sortBy === 'newest') {
        filteredFeedback.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      } else if (sortBy === 'oldest') {
        filteredFeedback.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
      } else if (sortBy === 'rating_high') {
        filteredFeedback.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'rating_low') {
        filteredFeedback.sort((a, b) => a.rating - b.rating);
      }

      // Apply search filter
      if (searchTerm) {
        filteredFeedback = filteredFeedback.filter(fb => 
          fb.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.prediction_details?.job_role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFeedback(filteredFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = () => {
    // Calculate statistics from the feedback data
    if (feedback.length === 0) {
      setStats({
        total_feedback: 0,
        average_ratings: { overall: 0 },
        helpfulness: { helpful: 0, helpful_percentage: 0 },
        recommendation_rate: { percentage: 0 },
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const total = feedback.length;
    const avgRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / total;
    const helpfulCount = feedback.filter(fb => fb.helpful).length;
    const recommendationCount = feedback.filter(fb => fb.would_recommend).length;
    
    // Rating distribution
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach(fb => {
      if (fb.rating >= 1 && fb.rating <= 5) {
        ratingDist[fb.rating]++;
      }
    });

    setStats({
      total_feedback: total,
      average_ratings: { overall: avgRating.toFixed(1) },
      helpfulness: {
        helpful: helpfulCount,
        helpful_percentage: ((helpfulCount / total) * 100).toFixed(1)
      },
      recommendation_rate: {
        percentage: ((recommendationCount / total) * 100).toFixed(1)
      },
      rating_distribution: ratingDist,
      sources: {
        api: feedback.filter(fb => fb.source === 'api').length,
        history: feedback.filter(fb => fb.source === 'history').length,
        localStorage: feedback.filter(fb => fb.source === 'localStorage').length
      }
    });
  };

  useEffect(() => {
    if (feedback.length > 0) {
      fetchFeedbackStats();
    }
  }, [feedback]);

  const deleteFeedback = async (feedbackId, source) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        if (source === 'localStorage') {
          // Remove from localStorage
          const localFeedback = JSON.parse(localStorage.getItem('predictionFeedback') || '[]');
          const updatedFeedback = localFeedback.filter(fb => 
            !(fb.prediction_id === feedbackId.replace('local_', '').split('_')[0])
          );
          localStorage.setItem('predictionFeedback', JSON.stringify(updatedFeedback));
        } else if (source === 'history') {
          // Try to remove from history
          try {
            await axios.delete(`${API_URL}/predictions/history/${feedbackId}/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          } catch (error) {
            console.log('Could not delete from history, but continuing...');
          }
        } else if (source === 'api') {
          // Try to delete from feedback API
          try {
            await axios.delete(`${API_URL}/predictions/feedback/${feedbackId}/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          } catch (error) {
            console.log('Could not delete from API, but continuing...');
          }
        }
        
        // Remove from local state
        setFeedback(feedback.filter(fb => fb.id !== feedbackId));
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback');
      }
    }
  };

  const exportFeedback = () => {
    const dataStr = JSON.stringify(feedback, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `feedback_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (rating) => {
    if (rating >= 4) return <FaSmile className="text-green-500" />;
    if (rating >= 3) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

  const getSourceBadge = (source) => {
    const badges = {
      'api': { color: 'bg-blue-100 text-blue-800', label: 'API' },
      'history': { color: 'bg-green-100 text-green-800', label: 'History' },
      'localStorage': { color: 'bg-purple-100 text-purple-800', label: 'Local' }
    };
    
    const badge = badges[source] || { color: 'bg-gray-100 text-gray-800', label: source };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Feedback Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and analyze user feedback for predictions and system performance
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={exportFeedback}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FaDownload />
            <span>Export Feedback</span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'insights' : 'list')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaChartLine />
            <span>{viewMode === 'list' ? 'View Insights' : 'View List'}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && showStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Feedback Statistics</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_feedback}</div>
                  <div className="text-gray-600">Total Feedback</div>
                </div>
                <FaComments className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.average_ratings.overall}</div>
                  <div className="text-gray-600">Avg Rating</div>
                </div>
                <FaStar className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-sm text-gray-600">
                {renderStars(Math.round(stats.average_ratings.overall))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.helpfulness.helpful_percentage}%</div>
                  <div className="text-gray-600">Helpful</div>
                </div>
                <FaThumbsUp className="w-10 h-10 text-purple-500" />
              </div>
              <div className="text-sm text-gray-600">
                {stats.helpfulness.helpful} / {stats.total_feedback} feedbacks
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.recommendation_rate.percentage}%</div>
                  <div className="text-gray-600">Recommend</div>
                </div>
                <FaChartLine className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.sources ? Object.values(stats.sources).reduce((a, b) => a + b, 0) : 0}
                  </div>
                  <div className="text-gray-600">Sources</div>
                </div>
                <FaDatabase className="w-10 h-10 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0;
                const percentage = stats.total_feedback > 0 ? (count / stats.total_feedback * 100) : 0;
                return (
                  <div key={rating} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(rating)}
                        <span className="font-medium">⭐ {rating} stars</span>
                        <span className="text-gray-500">({count})</span>
                      </div>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full ${
                          rating >= 4 ? 'bg-green-500' :
                          rating >= 3 ? 'bg-yellow-500' :
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

          {/* Data Sources */}
          {stats.sources && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Sources</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{stats.sources.api || 0}</div>
                  <div className="text-sm text-gray-600">API Feedback</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{stats.sources.history || 0}</div>
                  <div className="text-sm text-gray-600">Prediction History</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{stats.sources.localStorage || 0}</div>
                  <div className="text-sm text-gray-600">Local Storage</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && fetchFeedback()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 stars only</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
              <option value="1">1+ stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                fetchFeedback();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Table or Insights View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((fb) => (
                  <motion.tr
                    key={fb.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FaUser className="text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {fb.is_anonymous || !fb.user_email || fb.user_email === 'Anonymous' ? 'Anonymous' : fb.user_email.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500">
                            {fb.is_anonymous || !fb.user_email || fb.user_email === 'Anonymous' ? 'Hidden' : fb.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fb.prediction_details?.job_role || 'Unknown Prediction'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fb.prediction_details?.confidence 
                          ? `Confidence: ${(fb.prediction_details.confidence * 100).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {renderStars(fb.rating)}
                        <span className={`font-medium ${getRatingColor(fb.rating)}`}>
                          {fb.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSourceBadge(fb.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="w-3 h-3 mr-1" />
                        {new Date(fb.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedFeedback(fb)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFeedback(fb.id, fb.source)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                        title="Delete Feedback"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {feedback.length === 0 && (
            <div className="text-center py-12">
              <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">
                {searchTerm || filterRating !== 'all' || dateRange !== 'all'
                  ? 'Try changing your filters'
                  : 'No user feedback available yet. Feedback will appear here when users rate predictions.'}
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600">Feedback is collected from:</p>
                <div className="flex justify-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <FaRobot className="w-3 h-3 mr-1" />
                    Prediction API
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <FaHistory className="w-3 h-3 mr-1" />
                    History
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <FaBrain className="w-3 h-3 mr-1" />
                    Local Storage
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Insights View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Analysis */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaSmile className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium">Positive</div>
                    <div className="text-sm text-gray-600">Rating 4-5</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {feedback.filter(fb => fb.rating >= 4).length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.total_feedback > 0 
                      ? `${((feedback.filter(fb => fb.rating >= 4).length / stats.total_feedback) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaMeh className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="font-medium">Neutral</div>
                    <div className="text-sm text-gray-600">Rating 3</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {feedback.filter(fb => fb.rating === 3).length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.total_feedback > 0 
                      ? `${((feedback.filter(fb => fb.rating === 3).length / stats.total_feedback) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaFrown className="w-8 h-8 text-red-500" />
                  <div>
                    <div className="font-medium">Negative</div>
                    <div className="text-sm text-gray-600">Rating 1-2</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {feedback.filter(fb => fb.rating <= 2).length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.total_feedback > 0 
                      ? `${((feedback.filter(fb => fb.rating <= 2).length / stats.total_feedback) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Trends</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Most Common Rating</span>
                  <span>
                    {Object.entries(stats.rating_distribution).reduce((a, b) => 
                      a[1] > b[1] ? a : b, [0, 0]
                    )[0]} stars
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Feedback with Comments</span>
                  <span>
                    {feedback.filter(fb => fb.comment && fb.comment.trim() !== '').length}
                    {' '}
                    ({stats.total_feedback > 0 
                      ? `${((feedback.filter(fb => fb.comment && fb.comment.trim() !== '').length / stats.total_feedback) * 100).toFixed(1)}%`
                      : '0%'})
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Average Comments Length</span>
                  <span>
                    {feedback.filter(fb => fb.comment).length > 0
                      ? Math.round(feedback.filter(fb => fb.comment).reduce((sum, fb) => 
                          sum + (fb.comment?.length || 0), 0) / 
                          feedback.filter(fb => fb.comment).length)
                      : 0} chars
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedFeedback.is_anonymous || !selectedFeedback.user_email || selectedFeedback.user_email === 'Anonymous' 
                          ? 'Anonymous User' 
                          : selectedFeedback.user_email.split('@')[0]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedFeedback.is_anonymous || !selectedFeedback.user_email || selectedFeedback.user_email === 'Anonymous'
                          ? 'Email hidden'
                          : selectedFeedback.user_email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Source</div>
                      <div className="font-medium">
                        {getSourceBadge(selectedFeedback.source)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{selectedFeedback.rating}</div>
                    <div className="text-gray-600">Overall Rating</div>
                    <div className="mt-2">
                      {renderStars(selectedFeedback.rating)}
                    </div>
                  </div>
                  <div className="h-16 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getSentimentIcon(selectedFeedback.rating)}
                    </div>
                    <div className="text-gray-600">
                      {selectedFeedback.rating >= 4 ? 'Very Satisfied' : 
                       selectedFeedback.rating >= 3 ? 'Satisfied' : 'Dissatisfied'}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {selectedFeedback.comment && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User Comments</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                    </div>
                  </div>
                )}

                {/* Prediction Details */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Related Prediction</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Job Role</div>
                      <div className="font-medium">{selectedFeedback.prediction_details?.job_role || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="font-medium">
                        {selectedFeedback.prediction_details?.confidence 
                          ? `${(selectedFeedback.prediction_details.confidence * 100).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-center text-sm text-gray-500">
                  Submitted on {new Date(selectedFeedback.submitted_at).toLocaleString()}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => deleteFeedback(selectedFeedback.id, selectedFeedback.source)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Delete Feedback
                </button>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPanel;