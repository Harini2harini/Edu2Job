import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaRobot,
  FaUpload,
  FaPlayCircle,
  FaCheckCircle,
  FaSpinner,
  FaChartLine,
  FaDatabase,
  FaDownload,
  FaTrash,
  FaHistory,
  FaToggleOn,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt
} from 'react-icons/fa';

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

  const API_URL = 'http://localhost:8000/api';

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
      fetchData(); // Refresh models
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
      const formData = new FormData();
      Object.keys(trainingForm).forEach(key => {
        formData.append(key, trainingForm[key]);
      });

      await axios.post(`${API_URL}/admin/train-model/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Model training started! Check the system logs for progress.');
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
      
      // Refresh data after a delay
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

  const downloadModel = (model) => {
    if (model.model_file) {
      window.open(`${API_URL}${model.model_file}`, '_blank');
    } else {
      alert('Model file not available for download');
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
      case 'neural_network':
        return '🧠';
      case 'gradient_boosting':
        return '📈';
      default:
        return '🤖';
    }
  };

  const getFileIcon = (filename) => {
    if (filename?.endsWith('.csv')) return <FaFileCsv className="text-green-500" />;
    if (filename?.endsWith('.xlsx') || filename?.endsWith('.xls')) return <FaFileExcel className="text-green-700" />;
    if (filename?.endsWith('.json')) return <FaFileAlt className="text-yellow-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading model management...</p>
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
        </div>

        {/* Tabs */}
        <div className="mb-8">
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
              <button
                onClick={() => setActiveTab('metrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'metrics'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Performance Metrics
              </button>
            </nav>
          </div>
        </div>

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            {/* Active Model Card */}
            {models.filter(m => m.is_active).map(model => (
              <div key={model.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaRobot className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-gray-600">{model.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-gray-500">v{model.version}</span>
                        <span className="text-gray-500">•</span>
                        <span className="capitalize">{model.model_type.replace('_', ' ')}</span>
                        <span className="text-gray-500">•</span>
                        <span>Accuracy: <strong>{model.accuracy ? (model.accuracy * 100).toFixed(2) : 'N/A'}%</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadModel(model)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <FaDownload className="inline mr-2" />
                      Download
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
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      <FaPlayCircle className="inline mr-2" />
                      Retrain
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* All Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.filter(m => !m.is_active).map(model => (
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
                        model.status === 'failed' ? 'bg-red-100 text-red-800' :
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
                        onClick={() => downloadModel(model)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                        title="Download Model"
                      >
                        <FaDownload />
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

            {/* No Models State */}
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
                        <span className="text-gray-500">File Size:</span>
                        <span className="font-medium">
                          {dataset.file_size_mb ? `${dataset.file_size_mb} MB` : 'N/A'}
                        </span>
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

            {/* No Datasets State */}
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

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Performance Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Model Performance Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precision</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recall</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">F1 Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {models.map(model => (
                      <tr key={model.id} className={model.is_active ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {model.is_active && (
                              <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            )}
                            <span className="font-medium">{model.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                style={{ width: `${(model.accuracy || 0) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{model.precision?.toFixed(3) || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{model.recall?.toFixed(3) || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{model.f1_score?.toFixed(3) || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            model.status === 'trained' ? 'bg-blue-100 text-blue-800' :
                            model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {model.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Training History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Training History</h3>
              <div className="space-y-4">
                {models.filter(m => m.trained_at).sort((a, b) => new Date(b.trained_at) - new Date(a.trained_at)).slice(0, 5).map(model => (
                  <div key={model.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-3">
                        <FaHistory className="text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">{model.name}</h4>
                          <p className="text-sm text-gray-500">
                            Trained by {model.trained_by_name} • {new Date(model.trained_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {(model.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Accuracy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
                    Target Column (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.target_column}
                    onChange={(e) => setUploadForm({...uploadForm, target_column: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., job_role, salary_range"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Column name from dataset that contains the prediction target
                  </p>
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
                    <p className="text-xs text-gray-500 mt-1">Portion for testing (0.1-0.5)</p>
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

export default ModelManagement;