// components/FeedbackStats.js
import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { 
  FaStar, 
  FaComment, 
  FaChartLine, 
  FaUsers, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock,
  FaDownload,
  FaFilter,
  FaSync,
  FaThumbsUp,
  FaThumbsDown,
  FaCalendarAlt,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaRegSmile,
  FaRegMeh,
  FaRegFrown
} from 'react-icons/fa';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  Filler,
  RadialLinearScale
);

const FeedbackStats = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [exporting, setExporting] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  
  useEffect(() => {
    fetchFeedbackStats();
  }, [timeRange]);
  
  const fetchFeedbackStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (timeRange === 'custom') {
        params.append('start_date', dateRange.startDate.toISOString().split('T')[0]);
        params.append('end_date', dateRange.endDate.toISOString().split('T')[0]);
      } else {
        params.append('time_range', timeRange);
      }
      
      const response = await axios.get('http://localhost:8000/api/predictions/feedback/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      
      setStats(response.data);
      analyzeSentiment(response.data.recent_feedback);
    } catch (err) {
      setError('Failed to load feedback statistics');
      console.error('Error fetching feedback stats:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const analyzeSentiment = (feedback) => {
    const sentiment = {
      positive: 0,
      neutral: 0,
      negative: 0,
      total: feedback.length
    };
    
    feedback.forEach(fb => {
      if (fb.rating >= 4) sentiment.positive++;
      else if (fb.rating === 3) sentiment.neutral++;
      else sentiment.negative++;
    });
    
    setSentimentData(sentiment);
  };
  
  const exportData = async () => {
    try {
      setExporting(true);
      const response = await axios.get('http://localhost:8000/api/predictions/feedback/export/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };
  
  const ratingDistributionData = useMemo(() => ({
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      data: [
        stats?.statistics?.rating_distribution[1]?.count || 0,
        stats?.statistics?.rating_distribution[2]?.count || 0,
        stats?.statistics?.rating_distribution[3]?.count || 0,
        stats?.statistics?.rating_distribution[4]?.count || 0,
        stats?.statistics?.rating_distribution[5]?.count || 0
      ],
      backgroundColor: [
        '#EF4444', '#F59E0B', '#FBBF24', '#10B981', '#3B82F6'
      ],
      borderColor: [
        '#DC2626', '#D97706', '#F59E0B', '#059669', '#2563EB'
      ],
      borderWidth: 1,
      borderRadius: 8,
      hoverOffset: 15
    }]
  }), [stats]);
  
  const sentimentChartData = useMemo(() => ({
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [
        sentimentData?.positive || 0,
        sentimentData?.neutral || 0,
        sentimentData?.negative || 0
      ],
      backgroundColor: [
        '#10B981',
        '#F59E0B',
        '#EF4444'
      ],
      borderColor: [
        '#059669',
        '#D97706',
        '#DC2626'
      ],
      borderWidth: 1,
      borderRadius: 8
    }]
  }), [sentimentData]);
  
  const timelineData = useMemo(() => ({
    labels: stats?.timeline_data?.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Feedback',
        data: stats?.timeline_data?.map(item => item.count) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Average Rating',
        data: stats?.timeline_data?.map(item => item.average_rating) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  }), [stats]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading feedback statistics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Statistics</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchFeedbackStats}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!stats) return null;
  
  const getTrendIcon = (current, previous) => {
    if (current > previous) return <FaArrowTrendUp className="text-green-500" />;
    if (current < previous) return <FaArrowTrendDown className="text-red-500" />;
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-600">Monitor and analyze user feedback</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400" />
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-32"
                maxDate={new Date()}
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-32"
                maxDate={new Date()}
                minDate={dateRange.startDate}
              />
            </div>
          )}
          
          <button
            onClick={fetchFeedbackStats}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportData}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <FaDownload className={exporting ? 'animate-spin' : ''} />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced Stats Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.statistics.average_rating.toFixed(1)}</div>
              <div className="text-gray-600 mt-1">Average Rating</div>
              <div className="flex items-center mt-2">
                {getTrendIcon(stats.statistics.average_rating, stats.statistics.previous_average_rating)}
                <span className="text-sm text-gray-500 ml-2">
                  {stats.statistics.previous_average_rating && 
                    `${(stats.statistics.average_rating - stats.statistics.previous_average_rating).toFixed(1)} vs previous`
                  }
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FaStar className="text-2xl text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.statistics.total_feedback}</div>
              <div className="text-gray-600 mt-1">Total Feedback</div>
              <div className="flex items-center mt-2">
                {getTrendIcon(stats.statistics.total_feedback, stats.statistics.previous_total_feedback)}
                <span className="text-sm text-gray-500 ml-2">
                  {stats.statistics.previous_total_feedback && 
                    `${stats.statistics.total_feedback - stats.statistics.previous_total_feedback} vs previous`
                  }
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FaComment className="text-2xl text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg p-6 border border-red-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.statistics.low_ratings}</div>
              <div className="text-gray-600 mt-1">Low Ratings (≤ 2)</div>
              <div className="text-sm text-red-600 mt-2">
                {((stats.statistics.low_ratings / stats.statistics.total_feedback) * 100).toFixed(1)}% of total
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <FaExclamationTriangle className="text-2xl text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.statistics.unreviewed_feedback}</div>
              <div className="text-gray-600 mt-1">Unreviewed</div>
              <div className="text-sm text-yellow-600 mt-2">
                {((stats.statistics.unreviewed_feedback / stats.statistics.total_feedback) * 100).toFixed(1)}% pending
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <FaClock className="text-2xl text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-2 text-primary" />
              Feedback Timeline
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Feedback Count</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Average Rating</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <Line 
              data={timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Feedback Count'
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 5,
                    title: {
                      display: true,
                      text: 'Average Rating'
                    },
                    grid: {
                      drawOnChartArea: false
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: (context) => {
                        if (context.dataset.label === 'Average Rating') {
                          return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                        }
                        return `${context.dataset.label}: ${context.parsed.y}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Sentiment Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <FaUsers className="mr-2 text-primary" />
            Sentiment Analysis
          </h3>
          <div className="h-48 mb-4">
            <Doughnut 
              data={sentimentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  }
                }
              }}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FaRegSmile className="text-green-500 mr-2" />
                <span className="font-medium">Positive</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{sentimentData?.positive || 0}</div>
                <div className="text-sm text-gray-600">
                  {sentimentData ? ((sentimentData.positive / sentimentData.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <FaRegMeh className="text-yellow-500 mr-2" />
                <span className="font-medium">Neutral</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{sentimentData?.neutral || 0}</div>
                <div className="text-sm text-gray-600">
                  {sentimentData ? ((sentimentData.neutral / sentimentData.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <FaRegFrown className="text-red-500 mr-2" />
                <span className="font-medium">Negative</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{sentimentData?.negative || 0}</div>
                <div className="text-sm text-gray-600">
                  {sentimentData ? ((sentimentData.negative / sentimentData.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Rating Distribution</h3>
          <div className="h-64">
            <Pie 
              data={ratingDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">With Comments</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.statistics.feedback_with_comments.count}
              </div>
              <div className="text-sm text-blue-600">
                {stats.statistics.feedback_with_comments.percentage}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-sm text-gray-600">Response Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.statistics.response_rate || 'N/A'}%
              </div>
              <div className="text-sm text-green-600">
                Responses to feedback
              </div>
            </div>
          </div>
        </div>
        
        {/* Common Issues */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-600" />
              Common Issues
            </h3>
            {stats.common_issues && stats.common_issues.length > 0 && (
              <span className="text-sm text-gray-500">
                From low ratings (≤ 2)
              </span>
            )}
          </div>
          
          {stats.common_issues && stats.common_issues.length > 0 ? (
            <div className="space-y-4">
              {stats.common_issues.slice(0, 5).map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{issue.word}</div>
                      <div className="text-sm text-gray-600">{issue.context || 'No context available'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-700">{issue.count}</div>
                    <div className="text-sm text-gray-600">mentions</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaThumbsUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600">No common issues found in low ratings</p>
              <p className="text-sm text-gray-500 mt-1">Great job!</p>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {/* Export low ratings */}}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Export Low Ratings
              </button>
              <button
                onClick={() => {/* Generate report */}}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Generate Report
              </button>
              <button
                onClick={() => {/* View all */}}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                View All Issues
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Feedback Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FaUsers className="mr-2 text-primary" />
              Recent Feedback
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Showing {Math.min(10, stats.recent_feedback.length)} of {stats.recent_feedback.length}
              </span>
              <button
                onClick={() => {/* View all feedback */}}
                className="text-sm text-primary hover:text-primary-dark"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recent_feedback.slice(0, 10).map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {feedback.prediction_details?.top_prediction || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div 
                          className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                          style={{ width: `${feedback.prediction_details?.confidence_score || 0}%` }}
                        ></div>
                      </div>
                      {feedback.prediction_details?.confidence_score}% confidence
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${
                              i < feedback.rating 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {feedback.rating}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {feedback.comment || 'No comment'}
                      </div>
                      {feedback.comment && feedback.comment.length > 50 && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 z-10 max-w-xs">
                          {feedback.comment}
                          <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-primary">
                          {(feedback.user_name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">{feedback.user_name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{feedback.user_email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{feedback.formatted_date}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(feedback.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        feedback.is_reviewed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feedback.is_reviewed ? (
                          <>
                            <FaCheckCircle className="mr-1" />
                            Reviewed
                          </>
                        ) : (
                          <>
                            <FaClock className="mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                      {feedback.helpful !== undefined && (
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          feedback.helpful
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.helpful ? <FaThumbsUp className="mr-1" /> : <FaThumbsDown className="mr-1" />}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {stats.recent_feedback.length === 0 && (
          <div className="text-center py-12">
            <FaComment className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No feedback available yet</p>
            <p className="text-sm text-gray-500 mt-1">Feedback will appear here once users submit it</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackStats;