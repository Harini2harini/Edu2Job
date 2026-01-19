import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaUpload,
  FaDatabase,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt,
  FaTrash,
  FaEye,
  FaSpinner,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';

const TrainingData = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    dataset_file: null,
    target_column: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/datasets/`);
      setDatasets(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
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
      
      fetchDatasets();
    } catch (error) {
      console.error('Error uploading dataset:', error);
      alert('Failed to upload dataset: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
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

  const getFileIcon = (filename) => {
    if (filename?.endsWith('.csv')) return <FaFileCsv className="text-green-500" />;
    if (filename?.endsWith('.xlsx') || filename?.endsWith('.xls')) return <FaFileExcel className="text-green-700" />;
    if (filename?.endsWith('.json')) return <FaFileAlt className="text-yellow-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading training data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Data Management</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage datasets for model training
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaUpload />
          <span>Upload Dataset</span>
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-2xl p-8 text-center">
        <FaUpload className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Training Dataset</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Upload CSV, JSON, or Excel files containing your training data. 
          Supported formats: .csv, .json, .xlsx, .xls
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer">
            <FaUpload />
            <span>Browse Files</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".csv,.json,.xlsx,.xls"
            />
          </label>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-2 bg-white text-green-600 border border-green-300 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            <FaInfoCircle />
            <span>Upload with Details</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">Maximum file size: 100MB</p>
      </div>

      {/* Datasets Grid */}
      {datasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(dataset.dataset_file)}
                    <div>
                      <h4 className="font-bold text-gray-900">{dataset.name}</h4>
                      <p className="text-xs text-gray-500 uppercase">{dataset.dataset_type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    dataset.is_validated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dataset.is_validated ? 'Validated' : 'Pending'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {dataset.description || 'No description provided'}
                </p>
                
                {/* Dataset Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rows:</span>
                    <span className="font-medium">{dataset.row_count?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Columns:</span>
                    <span className="font-medium">{dataset.column_count || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">File Size:</span>
                    <span className="font-medium">
                      {dataset.file_size_mb ? `${dataset.file_size_mb.toFixed(2)} MB` : 'N/A'}
                    </span>
                  </div>
                  {dataset.target_column && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Target:</span>
                      <span className="font-medium text-primary">{dataset.target_column}</span>
                    </div>
                  )}
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
                    onClick={() => setShowDetails(dataset)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center space-x-1"
                  >
                    <FaEye />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDataset(dataset.id)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center"
                    title="Delete Dataset"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border">
          <FaDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Datasets</h3>
          <p className="text-gray-500 mb-6">
            Upload your first dataset to start training models
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            <FaUpload />
            <span>Upload First Dataset</span>
          </button>
        </div>
      )}

      {/* Dataset Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Dataset Details</h3>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Dataset Name</p>
                        <p className="font-medium">{showDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">File Type</p>
                        <p className="font-medium uppercase">{showDetails.dataset_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rows</p>
                        <p className="font-medium">{showDetails.row_count?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Columns</p>
                        <p className="font-medium">{showDetails.column_count}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {showDetails.validation_report && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Validation Report</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {JSON.stringify(showDetails.validation_report, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {showDetails.column_names && showDetails.column_names.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Columns ({showDetails.column_names.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {showDetails.column_names.map((col, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            col === showDetails.target_column
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showDetails.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{showDetails.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upload Dataset</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="w-5 h-5" />
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
                  <p className="text-xs text-gray-500 mt-1">
                    The column that contains the prediction target
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dataset File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    {uploadForm.dataset_file ? (
                      <div className="space-y-3">
                        {getFileIcon(uploadForm.dataset_file.name)}
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
    </div>
  );
};

export default TrainingData;