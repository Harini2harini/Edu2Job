import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaUserGraduate, 
  FaFileUpload, 
  FaCalendarAlt,
  FaArrowRight,
  FaChartBar,
  FaHistory,
  FaTasks,
  FaLightbulb,
  FaStar,
  FaFire,
  FaBullseye,
  FaRocket,
  FaSearch,
  FaCrown,
  FaRegClock,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Constants for better maintainability
const STAT_CARDS = [
  {
    title: 'Prediction Accuracy',
    key: 'predictionAccuracy',
    icon: FaBullseye,
    color: 'blue',
    trend: '+2.4%',
    trendUp: true
  },
  {
    title: 'High Confidence Matches',
    key: 'highConfidenceMatches',
    icon: FaStar,
    color: 'amber',
    trend: '+3',
    trendUp: true
  },
  {
    title: 'Job Matches',
    key: 'jobMatches',
    icon: FaFire,
    color: 'red',
    link: '/job-matches'
  },
  {
    title: 'Skill Gaps',
    key: 'skillGap',
    icon: FaUserGraduate,
    color: 'purple',
    link: '/learning-path'
  },
  {
    title: 'Total Predictions',
    key: 'totalPredictions',
    icon: FaChartBar,
    color: 'indigo',
    link: '/prediction-history'
  },
  {
    title: 'Avg Confidence',
    key: 'avgConfidence',
    icon: FaChartLine,
    color: 'green',
    trend: '+5%',
    trendUp: true
  }
];

const TIME_FILTERS = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
];

const QUICK_ACTIONS = [
  { 
    icon: FaFileUpload, 
    title: 'Update Profile', 
    description: 'Boost match score',
    color: 'blue',
    link: '/profile'
  },
  { 
    icon: FaChartBar, 
    title: 'View Analytics', 
    description: 'Detailed insights',
    color: 'green',
    link: '/analytics'
  },
  { 
    icon: FaUserGraduate, 
    title: 'Learning Path', 
    description: 'Close skill gaps',
    color: 'purple',
    link: '/learning-path'
  },
  { 
    icon: FaFileUpload, 
    title: 'New Prediction', 
    description: 'Upload resume',
    color: 'amber',
    link: '/job-prediction'
  },
];

const SKILL_GAPS = [
  { skill: 'Machine Learning', current: 65, target: 85, priority: 'High' },
  { skill: 'Cloud Computing', current: 40, target: 75, priority: 'Medium' },
  { skill: 'Data Visualization', current: 70, target: 90, priority: 'High' },
];

const RECOMMENDED_JOBS = [
  { 
    id: 1, 
    title: 'Senior Data Scientist', 
    company: 'TechCorp AI', 
    match: 96,
    salary: '$140k - $180k',
    location: 'Remote',
    type: 'Full-time',
    posted: '2 days ago',
    skills: ['Python', 'TensorFlow', 'SQL'],
    isHot: true
  },
  { 
    id: 2, 
    title: 'Machine Learning Engineer', 
    company: 'AI Solutions Inc', 
    match: 92,
    salary: '$130k - $160k',
    location: 'New York, NY',
    type: 'Full-time',
    posted: '1 week ago',
    skills: ['PyTorch', 'AWS', 'MLOps'],
    isFeatured: true
  },
  { 
    id: 3, 
    title: 'AI Research Engineer', 
    company: 'Innovation Labs', 
    match: 88,
    salary: '$150k - $190k',
    location: 'San Francisco, CA',
    type: 'Full-time',
    posted: '3 days ago',
    skills: ['Research', 'NLP', 'Deep Learning']
  },
  { 
    id: 4, 
    title: 'Data Analytics Lead', 
    company: 'DataWorks Corp', 
    match: 85,
    salary: '$120k - $150k',
    location: 'Remote',
    type: 'Full-time',
    posted: '5 days ago',
    skills: ['Tableau', 'SQL', 'Python']
  },
];

// Memoized components for better performance
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <FaRocket className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse text-xl" />
      </div>
      <p className="mt-6 text-gray-600 font-medium">Preparing your dashboard...</p>
      <p className="text-sm text-gray-500 mt-2">Loading AI insights and predictions</p>
    </div>
  </div>
));

