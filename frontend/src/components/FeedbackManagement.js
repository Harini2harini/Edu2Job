// admindashboard/components/FeedbackManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar,
  FaFilter,
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
  FaEdit,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaUserShield,
  FaRobot,
  FaRegChartBar,
  FaRegClock,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIndustry,
  FaGraduationCap,
  FaLightbulb,
  FaPaperPlane,
  FaReply,
  FaShare,
  FaBookmark,
  FaFlag,
  FaBell,
  FaUsers,
  FaRegStar,
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaEllipsisH,
  FaCog,
  FaQrcode,
  FaIdCard,
  FaShieldAlt,
  FaKey,
  FaHistory,
  FaCalendarCheck,
  FaClipboardCheck,
  FaChartPie,
  FaPercent,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaRegCalendarAlt,
  FaTimes,
  FaCheck,
  FaPlus,
  FaMinus,
  FaExpand,
  FaCompress,
  FaRegEdit,
  FaRegTrashAlt,
  FaRegCopy,
  FaRegShareSquare,
  FaRegBookmark,
  FaRegFlag,
  FaRegBell,
  FaRegEnvelope,
  FaRegUser,
  FaRegBuilding,
  FaRegFileAlt,
  FaRegClock,
  FaRegCalendar,
  FaRegChartBar,
  FaRegListAlt,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegDotCircle,
  FaRegCircle,
  FaRegSquare,
  FaRegCheckSquare,
  FaRegWindowMinimize,
  FaRegWindowMaximize,
  FaRegWindowRestore,
  FaRegWindowClose,
  FaBars,
  FaEllipsisV,
  FaEllipsisH as FaEllipsisHAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaChevronCircleUp,
  FaChevronCircleDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaArrowCircleUp,
  FaArrowCircleDown,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
  FaLongArrowAltUp,
  FaLongArrowAltDown,
  FaAngleLeft,
  FaAngleRight,
  FaAngleUp,
  FaAngleDown,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleDoubleUp,
  FaAngleDoubleDown,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
  FaSortAmountUp,
  FaSortAmountDownAlt,
  FaFilter as FaFilterAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSave,
  FaPrint,
  FaFileExport,
  FaFileImport,
  FaFileAlt,
  FaFileCsv,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaFileAudio,
  FaFileVideo,
  FaDatabase,
  FaServer,
  FaNetworkWired,
  FaCloud,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaSyncAlt,
  FaRandom,
  FaRetweet,
  FaExchangeAlt,
  FaShuffle,
  FaCrosshairs,
  FaBullseye,
  FaTarget,
  FaDotCircle,
  FaCircle,
  FaSquare,
  FaCheckSquare,
  FaMinusSquare,
  FaPlusSquare,
  FaTimesSquare,
  FaExclamationSquare,
  FaQuestionSquare,
  FaInfoSquare,
  FaPlaySquare,
  FaPauseSquare,
  FaStopSquare,
  FaRecordVinyl
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [expandedRows, setExpandedRows] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [filterHelpful, setFilterHelpful] = useState('all');
  const [filterReviewed, setFilterReviewed] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unreviewed', 'lowRating', 'helpful'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });
  const [analytics, setAnalytics] = useState(null);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchFeedback();
    fetchStats();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterAndSortFeedback();
  }, [feedback, filterRating, filterHelpful, filterReviewed, filterSource, startDate, endDate, searchTerm, sortBy, sortDirection, activeTab]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRating !== 'all') params.append('min_rating', filterRating);
      if (filterHelpful !== 'all') params.append('helpful', filterHelpful);
      if (filterReviewed !== 'all') params.append('is_reviewed', filterReviewed);
      if (filterSource !== 'all') params.append('source', filterSource);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('page_size', 100);

      const response = await axios.get(`${API_URL}/admin/feedback/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const feedbackData = response.data.results || response.data || [];
      setFeedback(feedbackData);
      setPagination({
        currentPage: response.data.current_page || 1,
        itemsPerPage: response.data.page_size || 10,
        totalPages: response.data.total_pages || 1
      });
      
      toast.success(`Loaded ${feedbackData.length} feedback items`);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
      // For demo purposes, create sample data
      setFeedback(generateSampleFeedback());
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/feedback/stats/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      setStats(generateSampleStats());
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/feedback/analytics/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(generateSampleAnalytics());
    }
  };

  const generateSampleFeedback = () => {
    const sampleData = [];
    const users = [
      { name: 'John Doe', email: 'john@example.com', role: 'Software Engineer' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'Data Scientist' },
      { name: 'Bob Johnson', email: 'bob@example.com', role: 'DevOps Engineer' },
      { name: 'Alice Brown', email: 'alice@example.com', role: 'Frontend Developer' },
      { name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Machine Learning Engineer' }
    ];

    const comments = [
      "Great prediction! Very accurate and helpful for my career planning.",
      "Helpful but needs more details about required skills.",
      "Excellent tool for career planning. The accuracy was impressive.",
      "Could be better with more real-world data. The predictions seemed generic.",
      "Very satisfied with the results. It helped me identify my next career move.",
      "The interface could be improved, but the predictions are accurate.",
      "Would recommend to colleagues. Very useful tool.",
      "Some predictions seemed off, but overall a good experience.",
      "Love the detailed breakdown and skill recommendations.",
      "Need more industry-specific insights."
    ];

    const jobRoles = [
      'Software Engineer',
      'Data Scientist',
      'DevOps Engineer',
      'Frontend Developer',
      'Machine Learning Engineer',
      'Backend Developer',
      'Full Stack Developer',
      'Cloud Architect',
      'Security Engineer',
      'Product Manager'
    ];

    const sources = ['prediction', 'api', 'manual', 'import'];

    for (let i = 1; i <= 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      const isReviewed = Math.random() > 0.5;
      const isHelpful = Math.random() > 0.3;
      const wouldRecommend = Math.random() > 0.4;
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      sampleData.push({
        id: `feedback-${i}`,
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
        rating: rating,
        accuracy_match: Math.min(rating + Math.floor(Math.random() * 2) - 1, 5),
        comment: comments[Math.floor(Math.random() * comments.length)],
        helpful: isHelpful,
        would_recommend: wouldRecommend,
        prediction_job_role: jobRoles[Math.floor(Math.random() * jobRoles.length)],
        is_reviewed: isReviewed,
        reviewed_by: isReviewed ? 'Admin User' : null,
        reviewed_at: isReviewed ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
        feedback_tags: ['helpful', 'accurate', 'needs-improvement', 'detailed'].slice(0, Math.floor(Math.random() * 3) + 1),
        source: source,
        device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
        browser: Math.random() > 0.5 ? 'Chrome' : 'Safari',
        session_id: `session-${Math.random().toString(36).substr(2, 9)}`,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
        time_spent: Math.floor(Math.random() * 300) + 60, // seconds
        page_views: Math.floor(Math.random() * 10) + 1
      });
    }

    return sampleData;
  };

  const generateSampleStats = () => ({
    total_feedback: 50,
    total_users: 25,
    average_rating: 4.2,
    average_accuracy_match: 4.1,
    helpfulness_rate: 78.5,
    recommendation_rate: 82.4,
    reviewed_rate: 56.8,
    response_rate: 34.2,
    daily_average: 1.7,
    rating_distribution: {1: 4, 2: 6, 3: 10, 4: 15, 5: 15},
    source_distribution: {prediction: 35, api: 8, manual: 5, import: 2},
    daily_feedback: Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5) + 1,
      average_rating: 3.5 + Math.random() * 1.5
    }))
  });

  const generateSampleAnalytics = () => ({
    top_keywords: [
      { word: 'accurate', count: 24, sentiment: 'positive' },
      { word: 'helpful', count: 18, sentiment: 'positive' },
      { word: 'improve', count: 12, sentiment: 'negative' },
      { word: 'detailed', count: 9, sentiment: 'positive' },
      { word: 'interface', count: 7, sentiment: 'neutral' }
    ],
    sentiment_over_time: Array.from({length: 7}, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      positive: Math.floor(Math.random() * 10) + 5,
      neutral: Math.floor(Math.random() * 5) + 2,
      negative: Math.floor(Math.random() * 3) + 1
    })),
    user_engagement: {
      average_time_spent: 142,
      average_page_views: 3.2,
      returning_users: 42,
      completion_rate: 88.5
    },
    device_stats: {
      desktop: 68,
      mobile: 28,
      tablet: 4
    },
    geographic_distribution: {
      US: 45,
      UK: 18,
      CA: 12,
      AU: 8,
      DE: 6,
      others: 11
    }
  });

  const filterAndSortFeedback = () => {
    let filtered = [...feedback];

    // Apply active tab filters
    switch(activeTab) {
      case 'unreviewed':
        filtered = filtered.filter(fb => !fb.is_reviewed);
        break;
      case 'lowRating':
        filtered = filtered.filter(fb => fb.rating <= 2);
        break;
      case 'helpful':
        filtered = filtered.filter(fb => fb.helpful);
        break;
      case 'needsReply':
        filtered = filtered.filter(fb => !fb.replied_at);
        break;
    }

    // Apply rating filter
    if (filterRating !== 'all') {
      filtered = filtered.filter(fb => fb.rating >= parseInt(filterRating));
    }

    // Apply helpful filter
    if (filterHelpful !== 'all') {
      filtered = filtered.filter(fb => fb.helpful === (filterHelpful === 'true'));
    }

    // Apply reviewed filter
    if (filterReviewed !== 'all') {
      filtered = filtered.filter(fb => fb.is_reviewed === (filterReviewed === 'true'));
    }

    // Apply source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(fb => fb.source === filterSource);
    }

    // Apply date filter
    if (startDate) {
      filtered = filtered.filter(fb => new Date(fb.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(fb => new Date(fb.created_at) <= new Date(endDate));
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(fb => 
        fb.comment?.toLowerCase().includes(searchLower) ||
        fb.user_email?.toLowerCase().includes(searchLower) ||
        fb.user_name?.toLowerCase().includes(searchLower) ||
        fb.prediction_job_role?.toLowerCase().includes(searchLower) ||
        fb.user_role?.toLowerCase().includes(searchLower) ||
        fb.feedback_tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'accuracy':
          aValue = a.accuracy_match;
          bValue = b.accuracy_match;
          break;
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'helpful':
          aValue = a.helpful ? 1 : 0;
          bValue = b.helpful ? 1 : 0;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    
    setFilteredFeedback(filtered.slice(startIndex, endIndex));
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems: filtered.length
    }));
  };

  const deleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`${API_URL}/admin/feedback/${feedbackId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setFeedback(feedback.filter(fb => fb.id !== feedbackId));
        toast.success('Feedback deleted successfully');
        
        if (selectedFeedback?.id === feedbackId) {
          setSelectedFeedback(null);
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  const deleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.warning('No items selected');
      return;
    }

    if (window.confirm(`Delete ${selectedItems.length} selected feedback items?`)) {
      try {
        await Promise.all(
          selectedItems.map(id => 
            axios.delete(`${API_URL}/admin/feedback/${id}/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            })
          )
        );
        
        setFeedback(feedback.filter(fb => !selectedItems.includes(fb.id)));
        setSelectedItems([]);
        toast.success(`${selectedItems.length} feedback items deleted`);
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete selected feedback');
      }
    }
  };

  const updateFeedback = async (feedbackId, updates) => {
    try {
      const response = await axios.patch(`${API_URL}/admin/feedback/${feedbackId}/`, updates, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setFeedback(feedback.map(fb => 
        fb.id === feedbackId ? { ...fb, ...updates, ...response.data } : fb
      ));
      
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, ...updates, ...response.data });
      }
      
      toast.success('Feedback updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
      return false;
    }
  };

  const markAsReviewed = async (feedbackId) => {
    const success = await updateFeedback(feedbackId, { 
      is_reviewed: true,
      reviewed_by: 'Admin User',
      reviewed_at: new Date().toISOString()
    });
    
    if (success) {
      toast.success('Feedback marked as reviewed');
    }
  };

  const sendReply = async (feedbackId) => {
    if (!replyMessage.trim()) {
      toast.warning('Please enter a reply message');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/feedback/${feedbackId}/reply/`, {
        message: replyMessage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setReplyMessage('');
      
      // Update feedback with reply info
      updateFeedback(feedbackId, {
        replied_at: new Date().toISOString(),
        last_reply: replyMessage
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const exportFeedback = async (format = 'csv') => {
    try {
      setExporting(true);
      const response = await axios.get(`${API_URL}/admin/feedback/export/?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Feedback exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting feedback:', error);
      toast.error('Failed to export feedback');
    } finally {
      setExporting(false);
    }
  };

  const toggleRowExpand = (feedbackId) => {
    setExpandedRows(prev => 
      prev.includes(feedbackId)
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredFeedback.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFeedback.map(fb => fb.id));
    }
  };

  const toggleSelectItem = (feedbackId) => {
    setSelectedItems(prev =>
      prev.includes(feedbackId)
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const bulkMarkAsReviewed = async () => {
    if (selectedItems.length === 0) {
      toast.warning('No items selected');
      return;
    }

    try {
      await Promise.all(
        selectedItems.map(id => 
          updateFeedback(id, { 
            is_reviewed: true,
            reviewed_by: 'Admin User',
            reviewed_at: new Date().toISOString()
          })
        )
      );
      
      toast.success(`${selectedItems.length} items marked as reviewed`);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to update selected items');
    }
  };

  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${sizeClasses[size]} ${
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-2">
            Manage, analyze, and respond to user feedback
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchFeedback}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setExporting(!exporting)}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FaDownload />
              <span>Export</span>
            </button>
            {exporting && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button
                  onClick={() => exportFeedback('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                >
                  <FaFileCsv className="mr-2 text-green-600" />
                  CSV Format
                </button>
                <button
                  onClick={() => exportFeedback('json')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                >
                  <FaFileAlt className="mr-2 text-blue-600" />
                  JSON Format
                </button>
                <button
                  onClick={() => exportFeedback('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                >
                  <FaFilePdf className="mr-2 text-red-600" />
                  PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Feedback', count: feedback.length, icon: FaComments },
            { id: 'unreviewed', label: 'Unreviewed', count: feedback.filter(fb => !fb.is_reviewed).length, icon: FaExclamationCircle },
            { id: 'lowRating', label: 'Low Ratings', count: feedback.filter(fb => fb.rating <= 2).length, icon: FaFrown },
            { id: 'helpful', label: 'Helpful', count: feedback.filter(fb => fb.helpful).length, icon: FaThumbsUp },
            { id: 'needsReply', label: 'Needs Reply', count: feedback.filter(fb => !fb.replied_at).length, icon: FaReply },
            { id: 'analytics', label: 'Analytics', icon: FaChartPie }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'analytics') setShowStats(true);
              }}
              className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats Overview */}
      {showStats && activeTab !== 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Feedback Overview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchStats}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh stats"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowStats(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Hide stats"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: 'Total Feedback',
                value: stats.total_feedback,
                icon: FaComments,
                color: 'blue',
                trend: '+12%',
                trendUp: true
              },
              {
                label: 'Avg Rating',
                value: stats.average_rating.toFixed(1),
                icon: FaStar,
                color: 'yellow',
                trend: '+0.3',
                trendUp: true
              },
              {
                label: 'Helpfulness',
                value: `${stats.helpfulness_rate}%`,
                icon: FaThumbsUp,
                color: 'green',
                trend: '+5%',
                trendUp: true
              },
              {
                label: 'Reviewed',
                value: `${stats.reviewed_rate}%`,
                icon: FaCheckCircle,
                color: 'purple',
                trend: '+8%',
                trendUp: true
              }
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-${stat.color}-50 to-white border border-${stat.color}-200 rounded-xl p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                    <div className={`flex items-center mt-2 text-sm ${
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                      <span className="ml-1">{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rating Distribution Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.rating_distribution[rating] || 0;
                const percentage = (count / stats.total_feedback * 100) || 0;
                const color = rating >= 4 ? 'green' : rating >= 3 ? 'yellow' : 'red';
                
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
                        className={`h-full rounded-full bg-${color}-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Distribution */}
          {stats.source_distribution && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.source_distribution).map(([source, count]) => {
                  const percentage = (count / stats.total_feedback * 100).toFixed(1);
                  return (
                    <div key={source} className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 capitalize">{source}</div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && analytics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Top Keywords */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.top_keywords.map((keyword, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    keyword.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    keyword.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <span className="font-medium">{keyword.word}</span>
                  <span className="text-sm opacity-75">({keyword.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analytics.user_engagement).map(([metric, value]) => (
              <div key={metric} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm text-gray-600 capitalize">
                  {metric.replace(/_/g, ' ')}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                  {metric === 'average_time_spent' ? 's' : 
                   metric === 'completion_rate' || metric === 'returning_users' ? '%' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Device & Geographic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Usage</h3>
              <div className="space-y-3">
                {Object.entries(analytics.device_stats).map(([device, percentage]) => (
                  <div key={device} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{device}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Geographic Distribution</h3>
              <div className="space-y-2">
                {Object.entries(analytics.geographic_distribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([country, percentage]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm">{country}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters - Only show for non-analytics tabs */}
      {activeTab !== 'analytics' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search feedback, users, comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1 star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterReviewed}
                onChange={(e) => setFilterReviewed(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="true">Reviewed</option>
                <option value="false">Not Reviewed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="prediction">Prediction</option>
                <option value="api">API</option>
                <option value="manual">Manual</option>
                <option value="import">Import</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="helpful">Helpfulness</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  setFilterRating('all');
                  setFilterHelpful('all');
                  setFilterReviewed('all');
                  setFilterSource('all');
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                  setSortBy('newest');
                  setSortDirection('desc');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchFeedback}
                className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && activeTab !== 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaUsers className="text-primary" />
              <span className="font-medium">{selectedItems.length} items selected</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={bulkMarkAsReviewed}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaCheckCircle />
                <span>Mark as Reviewed</span>
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* View Mode Toggle */}
      {activeTab !== 'analytics' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredFeedback.length} of {pagination.totalItems || feedback.length} feedback items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaListAlt />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaThLarge />
            </button>
          </div>
        </div>
      )}

      {/* Feedback Table/Card View */}
      {activeTab !== 'analytics' && (
        <>
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredFeedback.length && filteredFeedback.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediction</th>
                      <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredFeedback.map((fb) => (
                        <motion.tr
                          key={fb.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-gray-50 ${!fb.is_reviewed ? 'bg-yellow-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(fb.id)}
                              onChange={() => toggleSelectItem(fb.id)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <FaUser className="text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {fb.user_name || 'Anonymous'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {fb.user_email || 'No email'}
                                </div>
                                {fb.user_role && (
                                  <div className="text-xs text-gray-400">{fb.user_role}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {fb.prediction_job_role || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <FaTag className="mr-1" />
                              {fb.source || 'prediction'}
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
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                                  style={{ width: `${fb.accuracy_match * 20}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{fb.accuracy_match}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div>
                                {fb.helpful ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    <FaThumbsUp className="w-3 h-3 mr-1" />
                                    Helpful
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    <FaThumbsDown className="w-3 h-3 mr-1" />
                                    Not Helpful
                                  </span>
                                )}
                              </div>
                              <div>
                                {fb.is_reviewed ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    <FaCheckCircle className="w-3 h-3 mr-1" />
                                    Reviewed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    <FaExclamationCircle className="w-3 h-3 mr-1" />
                                    Needs Review
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendar className="w-3 h-3 mr-1" />
                              {getTimeAgo(fb.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                            <button
                              onClick={() => setSelectedFeedback(fb)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            {!fb.is_reviewed && (
                              <button
                                onClick={() => markAsReviewed(fb.id)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                                title="Mark as Reviewed"
                              >
                                <FaCheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {!fb.replied_at && (
                              <button
                                onClick={() => {
                                  setSelectedFeedback(fb);
                                  setShowReplyModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50"
                                title="Reply"
                              >
                                <FaReply className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingFeedback(fb);
                                setShowEditModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50"
                              title="Edit Feedback"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFeedback(fb.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                              title="Delete Feedback"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleRowExpand(fb.id)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
                              title={expandedRows.includes(fb.id) ? 'Collapse' : 'Expand'}
                            >
                              {expandedRows.includes(fb.id) ? 
                                <FaChevronUp className="w-4 h-4" /> : 
                                <FaChevronDown className="w-4 h-4" />
                              }
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {filteredFeedback.length === 0 && (
                <div className="text-center py-12">
                  <FaComments className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterRating !== 'all' || filterHelpful !== 'all' || startDate || endDate
                      ? 'Try changing your filters'
                      : 'No user feedback available yet'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={i}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                            className={`px-3 py-1 rounded-lg ${
                              pagination.currentPage === pageNum
                                ? 'bg-primary text-white'
                                : 'border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeedback.map((fb) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{fb.user_name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500">{fb.user_email || 'No email'}</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(fb.id)}
                          onChange={() => toggleSelectItem(fb.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Rating & Job Role */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{fb.prediction_job_role}</div>
                        <div className="flex items-center">
                          {renderStars(fb.rating)}
                          <span className="ml-2 font-medium">{fb.rating}/5</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Accuracy: {fb.accuracy_match}/5
                      </div>
                    </div>

                    {/* Comment Preview */}
                    {fb.comment && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">{fb.comment}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {fb.feedback_tags && fb.feedback_tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {fb.feedback_tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        {fb.is_reviewed ? (
                          <span className="inline-flex items-center text-xs text-green-600">
                            <FaCheckCircle className="mr-1" />
                            Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-yellow-600">
                            <FaExclamationCircle className="mr-1" />
                            Needs Review
                          </span>
                        )}
                        {fb.helpful && (
                          <span className="inline-flex items-center text-xs text-blue-600">
                            <FaThumbsUp className="mr-1" />
                            Helpful
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getTimeAgo(fb.created_at)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => setSelectedFeedback(fb)}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        View
                      </button>
                      {!fb.is_reviewed && (
                        <button
                          onClick={() => markAsReviewed(fb.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Feedback Details Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <FaUser className="text-primary w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {selectedFeedback.user_name || 'Anonymous User'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedFeedback.user_email || 'No email provided'}
                          </p>
                          {selectedFeedback.user_role && (
                            <p className="text-xs text-gray-500">{selectedFeedback.user_role}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Submitted</div>
                        <div className="font-medium">
                          {formatDate(selectedFeedback.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Overall Rating</h4>
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold text-gray-900">{selectedFeedback.rating}/5</div>
                        <div>
                          {renderStars(selectedFeedback.rating, 'lg')}
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedFeedback.rating >= 4 ? 'Excellent' : 
                             selectedFeedback.rating >= 3 ? 'Good' : 'Needs Improvement'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Accuracy Match</h4>
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold text-gray-900">{selectedFeedback.accuracy_match}/5</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                              style={{ width: `${selectedFeedback.accuracy_match * 20}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedFeedback.accuracy_match >= 4 ? 'Very Accurate' : 
                             selectedFeedback.accuracy_match >= 3 ? 'Moderately Accurate' : 'Not Accurate'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Engagement</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Helpful</span>
                          <span className={`font-medium ${selectedFeedback.helpful ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedFeedback.helpful ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Would Recommend</span>
                          <span className={`font-medium ${selectedFeedback.would_recommend ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedFeedback.would_recommend ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Info */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Related Prediction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Job Role</div>
                        <div className="font-medium">{selectedFeedback.prediction_job_role || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Source</div>
                        <div className="font-medium capitalize">{selectedFeedback.source || 'prediction'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Device</div>
                        <div className="font-medium">{selectedFeedback.device || 'Unknown'}</div>
                      </div>
                    </div>
                    {selectedFeedback.country && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-gray-400" />
                          {selectedFeedback.country}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Content */}
                  <div className="space-y-4">
                    {selectedFeedback.comment && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Comments</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                        </div>
                      </div>
                    )}

                    {selectedFeedback.suggestions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.suggestions}</p>
                        </div>
                      </div>
                    )}

                    {selectedFeedback.last_reply && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Your Reply</h4>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.last_reply}</p>
                          {selectedFeedback.replied_at && (
                            <div className="text-xs text-gray-500 mt-2">
                              Replied on {formatDate(selectedFeedback.replied_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedFeedback.feedback_tags && selectedFeedback.feedback_tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeedback.feedback_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Info */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Technical Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {selectedFeedback.session_id && (
                        <div>
                          <div className="text-gray-500">Session ID</div>
                          <div className="font-mono text-xs truncate">{selectedFeedback.session_id}</div>
                        </div>
                      )}
                      {selectedFeedback.ip_address && (
                        <div>
                          <div className="text-gray-500">IP Address</div>
                          <div className="font-mono">{selectedFeedback.ip_address}</div>
                        </div>
                      )}
                      {selectedFeedback.browser && (
                        <div>
                          <div className="text-gray-500">Browser</div>
                          <div>{selectedFeedback.browser}</div>
                        </div>
                      )}
                      {selectedFeedback.time_spent && (
                        <div>
                          <div className="text-gray-500">Time Spent</div>
                          <div>{selectedFeedback.time_spent}s</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {!selectedFeedback.is_reviewed && (
                    <button
                      onClick={() => {
                        markAsReviewed(selectedFeedback.id);
                        setSelectedFeedback(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {!selectedFeedback.replied_at && (
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Reply to User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingFeedback(selectedFeedback);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Edit Feedback
                  </button>
                  <button
                    onClick={() => deleteFeedback(selectedFeedback.id)}
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
      </AnimatePresence>

      {/* Edit Feedback Modal */}
      <AnimatePresence>
        {showEditModal && editingFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Edit Feedback</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (1-5)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setEditingFeedback({...editingFeedback, rating})}
                          className={`text-2xl ${
                            rating <= editingFeedback.rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accuracy Match (1-5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={editingFeedback.accuracy_match}
                      onChange={(e) => setEditingFeedback({
                        ...editingFeedback, 
                        accuracy_match: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>1 (Not Accurate)</span>
                      <span className="font-medium">{editingFeedback.accuracy_match}</span>
                      <span>5 (Very Accurate)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingFeedback.helpful}
                        onChange={(e) => setEditingFeedback({
                          ...editingFeedback, 
                          helpful: e.target.checked
                        })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">Helpful</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingFeedback.would_recommend}
                        onChange={(e) => setEditingFeedback({
                          ...editingFeedback, 
                          would_recommend: e.target.checked
                        })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">Would Recommend</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingFeedback.is_reviewed}
                        onChange={(e) => setEditingFeedback({
                          ...editingFeedback, 
                          is_reviewed: e.target.checked
                        })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">Reviewed</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={editingFeedback.comment || ''}
                      onChange={(e) => setEditingFeedback({
                        ...editingFeedback, 
                        comment: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows="4"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const success = await updateFeedback(editingFeedback.id, {
                        rating: editingFeedback.rating,
                        accuracy_match: editingFeedback.accuracy_match,
                        helpful: editingFeedback.helpful,
                        would_recommend: editingFeedback.would_recommend,
                        is_reviewed: editingFeedback.is_reviewed,
                        comment: editingFeedback.comment
                      });
                      
                      if (success) {
                        setShowEditModal(false);
                        setEditingFeedback(null);
                      }
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Reply to User</h3>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Replying to <span className="font-medium">{selectedFeedback.user_name || 'Anonymous User'}</span>
                  </p>
                  {selectedFeedback.comment && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">"{selectedFeedback.comment}"</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="6"
                    placeholder="Type your reply here..."
                  />
                </div>

                <div className="mt-6">
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Send email notification to user</span>
                  </label>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sendReply(selectedFeedback.id)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackManagement;