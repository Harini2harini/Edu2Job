import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaShare,
  FaPlus,
  FaFilter,
 FaBriefcase,
  FaUserFriends,
  FaChartLine,
  FaLightbulb,
  FaHashtag
} from 'react-icons/fa';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    loadPosts();
  }, [activeFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/community/posts/`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      alert('Please enter post content');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/community/posts/`, newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '', tags: [] });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await axios.post(`${API_URL}/community/posts/${postId}/like/`);
      loadPosts(); // Reload posts
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const categories = [
    { id: 'career_advice', name: 'Career Advice', icon: <FaLightbulb />, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'interview_tips', name: 'Interview Tips', icon: <FaUserFriends />, color: 'bg-blue-100 text-blue-800' },
    { id: 'skill_development', name: 'Skill Development', icon: <FaChartLine />, color: 'bg-green-100 text-green-800' },
    { id: 'job_openings', name: 'Job Openings', icon: <FaBriefcase />, color: 'bg-purple-100 text-purple-800' },
    { id: 'success_stories', name: 'Success Stories', icon: <FaUsers />, color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <FaUsers className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Community Hub</h1>
                <p className="text-white/80">Connect, share, and learn with professionals</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">Share your thoughts with the community</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="input-field"
                  placeholder="Post title (optional)"
                />
                
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="input-field min-h-[120px]"
                  placeholder="What's on your mind? Share career insights, ask questions, or post job opportunities..."
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`px-3 py-1 rounded-full text-sm ${cat.color}`}
                      >
                        {cat.icon}
                        <span className="ml-1">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleCreatePost}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <FaPlus />
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                            {post.author_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{post.author_name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()} • {post.category}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          post.category === 'career_advice' ? 'bg-yellow-100 text-yellow-800' :
                          post.category === 'interview_tips' ? 'bg-blue-100 text-blue-800' :
                          post.category === 'skill_development' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.category.replace('_', ' ')}
                        </div>
                      </div>
                      
                      {post.title && (
                        <h2 className="text-xl font-bold text-gray-900 mt-4">{post.title}</h2>
                      )}
                    </div>
                    
                    {/* Post Content */}
                    <div className="p-6">
                      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                      
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                            >
                              <FaHashtag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Post Actions */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                          >
                            <FaThumbsUp />
                            <span>{post.likes_count || 0} Likes</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                            <FaComment />
                            <span>{post.comments_count || 0} Comments</span>
                          </button>
                          
                          <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                            <FaShare />
                            <span>Share</span>
                          </button>
                        </div>
                        
                        <button className="text-sm text-primary hover:text-primary-dark font-medium">
                          Read More
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to start a discussion!</p>
                  <button
                    onClick={() => document.querySelector('textarea').focus()}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
                  >
                    Create First Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-primary" />
                <h3 className="font-bold text-gray-800">Categories</h3>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeFilter === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  All Topics
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeFilter === cat.id ? 'bg-primary text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={activeFilter === cat.id ? 'text-white' : cat.color.split(' ')[1]}>
                      {cat.icon}
                    </div>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Trending Topics</h3>
              
              <div className="space-y-3">
                {['AI Career Paths', 'Remote Work Tips', 'Tech Interviews', 'Resume Building', 'Salary Negotiation'].map((topic, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{topic}</span>
                      <span className="text-sm text-gray-500">42 posts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Community Stats */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-xl mb-4">Community Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Members</span>
                  <span className="font-bold">1,234</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Active Discussions</span>
                  <span className="font-bold">89</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Posts Today</span>
                  <span className="font-bold">24</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Expert Contributors</span>
                  <span className="font-bold">45</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <button className="w-full py-3 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;