import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AdminFeedbackPanel from '../../components/AdminFeedbackPanel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaUsers,
  FaRobot,
  FaDatabase,
  FaHistory,
  FaBell,
  FaCog,
  FaChartLine,
  FaFlag,
  FaFileExport,
  FaUserShield,
  FaUpload,
  FaCaretDown,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCalendar,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaPlayCircle,
  FaDownload,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaCopy,
  FaToggleOn,
  FaToggleOff,
  FaServer,
  FaInfoCircle,
  FaBug,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaComments,
  FaStar
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';



// Dashboard Home Component
const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsData, setChartsData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats/`),
        axios.get(`${API_URL}/admin/charts/`)
      ]);

      setStats(statsRes.data);
      setChartsData(chartsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: <FaUsers className="text-3xl text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Predictions',
      value: stats?.total_predictions || 0,
      icon: <FaChartLine className="text-3xl text-green-500" />,
      color: 'bg-green-50 border-green-100',
      change: '+25%',
      trend: 'up'
    },
    {
      title: 'Active Models',
      value: stats?.total_models || 0,
      icon: <FaRobot className="text-3xl text-purple-500" />,
      color: 'bg-purple-50 border-purple-100',
      change: stats?.total_models > 0 ? '1 Active' : 'No Active',
      trend: stats?.total_models > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Flagged Predictions',
      value: stats?.flagged_predictions || 0,
      icon: <FaFlag className="text-3xl text-red-500" />,
      color: 'bg-red-50 border-red-100',
      change: '+3 New',
      trend: stats?.flagged_predictions > 0 ? 'up' : 'neutral'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-white/80">
              Here's what's happening with your Education to Job Prediction System today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <FaCalendar className="text-white/60" />
              <span className="text-white/80">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.color} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              {stat.icon}
              <span className="text-2xl font-bold text-gray-900">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">{stat.title}</h3>
            <div className="flex items-center">
              {stat.trend === 'up' ? (
                <FaArrowUp className="w-4 h-4 text-green-500 mr-1" />
              ) : stat.trend === 'down' ? (
                <FaArrowDown className="w-4 h-4 text-red-500 mr-1" />
              ) : null}
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-green-600' :
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
            <span className="text-primary hover:text-primary-dark text-sm cursor-pointer">
              View All
            </span>
          </div>
          <div className="space-y-4">
            {stats?.recent_activities?.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {activity.user_name} • {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.activity_type === 'login' ? 'bg-green-100 text-green-800' :
                  activity.activity_type === 'prediction' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.activity_type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Predictions</h2>
            <span className="text-primary hover:text-primary-dark text-sm cursor-pointer">
              View All
            </span>
          </div>
          <div className="space-y-4">
            {stats?.recent_predictions?.slice(0, 5).map((prediction) => (
              <div key={prediction.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    {prediction.user_name}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    prediction.status === 'success' ? 'bg-green-100 text-green-800' :
                    prediction.status === 'flagged' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {prediction.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Confidence: <span className="font-medium">{(prediction.confidence_score * 100).toFixed(2)}%</span>
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(prediction.created_at).toLocaleDateString()}</span>
                  <button className="text-primary hover:text-primary-dark">
                    <FaEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center">
            <div className="p-3 bg-primary/10 rounded-lg inline-block mb-3">
              <FaRobot className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium text-gray-900">Train New Model</p>
            <p className="text-sm text-gray-600 mt-1">Start model training</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
              <FaUpload className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-gray-900">Upload Dataset</p>
            <p className="text-sm text-gray-600 mt-1">Add training data</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center">
            <div className="p-3 bg-red-100 rounded-lg inline-block mb-3">
              <FaFlag className="w-6 h-6 text-red-600" />
            </div>
            <p className="font-medium text-gray-900">Review Flags</p>
            <p className="text-sm text-gray-600 mt-1">Check flagged predictions</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
              <FaDatabase className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-600 mt-1">Download system data</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/`);
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? user.is_active : !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/admin/users/${userId}/`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/`, {
        is_active: !currentStatus
      });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all registered users and their permissions
          </p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <FaDownload />
          <span>Export Users</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <motion.tr
                  key={userItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {userItem.role === 'admin' ? (
                          <FaUserShield className="text-primary" />
                        ) : (
                          <FaUsers className="text-primary" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaEnvelope className="w-3 h-3 mr-1" />
                          {userItem.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(userItem.id, userItem.is_active)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        userItem.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {userItem.is_active ? (
                        <>
                          <FaUserCheck className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <FaUserTimes className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendar className="w-3 h-3 mr-1" />
                      {new Date(userItem.date_joined).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50">
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50">
                      <FaEdit className="w-4 h-4" />
                    </button>
                    {userItem.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try changing your search terms' : 'No users match the current filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Model Management Component
const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('models');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Training form state
  const [trainingForm, setTrainingForm] = useState({
    dataset_id: '',
    model_name: '',
    model_type: 'random_forest',
    target_column: '',
    test_size: 0.2,
    random_state: 42,
    description: ''
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    dataset_file: null,
    target_column: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, datasetsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/models/`),
        axios.get(`${API_URL}/admin/datasets/`)
      ]);

      setModels(modelsRes.data.results || modelsRes.data || []);
      setDatasets(datasetsRes.data.results || datasetsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateModel = async (modelId) => {
    try {
      await axios.post(`${API_URL}/admin/models/${modelId}/activate/`);
      fetchData();
    } catch (error) {
      console.error('Error activating model:', error);
      alert('Failed to activate model');
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`${API_URL}/admin/models/${modelId}/`);
        setModels(models.filter(m => m.id !== modelId));
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Failed to delete model');
      }
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      try {
        await axios.delete(`${API_URL}/admin/datasets/${datasetId}/`);
        setDatasets(datasets.filter(d => d.id !== datasetId));
      } catch (error) {
        console.error('Error deleting dataset:', error);
        alert('Failed to delete dataset');
      }
    }
  };

  const handleTrainModel = async () => {
    if (!trainingForm.dataset_id || !trainingForm.model_name || !trainingForm.target_column) {
      alert('Please fill in all required fields');
      return;
    }

    setTraining(true);
    try {
      await axios.post(`${API_URL}/admin/train-model/`, trainingForm);

      alert('Model training started successfully!');
      setShowTrainModal(false);
      setTrainingForm({
        dataset_id: '',
        model_name: '',
        model_type: 'random_forest',
        target_column: '',
        test_size: 0.2,
        random_state: 42,
        description: ''
      });
      
      setTimeout(() => {
        fetchData();
      }, 5000);
    } catch (error) {
      console.error('Error training model:', error);
      alert('Failed to start training: ' + (error.response?.data?.error || error.message));
    } finally {
      setTraining(false);
    }
  };

  const handleUploadDataset = async () => {
    if (!uploadForm.dataset_file || !uploadForm.name) {
      alert('Please select a file and enter a name');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', uploadForm.name);
      formData.append('description', uploadForm.description);
      formData.append('dataset_file', uploadForm.dataset_file);
      formData.append('target_column', uploadForm.target_column);

      await axios.post(`${API_URL}/admin/datasets/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Dataset uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({
        name: '',
        description: '',
        dataset_file: null,
        target_column: ''
      });
      
      fetchData();
    } catch (error) {
      console.error('Error uploading dataset:', error);
      alert('Failed to upload dataset: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({
        ...uploadForm,
        dataset_file: file,
        name: uploadForm.name || file.name.replace(/\.[^/.]+$/, "")
      });
    }
  };

  const getModelTypeIcon = (type) => {
    switch (type) {
      case 'random_forest':
        return '🌲';
      case 'decision_tree':
        return '🌳';
      case 'svm':
        return '⚡';
      case 'gradient_boosting':
        return '📈';
      default:
        return '🤖';
    }
  };

  const getFileIcon = (filename) => {
    if (filename?.endsWith('.csv')) return <FaFileCsv className="text-green-500" />;
    if (filename?.endsWith('.xlsx') || filename?.endsWith('.xls')) return <FaFileExcel className="text-green-700" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading model management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Management</h1>
          <p className="text-gray-600 mt-2">
            Manage ML models, upload training data, and retrain models
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaUpload />
            <span>Upload Dataset</span>
          </button>
          <button
            onClick={() => setShowTrainModal(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FaPlayCircle />
            <span>Train New Model</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaRobot className="inline mr-2" />
            ML Models ({models.length})
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'datasets'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaDatabase className="inline mr-2" />
            Training Datasets ({datasets.length})
          </button>
        </nav>
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* All Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map(model => (
              <div key={model.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getModelTypeIcon(model.model_type)}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{model.name}</h4>
                        <p className="text-xs text-gray-500">v{model.version}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      model.status === 'trained' ? 'bg-blue-100 text-blue-800' :
                      model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {model.accuracy ? (model.accuracy * 100).toFixed(1) : 'N/A'}%
                      </div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {model.f1_score ? model.f1_score.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">F1 Score</div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{model.model_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trained:</span>
                      <span className="font-medium">
                        {model.trained_at ? new Date(model.trained_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Features:</span>
                      <span className="font-medium">{model.features_used?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={() => handleActivateModel(model.id)}
                      className="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
                    >
                      {model.is_active ? (
                        <>
                          <FaToggleOn className="inline mr-1" />
                          Active
                        </>
                      ) : (
                        'Activate'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDataset(datasets[0]?.id);
                        setTrainingForm({
                          ...trainingForm,
                          model_name: `Retrained ${model.name}`,
                          model_type: model.model_type
                        });
                        setShowTrainModal(true);
                      }}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                      title="Retrain Model"
                    >
                      <FaPlayCircle />
                    </button>
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50"
                      title="Delete Model"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {models.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FaRobot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ML Models Found</h3>
              <p className="text-gray-500 mb-6">
                Get started by training your first model
              </p>
              <button
                onClick={() => setShowTrainModal(true)}
                className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
              >
                <FaPlayCircle />
                <span>Train First Model</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Datasets Tab */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          {/* Datasets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map(dataset => (
              <div key={dataset.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(dataset.dataset_file)}
                      <div>
                        <h4 className="font-bold text-gray-900">{dataset.name}</h4>
                        <p className="text-xs text-gray-500">{dataset.dataset_type.toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dataset.is_validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dataset.is_validated ? 'Validated' : 'Pending'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{dataset.description}</p>
                  
                  {/* Dataset Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rows:</span>
                      <span className="font-medium">{dataset.row_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Columns:</span>
                      <span className="font-medium">{dataset.column_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="font-medium">
                        {new Date(dataset.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex justify-between space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDataset(dataset.id);
                        setTrainingForm({
                          ...trainingForm,
                          dataset_id: dataset.id,
                          target_column: dataset.target_column || ''
                        });
                        setShowTrainModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
                    >
                      <FaPlayCircle className="inline mr-1" />
                      Train Model
                    </button>
                    <button
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50"
                      title="Delete Dataset"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {datasets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FaDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Datasets</h3>
              <p className="text-gray-500 mb-6">
                Upload a dataset to start training models
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                <FaUpload />
                <span>Upload First Dataset</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Dataset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upload Training Dataset</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dataset Name *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter dataset name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    placeholder="Describe the dataset content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dataset File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {uploadForm.dataset_file ? (
                      <div className="space-y-2">
                        <FaFileCsv className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-sm font-medium">{uploadForm.dataset_file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadForm.dataset_file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={() => setUploadForm({...uploadForm, dataset_file: null})}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Drag & drop or click to upload</p>
                        <p className="text-sm text-gray-500 mb-4">CSV, JSON, Excel (Max 100MB)</p>
                        <label className="inline-block bg-primary text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-primary-dark">
                          Browse Files
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".csv,.json,.xlsx,.xls"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDataset}
                  disabled={uploading || !uploadForm.dataset_file}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Dataset'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Train Model Modal */}
      {showTrainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Train New Model</h3>
                <button
                  onClick={() => setShowTrainModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={trainingForm.model_name}
                    onChange={(e) => setTrainingForm({...trainingForm, model_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Job Prediction v2.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Dataset *
                  </label>
                  <select
                    value={trainingForm.dataset_id}
                    onChange={(e) => setTrainingForm({...trainingForm, dataset_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a dataset</option>
                    {datasets.map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} ({dataset.row_count} rows)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Column *
                  </label>
                  <input
                    type="text"
                    value={trainingForm.target_column}
                    onChange={(e) => setTrainingForm({...trainingForm, target_column: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., job_role"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Type
                    </label>
                    <select
                      value={trainingForm.model_type}
                      onChange={(e) => setTrainingForm({...trainingForm, model_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="random_forest">Random Forest</option>
                      <option value="decision_tree">Decision Tree</option>
                      <option value="svm">Support Vector Machine</option>
                      <option value="gradient_boosting">Gradient Boosting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Size
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="0.5"
                      value={trainingForm.test_size}
                      onChange={(e) => setTrainingForm({...trainingForm, test_size: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    placeholder="Describe what this model will be used for..."
                  />
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => setShowTrainModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrainModel}
                  disabled={training || !trainingForm.dataset_id || !trainingForm.model_name || !trainingForm.target_column}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {training ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Training...
                    </>
                  ) : (
                    <>
                      <FaPlayCircle className="inline mr-2" />
                      Start Training
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Prediction Logs Component
const PredictionLogs = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/predictions/`);
      setPredictions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    if (window.confirm('This will generate sample prediction data. Continue?')) {
      try {
        const response = await axios.post(`${API_URL}/admin/generate-sample-data/`);
        alert(response.data.message || 'Sample data generated successfully!');
        fetchPredictions(); // Refresh the data
      } catch (error) {
        console.error('Error generating sample data:', error);
        alert('Failed to generate sample data');
      }
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = searchTerm === '' || 
      prediction.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(prediction.prediction_result).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prediction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <FaExclamationTriangle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <FaFlag className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaChartLine className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prediction Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all job prediction requests
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <FaDownload />
            <span>Export Data</span>
          </button>
          <button
            onClick={generateSampleData}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlayCircle />
            <span>Generate Sample Data</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        <FaUsers className="text-blue-600" />
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                          style={{ width: `${(prediction.confidence_score || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {((prediction.confidence_score || 0) * 100).toFixed(1)}%
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-12">
            <FaDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try changing your filters' 
                : 'No prediction logs available. Try generating sample data.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// System Logs Component
const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/system-logs/`);
      setLogs(response.data.results || response.data || []);
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
    
    return matchesSearch && matchesLevel;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor system events, errors, and activities
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <FaDownload />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
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
                      <FaServer className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900 capitalize">
                        {log.category?.replace('_', ' ') || 'system'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendar className="w-3 h-3 mr-1" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FaServer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No system logs found</h3>
            <p className="text-gray-500">
              {searchTerm || filterLevel !== 'all'
                ? 'Try changing your filters'
                : 'No system logs available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  const [settings, setSettings] = useState({
    site_name: 'Edu2Job Prediction System',
    maintenance_mode: false,
    allow_registrations: true,
    prediction_threshold: 0.7,
    max_file_size: 100,
    email_notifications: true
  });

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure system preferences and behavior
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">Temporarily disable the system for maintenance</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow User Registrations</p>
                  <p className="text-sm text-gray-600">Allow new users to register on the platform</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allow_registrations: !settings.allow_registrations})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.allow_registrations ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.allow_registrations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* ML Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prediction Confidence Threshold
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.prediction_threshold}
                  onChange={(e) => setSettings({...settings, prediction_threshold: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{(settings.prediction_threshold * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Upload Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={settings.max_file_size}
                  onChange={(e) => setSettings({...settings, max_file_size: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email alerts for system events</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, email_notifications: !settings.email_notifications})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Dropdown Component
const NotificationsDropdown = ({ notifications, onClose, onMarkAllRead, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <FaUsers className="w-5 h-5 text-blue-500" />;
      case 'model_trained':
        return <FaRobot className="w-5 h-5 text-green-500" />;
      case 'prediction_flagged':
        return <FaFlag className="w-5 h-5 text-red-500" />;
      case 'system_alert':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'feedback':
        return <FaComments className="w-5 h-5 text-purple-500" />;
      default:
        return <FaBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.created_at)}
                      </span>
                      {notification.link && (
                        <button className="text-xs text-primary hover:text-primary-dark flex items-center">
                          <span>View</span>
                          <FaExternalLinkAlt className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-1">No notifications</h4>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-primary hover:text-primary-dark"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Added Feedback option to navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'users', label: 'User Management', icon: <FaUsers /> },
    { id: 'models', label: 'ML Models', icon: <FaRobot /> },
    { id: 'predictions', label: 'Predictions', icon: <FaDatabase /> },
    { id: 'system-logs', label: 'System Logs', icon: <FaHistory /> },
    { id: 'feedback', label: 'Feedback', icon: <FaComments /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchNotifications();
    setLoading(false);
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/notifications/?is_read=false&limit=10`);
      const notificationsData = response.data.results || response.data || [];
      setNotifications(notificationsData);
      setUnreadNotifications(notificationsData.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // For demo purposes, create sample notifications if API fails
      setNotifications(getSampleNotifications());
      setUnreadNotifications(5);
    }
  };

  // Sample notifications for demo - Updated with feedback notification
  const getSampleNotifications = () => [
    {
      id: 1,
      title: 'New User Registered',
      message: 'John Doe has registered on the platform',
      notification_type: 'user_registered',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
      id: 2,
      title: 'Model Training Complete',
      message: 'Job Prediction Model v2.0 has completed training',
      notification_type: 'model_trained',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: 3,
      title: 'Prediction Flagged',
      message: 'A prediction has been flagged for manual review',
      notification_type: 'prediction_flagged',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
      id: 4,
      title: 'New Feedback Received',
      message: 'User provided 5-star feedback on prediction',
      notification_type: 'feedback',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
    },
    {
      id: 5,
      title: 'System Alert',
      message: 'Database backup completed successfully',
      notification_type: 'system_alert',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    }
  ];

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/admin/notifications/${notificationId}/mark-read/`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // For demo, just filter it out
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await Promise.all(
        notifications.map(notification => 
          axios.post(`${API_URL}/admin/notifications/${notification.id}/mark-read/`)
        )
      );
      setNotifications([]);
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // For demo, just clear them
      setNotifications([]);
      setUnreadNotifications(0);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'users':
        return <UserManagement />;
      case 'models':
        return <ModelManagement />;
      case 'predictions':
        return <PredictionLogs />;
      case 'system-logs':
        return <SystemLogs />;
      case 'feedback':
        return <AdminFeedbackPanel />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-lg fixed top-0 right-0 left-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaUserShield className="text-2xl text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Education to Job Prediction System</p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaBell className="text-xl text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={markAllNotificationsAsRead}
                    onMarkAsRead={markNotificationAsRead}
                  />
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                      <p className="text-sm text-gray-600">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                  <FaCaretDown className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl lg:hidden"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FaUserShield className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                    <p className="text-xs text-gray-600">v2.0.0</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === item.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? '16rem' : '5rem' }}
          className="hidden lg:flex flex-col h-[calc(100vh-4rem)] bg-white shadow-xl sticky top-16"
        >
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  {item.icon}
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 px-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Status</span>
                    <span className="flex items-center text-green-600">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Health</span>
                    <span className="flex items-center text-green-600">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              {sidebarOpen ? (
                <>
                  <span className="text-gray-700">Collapse</span>
                </>
              ) : (
                <FaBars className="text-gray-700" />
              )}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {getActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;