const StatCard = React.memo(({ stat, value, index }) => {
  const Icon = stat.icon;
  const colorClasses = {
    blue: { bg: 'from-blue-50 via-blue-100 to-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    amber: { bg: 'from-amber-50 via-amber-100 to-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    red: { bg: 'from-red-50 via-red-100 to-red-50', text: 'text-red-700', icon: 'text-red-500' },
    purple: { bg: 'from-purple-50 via-purple-100 to-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
    indigo: { bg: 'from-indigo-50 via-indigo-100 to-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
    green: { bg: 'from-green-50 via-green-100 to-green-50', text: 'text-green-700', icon: 'text-green-500' },
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`${colorClasses[stat.color].bg} rounded-2xl p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50 relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className={`text-2xl ${colorClasses[stat.color].icon}`} />
          </div>
          {stat.trend && (
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
              stat.trendUp 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {stat.trendUp ? '↑' : '↓'} {stat.trend}
            </span>
          )}
        </div>
        <div className="mb-2">
          <span className="text-3xl font-bold text-gray-800">
            {stat.key.includes('Accuracy') || stat.key.includes('Confidence') ? `${value}%` : value}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{stat.title}</h3>
        <p className="text-sm text-gray-600">
          {stat.key === 'predictionAccuracy' ? 'AI model accuracy' :
           stat.key === 'highConfidenceMatches' ? '85%+ confidence' :
           stat.key === 'jobMatches' ? 'Total matches found' :
           stat.key === 'skillGap' ? 'Areas to improve' :
           stat.key === 'totalPredictions' ? 'All predictions made' :
           'Average prediction score'}
        </p>
        {stat.link && (
          <div className="mt-4 text-sm font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Explore
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );

  return stat.link ? (
    <Link to={stat.link} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
});

const PredictionCard = React.memo(({ prediction }) => {
  const statusColor = prediction.confidence >= 90 ? 'green' : prediction.confidence >= 80 ? 'yellow' : 'red';
  const statusText = prediction.confidence >= 90 ? 'Excellent' : prediction.confidence >= 80 ? 'Good' : 'Needs Work';
  
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-3 bg-${statusColor}-500`}></div>
            <h3 className="font-bold text-gray-900 text-lg">{prediction.job}</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <FaCalendarAlt className="mr-2" />
            <span>{prediction.date}</span>
            <span className="mx-2">•</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{prediction.industry}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold text-${statusColor}-600`}>{prediction.confidence}%</div>
          <div className="text-xs text-gray-500 mt-1">Confidence</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Match Score</span>
          <span className="font-semibold">{prediction.confidence}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 bg-gradient-to-r from-${statusColor}-400 to-${statusColor}-600`}
            style={{ width: `${prediction.confidence}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 flex justify-between">
          <span>Low</span>
          <span className={`font-medium text-${statusColor}-600`}>{statusText}</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
});

const JobCard = React.memo(({ job }) => {
  const matchColor = job.match >= 90 ? 'green' : job.match >= 80 ? 'amber' : 'blue';
  
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all duration-300 group hover:bg-gray-50/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
            {job.isHot && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center">
                <FaFire className="mr-1" /> HOT
              </span>
            )}
            {job.isFeatured && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center">
                <FaCrown className="mr-1" /> FEATURED
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{job.company}</p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold text-${matchColor}-600`}>{job.match}%</div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaRegClock className="mr-2" />
          <span>{job.posted}</span>
          <span className="mx-2">•</span>
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <span className="font-medium text-gray-700">{job.salary}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">{job.type}</span>
        <button className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm group-hover:underline">
          <span>View Details</span>
          <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
});

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    predictionAccuracy: 0,
    jobMatches: 0,
    skillGap: 0,
    totalPredictions: 0,
    avgConfidence: 0,
    highConfidenceMatches: 0
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30d');

  // Memoized chart data preparation
  const prepareChartData = useCallback((predictions) => {
    const confidenceData = predictions.slice(-6).map(p => p.confidence_score || 0);
    const trendLabels = predictions.slice(-6).map((p, i) => {
      const date = new Date(p.created_at);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const industryData = {
      labels: ['AI/ML', 'Data Science', 'Software', 'Research', 'Other'],
      datasets: [{
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
        cutout: '70%',
      }]
    };

    const confidenceTrend = {
      labels: trendLabels.length > 0 ? trendLabels : ['Jan 10', 'Jan 12', 'Jan 14', 'Jan 16', 'Jan 18', 'Jan 20'],
      datasets: [{
        label: 'Confidence Score',
        data: confidenceData.length > 0 ? confidenceData : [78, 85, 82, 89, 91, 94],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };

    return { industryDistribution: industryData, confidenceTrend };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const predictionsResponse = await axios.get('http://localhost:8000/api/predictions/history/');
      const predictions = predictionsResponse.data.predictions || [];
      
      // Calculate stats in one pass
      const statsData = predictions.reduce((acc, p) => {
        acc.totalPredictions++;
        acc.totalConfidence += p.confidence_score || 0;
        if ((p.confidence_score || 0) >= 85) acc.highConfidenceMatches++;
        if ((p.confidence_score || 0) >= 75) acc.jobMatches++;
        return acc;
      }, {
        totalPredictions: 0,
        totalConfidence: 0,
        highConfidenceMatches: 0,
        jobMatches: 0
      });

      setStats({
        predictionAccuracy: 94,
        jobMatches: statsData.jobMatches,
        skillGap: 2,
        totalPredictions: statsData.totalPredictions,
        avgConfidence: statsData.totalPredictions > 0 
          ? Math.round(statsData.totalConfidence / statsData.totalPredictions)
          : 0,
        highConfidenceMatches: statsData.highConfidenceMatches
      });

      // Set recent predictions
      setRecentPredictions(predictions.slice(0, 4).map(pred => ({
        id: pred.id,
        job: pred.top_prediction || 'Unknown',
        confidence: pred.confidence_score || 0,
        date: new Date(pred.created_at).toLocaleDateString(),
        industry: pred.industry || 'Technology'
      })));

      // Set chart data
      setChartData(prepareChartData(predictions));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to demo data
      setStats({
        predictionAccuracy: 94,
        jobMatches: 18,
        skillGap: 2,
        totalPredictions: 8,
        avgConfidence: 87,
        highConfidenceMatches: 12
      });
      setRecentPredictions([
        { id: 1, job: 'Data Scientist', confidence: 94, date: '2024-01-20', industry: 'AI/ML' },
        { id: 2, job: 'ML Engineer', confidence: 89, date: '2024-01-18', industry: 'Technology' },
        { id: 3, job: 'AI Researcher', confidence: 82, date: '2024-01-15', industry: 'Research' },
        { id: 4, job: 'Data Analyst', confidence: 78, date: '2024-01-10', industry: 'Finance' },
      ]);
      setChartData(prepareChartData([]));
    } finally {
      setLoading(false);
    }
  }, [prepareChartData]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, fetchDashboardData]);

  // Memoized tab navigation
  const tabs = useMemo(() => ['overview', 'analytics', 'jobs', 'progress'], []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-all duration-300 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'jobs' && (
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {stats.jobMatches}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                >
                  {TIME_FILTERS.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <FaSync className={`text-gray-500 hover:text-primary ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary-dark rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-64 translate-y-64"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0 lg:max-w-2xl">
                <div className="flex items-center mb-3">
                  <FaRocket className="text-2xl mr-3 animate-pulse" />
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    Welcome back, {user?.name || user?.email || 'Learner'}! 👋
                  </h1>
                </div>
                <p className="text-white/90 text-lg mb-6">
                  Your AI-powered career dashboard with <span className="font-semibold">real-time insights</span> and personalized recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center">
                    <FaStar className="mr-2" /> {stats.highConfidenceMatches} High Confidence Matches
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center">
                    <FaChartLine className="mr-2" /> {stats.predictionAccuracy}% Prediction Accuracy
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center">
                    <FaFire className="mr-2" /> {stats.jobMatches} Job Matches
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/job-prediction"
                  className="inline-flex items-center justify-center bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
                >
                  <FaFileUpload className="mr-3" />
                  Upload Resume & Predict
                </Link>
                <Link
                  to="/prediction-history"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  <FaHistory className="mr-3" />
                  View All History
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {STAT_CARDS.map((stat, index) => (
            <StatCard
              key={stat.key}
              stat={stat}
              value={stats[stat.key]}
              index={index}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Predictions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-primary/10 rounded-xl mr-4">
                    <FaHistory className="text-primary text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recent Predictions
                    </h2>
                    <p className="text-gray-500 text-sm">Your latest AI-powered career predictions</p>
                  </div>
                </div>
                <Link
                  to="/prediction-history"
                  className="inline-flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors group"
                >
                  <span>View All</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentPredictions.length > 0 ? (
                  recentPredictions.map((prediction) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaLightbulb className="text-primary text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start your career journey by making your first AI-powered prediction
                    </p>
                    <Link
                      to="/job-prediction"
                      className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all hover:shadow-lg"
                    >
                      <FaRocket className="mr-3" />
                      Make First Prediction
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Industry Distribution</h3>
                    <p className="text-gray-500 text-sm">Where your skills fit best</p>
                  </div>
                  <FaChartBar className="text-primary text-xl" />
                </div>
                <div className="h-64 relative">
                  <Doughnut 
                    data={chartData.industryDistribution}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'right' },
                        tooltip: {
                          callbacks: { label: (context) => `${context.label}: ${context.parsed}%` }
                        }
                      },
                      cutout: '70%',
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalPredictions}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Confidence Trend</h3>
                    <p className="text-gray-500 text-sm">Your prediction performance</p>
                  </div>
                  <div className="flex items-center text-green-600 text-sm font-semibold">
                    <FaChartLine className="mr-2" />
                    +12.5%
                  </div>
                </div>
                <div className="h-64">
                  <Line 
                    data={chartData.confidenceTrend}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true, max: 100 },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recommended Jobs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-xl mr-4">
                    <FaFire className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Top Job Matches
                    </h2>
                    <p className="text-gray-500 text-sm">Personalized recommendations</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  {RECOMMENDED_JOBS.length} Jobs
                </span>
              </div>
              
              <div className="space-y-4">
                {RECOMMENDED_JOBS.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/job-search"
                  className="inline-flex items-center justify-center w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all hover:shadow-lg"
                >
                  <FaSearch className="mr-3" />
                  Explore More Jobs
                </Link>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FaRocket className="mr-3 text-primary" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  const colorMap = {
                    blue: 'from-blue-500/20 to-blue-600/20',
                    green: 'from-green-500/20 to-green-600/20',
                    purple: 'from-purple-500/20 to-purple-600/20',
                    amber: 'from-amber-500/20 to-amber-600/20'
                  };
                  
                  return (
                    <Link
                      key={idx}
                      to={action.link}
                      className={`flex items-center p-4 rounded-xl bg-gradient-to-r ${colorMap[action.color]} hover:scale-[1.02] transition-all duration-300 group backdrop-blur-sm border border-white/10`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
                        <Icon className={`text-${action.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{action.title}</h3>
                        <p className="text-sm text-gray-300">{action.description}</p>
                      </div>
                      <FaArrowRight className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Skill Gaps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-amber-100 rounded-xl mr-4">
                  <FaTasks className="text-amber-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Priority Skill Gaps</h3>
                  <p className="text-amber-600 text-sm">Close these to improve matches</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {SKILL_GAPS.map((skill, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{skill.skill}</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        skill.priority === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {skill.priority}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current: {skill.current}%</span>
                        <span className="text-gray-600">Target: {skill.target}%</span>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.current}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Beginner</span>
                        <span className="font-medium text-amber-600">
                          {skill.target - skill.current}% to go
                        </span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link
                to="/learning-path"
                className="inline-flex items-center justify-center w-full mt-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all hover:shadow-lg group"
              >
                <FaUserGraduate className="mr-3" />
                Start Learning Path
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;