import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaGraduationCap,
  FaTools,
  FaCertificate,
  FaBriefcase,
  FaFilePdf,
  FaSave,
  FaRedo,
  FaTrash,
  FaPlus,
  FaPrint,
  FaSpinner,
  FaArrowRight,
  FaDownload,
  FaEye,
  FaStar,
  FaCalendar,
  FaMapMarkerAlt,
  FaBuilding,
  FaTimes,
  FaCamera,
} from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    profile: {},
    educations: [],
    skills: [],
    certifications: [],
    work_experiences: [],
    resumes: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState(0);
  const fileInputRef = useRef(null);
  const certificateFileInputRef = useRef(null);
  
  // Form states - UPDATED: Single name field instead of first_name and last_name
  const [personalInfo, setPersonalInfo] = useState({
    name: '', // Single name field
    date_of_birth: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    professional_summary: '',
    career_objective: '',
    profile_picture: null,
    profile_picture_url: ''
  });
  
  // COMPREHENSIVE DEGREE OPTIONS (Mapped to backend values)
  // Backend expects: 'high_school', 'diploma', 'bachelor', 'master', 'phd', 'other'
  const degreeOptions = [
    // Basic Levels
    { value: 'high_school', label: 'High School/Secondary School', category: 'School' },
    { value: 'diploma', label: 'Diploma', category: 'Undergraduate' },
    
    // Bachelor's Degrees
    { value: 'bachelor', label: 'Bachelor of Engineering (B.E.)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Technology (B.Tech)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Science (B.Sc)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Commerce (B.Com)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Arts (B.A.)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Business Administration (BBA)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Computer Applications (BCA)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Architecture (B.Arch)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Pharmacy (B.Pharm)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Laws (LLB)', category: 'Undergraduate' },
    { value: 'bachelor', label: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)', category: 'Undergraduate' },
    
    // Master's Degrees
    { value: 'master', label: 'Master of Engineering (M.E.)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Technology (M.Tech)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Science (M.Sc)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Arts (M.A.)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Commerce (M.Com)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Business Administration (MBA)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Computer Applications (MCA)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Architecture (M.Arch)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Pharmacy (M.Pharm)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Laws (LLM)', category: 'Postgraduate' },
    { value: 'master', label: 'Master of Surgery (MS)', category: 'Postgraduate' },
    { value: 'master', label: 'Doctor of Medicine (MD)', category: 'Postgraduate' },
    
    // Doctoral Degrees
    { value: 'phd', label: 'Doctor of Philosophy (PhD)', category: 'Doctorate' },
    { value: 'phd', label: 'Doctor of Science (D.Sc)', category: 'Doctorate' },
    { value: 'phd', label: 'Doctor of Literature (D.Litt)', category: 'Doctorate' },
    
    // Other Degrees
    { value: 'other', label: 'Other Degree', category: 'Other' },
  ];

  // Grouped degree options by category
  const groupedDegreeOptions = degreeOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {});

  // Institution Options
  const institutionOptions = [
    'Indian Institutes of Technology (IIT)',
    'National Institutes of Technology (NIT)',
    'Indian Institutes of Information Technology (IIIT)',
    'University of Delhi',
    'University of Mumbai',
    'University of Calcutta',
    'Anna University',
    'Jawaharlal Nehru University (JNU)',
    'Banaras Hindu University (BHU)',
    'University of Hyderabad',
    'Jadavpur University',
    'Aligarh Muslim University (AMU)',
    'Birla Institute of Technology and Science (BITS)',
    'Vellore Institute of Technology (VIT)',
    'SRM Institute of Science and Technology',
    'Manipal Academy of Higher Education',
    'Amity University',
    'Lovely Professional University (LPU)',
    'Symbiosis International University',
    'Christ University',
    'St. Xavier\'s College',
    'Presidency University',
    'Other'
  ];

  const specializationOptions = {
    'Engineering & Technology': [
      'Computer Science',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Electronics & Communication',
      'Information Technology',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Biotechnology',
      'Artificial Intelligence',
      'Data Science',
      'Other'
    ],
    'Science': [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
      'Environmental Science',
      'Statistics',
      'Biochemistry',
      'Microbiology',
      'Other'
    ],
    'Commerce & Business': [
      'Accounting',
      'Finance',
      'Marketing',
      'Human Resources',
      'International Business',
      'Banking & Insurance',
      'Economics',
      'Supply Chain Management',
      'Other'
    ],
    'Arts & Humanities': [
      'English Literature',
      'History',
      'Psychology',
      'Sociology',
      'Political Science',
      'Philosophy',
      'Journalism',
      'Mass Communication',
      'Other'
    ],
    'Medical': [
      'General Medicine',
      'Surgery',
      'Pediatrics',
      'Gynecology',
      'Dentistry',
      'Pharmacy',
      'Nursing',
      'Physiotherapy',
      'Other'
    ],
    'Other': [
      'Law',
      'Architecture',
      'Design',
      'Fine Arts',
      'Hotel Management',
      'Agriculture',
      'Other'
    ]
  };

  // Skill Options
  const skillOptions = [
    // Technical Skills
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
    'React.js', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot',
    'HTML/CSS', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Analysis', 'Data Visualization',
    'Git', 'REST APIs', 'GraphQL', 'DevOps', 'CI/CD',
    
    // Soft Skills
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
    'Critical Thinking', 'Time Management', 'Adaptability',
    'Creativity', 'Work Ethic', 'Interpersonal Skills',
    
    // Business Skills
    'Project Management', 'Agile/Scrum', 'Strategic Planning',
    'Business Analysis', 'Financial Analysis', 'Marketing Strategy',
    
    // Language Skills
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese',
    
    'Other'
  ];

  // Skill category options (mapped to backend expectations)
  const skillCategoryOptions = [
    { value: 'technical', label: 'Technical' },
    { value: 'soft', label: 'Soft Skills' },
    { value: 'business', label: 'Business' },
    { value: 'language', label: 'Language' },
    { value: 'other', label: 'Other' },
  ];

  // Skill level options
  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  const [newEducation, setNewEducation] = useState({
    degree: 'bachelor', // Default value
    field_of_study: '',
    specialization: '',
    institution: '',
    gpa: '',
    percentage: '',
    graduation_year: new Date().getFullYear(),
    honors: '',
    additional_certifications: '',
    customDegree: '', // For "Other" option
    customInstitution: '' // For "Other" institution
  });
  
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'technical', // Changed to match backend expectations
    level: 'intermediate',
    years_of_experience: 0,
    customSkill: '' // For "Other" skill option
  });
  
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    certificate_file: null
  });
  
  const [newWorkExperience, setNewWorkExperience] = useState({
    title: '',
    company: '',
    employment_type: 'full_time',
    start_date: '',
    end_date: '',
    currently_working: false,
    location: '',
    remote: false,
    description: '',
    achievements: ''
  });
  
  const [newResume, setNewResume] = useState({
    title: '',
    file: null
  });

  const API_URL = 'http://localhost:8000/api';

  // Load profile data
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/profile/profile/complete/`);
      setProfileData(response.data);
      
      // Set personal info from profile
      if (response.data.profile) {
        // Extract first_name and last_name if they exist, otherwise use name field
        const profile = response.data.profile;
        const fullName = profile.name || 
                        (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : '');
        
        setPersonalInfo({
          name: fullName, // Single name field
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          nationality: profile.nationality || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          postal_code: profile.postal_code || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || '',
          professional_summary: profile.professional_summary || '',
          career_objective: profile.career_objective || '',
          profile_picture: null,
          profile_picture_url: profile.profile_picture || ''
        });
      }
      
      // Load completion percentage
      const completionResponse = await axios.get(`${API_URL}/profile/profile/completion/`);
      setCompletion(completionResponse.data.overall_completion);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handlePersonalInfoSave = async () => {
    try {
      setSaving(true);
      
      // Check if we're creating or updating
      const hasProfileId = profileData.profile && profileData.profile.id;
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all personal info fields
      Object.keys(personalInfo).forEach(key => {
        if (key === 'profile_picture' && personalInfo[key]) {
          formData.append(key, personalInfo[key]);
        } else if (key === 'profile_picture_url') {
          // Skip this, it's just for display
          return;
        } else if (personalInfo[key] !== null && personalInfo[key] !== undefined) {
          // Send empty string instead of null for required fields
          formData.append(key, personalInfo[key] || '');
        }
      });
      
      // Log what we're sending (for debugging)
      console.log('Saving personal info:', Object.fromEntries(formData));
      
      let response;
      if (hasProfileId) {
        // Update existing profile
        response = await axios.patch(`${API_URL}/profile/profile/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new profile
        response = await axios.post(`${API_URL}/profile/profile/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      console.log('Save response:', response.data);
      
      await loadProfileData(); // Reload data
      alert('Personal information saved successfully!');
    } catch (error) {
      console.error('Error saving personal info:', error.response?.data || error.message);
      
      // Better error handling to show validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to save personal information:\n';
        
        // Handle field-specific errors
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessage += `${field}: ${errorData[field].join(', ')}\n`;
          } else if (typeof errorData[field] === 'string') {
            errorMessage += `${field}: ${errorData[field]}\n`;
          }
        });
        
        alert(errorMessage);
      } else {
        alert(`Failed to save personal information: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!newEducation.degree || !newEducation.institution || !newEducation.graduation_year) {
        alert('Please fill in all required fields (Degree, Institution, and Graduation Year)');
        setSaving(false);
        return;
      }
      
      // Validate GPA range if provided
      if (newEducation.gpa && (parseFloat(newEducation.gpa) < 0 || parseFloat(newEducation.gpa) > 10)) {
        alert('GPA must be between 0 and 10');
        setSaving(false);
        return;
      }
      
      // Validate percentage range if provided
      if (newEducation.percentage && (parseFloat(newEducation.percentage) < 0 || parseFloat(newEducation.percentage) > 100)) {
        alert('Percentage must be between 0 and 100');
        setSaving(false);
        return;
      }
      
      // Validate graduation year
      const currentYear = new Date().getFullYear();
      if (parseInt(newEducation.graduation_year) < 1900 || parseInt(newEducation.graduation_year) > currentYear + 5) {
        alert('Please enter a valid graduation year (between 1900 and ' + (currentYear + 5) + ')');
        setSaving(false);
        return;
      }
      
      // Prepare education data
      const educationData = {
        degree: newEducation.degree, // This should be one of: 'high_school', 'diploma', 'bachelor', 'master', 'phd', 'other'
        field_of_study: newEducation.specialization || newEducation.field_of_study || '',
        institution: newEducation.institution === 'Other' ? newEducation.customInstitution : newEducation.institution,
        gpa: newEducation.gpa || null,
        percentage: newEducation.percentage || null,
        graduation_year: newEducation.graduation_year,
        honors: newEducation.honors || '',
        additional_certifications: newEducation.additional_certifications || ''
      };
      
      // Log what we're sending (for debugging)
      console.log('Adding education:', educationData);
      
      const response = await axios.post(`${API_URL}/profile/educations/`, educationData);
      console.log('Education response:', response.data);
      
      // Reset form
      setNewEducation({
        degree: 'bachelor',
        field_of_study: '',
        specialization: '',
        institution: '',
        gpa: '',
        percentage: '',
        graduation_year: new Date().getFullYear(),
        honors: '',
        additional_certifications: '',
        customDegree: '',
        customInstitution: ''
      });
      
      document.getElementById('addEducationModal').close();
      await loadProfileData();
      alert('Education added successfully!');
    } catch (error) {
      console.error('Error adding education:', error.response?.data || error.message);
      
      // Better error handling
      if (error.response?.data) {
        let errorMessage = 'Failed to add education:\n';
        Object.keys(error.response.data).forEach(field => {
          if (Array.isArray(error.response.data[field])) {
            errorMessage += `${field}: ${error.response.data[field].join(', ')}\n`;
          }
        });
        alert(errorMessage);
      } else {
        alert(`Failed to add education: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      const skillName = newSkill.name === 'Other' ? newSkill.customSkill : newSkill.name;
      if (!skillName || skillName.trim() === '') {
        alert('Please select or enter a skill name');
        setSaving(false);
        return;
      }
      
      // Prepare skill data according to backend expectations
      const skillData = {
        name: skillName,
        category: newSkill.category, // Should be one of: 'technical', 'soft', 'business', 'language', 'other'
        level: newSkill.level, // Should be one of: 'beginner', 'intermediate', 'advanced', 'expert'
        years_of_experience: newSkill.years_of_experience || 0
      };
      
      console.log('Adding skill:', skillData);
      
      // Try different API endpoints if needed
      let response;
      try {
        response = await axios.post(`${API_URL}/profile/skills/`, skillData);
      } catch (apiError) {
        // Try alternative endpoint
        console.log('Trying alternative endpoint...');
        response = await axios.post(`${API_URL}/skills/`, skillData);
      }
      
      console.log('Skill response:', response.data);
      
      // Reset form
      setNewSkill({
        name: '',
        category: 'technical',
        level: 'intermediate',
        years_of_experience: 0,
        customSkill: ''
      });
      
      document.getElementById('addSkillModal').close();
      await loadProfileData();
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error.response?.data || error.message);
      
      // Better error handling
      if (error.response?.data) {
        let errorMessage = 'Failed to add skill:\n';
        
        if (typeof error.response.data === 'object') {
          Object.keys(error.response.data).forEach(field => {
            if (Array.isArray(error.response.data[field])) {
              errorMessage += `${field}: ${error.response.data[field].join(', ')}\n`;
            } else if (typeof error.response.data[field] === 'string') {
              errorMessage += `${field}: ${error.response.data[field]}\n`;
            }
          });
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
        
        alert(errorMessage);
      } else {
        alert(`Failed to add skill: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddCertification = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!newCertification.name || !newCertification.issuing_organization) {
        alert('Please fill in all required fields (Certification Name and Issuing Organization)');
        setSaving(false);
        return;
      }
      
      const formData = new FormData();
      
      // Add certification data
      formData.append('name', newCertification.name);
      formData.append('issuing_organization', newCertification.issuing_organization);
      if (newCertification.issue_date) {
        formData.append('issue_date', newCertification.issue_date);
      }
      if (newCertification.certificate_file) {
        formData.append('certificate_file', newCertification.certificate_file);
      }
      
      console.log('Adding certification:', Object.fromEntries(formData));
      
      const response = await axios.post(`${API_URL}/profile/certifications/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Certification response:', response.data);
      
      setNewCertification({
        name: '',
        issuing_organization: '',
        issue_date: '',
        certificate_file: null
      });
      document.getElementById('addCertificationModal').close();
      await loadProfileData();
      alert('Certification added successfully!');
    } catch (error) {
      console.error('Error adding certification:', error.response?.data || error.message);
      alert(`Failed to add certification: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddWorkExperience = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!newWorkExperience.title || !newWorkExperience.company || !newWorkExperience.start_date) {
        alert('Please fill in all required fields (Title, Company, and Start Date)');
        setSaving(false);
        return;
      }
      
      console.log('Adding work experience:', newWorkExperience);
      
      const response = await axios.post(`${API_URL}/profile/work-experiences/`, newWorkExperience);
      console.log('Work experience response:', response.data);
      
      setNewWorkExperience({
        title: '',
        company: '',
        employment_type: 'full_time',
        start_date: '',
        end_date: '',
        currently_working: false,
        location: '',
        remote: false,
        description: '',
        achievements: ''
      });
      document.getElementById('addWorkExperienceModal').close();
      await loadProfileData();
      alert('Work experience added successfully!');
    } catch (error) {
      console.error('Error adding work experience:', error.response?.data || error.message);
      alert(`Failed to add work experience: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async () => {
    if (!newResume.file) {
      alert('Please select a file');
      return;
    }
    
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', newResume.title || 'My Resume');
      formData.append('file', newResume.file);
      
      console.log('Uploading resume:', Object.fromEntries(formData));
      
      const response = await axios.post(`${API_URL}/profile/resumes/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Resume response:', response.data);
      
      setNewResume({ title: '', file: null });
      document.getElementById('uploadResumeModal').close();
      await loadProfileData();
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error.response?.data || error.message);
      alert(`Failed to upload resume: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await axios.delete(`${API_URL}/profile/${type}/${id}/`);
        await loadProfileData();
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error.response?.data || error.message);
        alert(`Failed to delete ${type}: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleSetPrimaryResume = async (id) => {
    try {
      await axios.post(`${API_URL}/profile/resumes/${id}/set-primary/`);
      await loadProfileData();
      alert('Primary resume set successfully!');
    } catch (error) {
      console.error('Error setting primary resume:', error.response?.data || error.message);
      alert(`Failed to set primary resume: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleFileChange = (e, setter, fieldName = 'file') => {
    const file = e.target.files[0];
    if (file) {
      setter(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo({
          ...personalInfo,
          profile_picture: file,
          profile_picture_url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewResume = (resumeUrl) => {
    // Open resume in new tab
    window.open(resumeUrl, '_blank');
  };

  const handleDownloadResume = (resumeUrl, resumeTitle) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = resumeTitle || 'resume';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewCertificate = (certificateUrl) => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  // Helper function to get degree display label from value
  const getDegreeDisplayLabel = (degreeValue, educations) => {
    if (!educations) return '';
    
    // Find matching degree option
    const degreeOption = degreeOptions.find(opt => opt.value === degreeValue);
    if (degreeOption) {
      return degreeOption.label;
    }
    
    // If not found in predefined options, return the value itself
    return degreeValue;
  };

  // Helper function to get full degree label for a specific education entry
  const getEducationDegreeLabel = (education) => {
    // Find matching degree option
    const degreeOption = degreeOptions.find(opt => opt.value === education.degree);
    if (degreeOption) {
      return degreeOption.label;
    }
    
    // If "other" degree with custom name, use that
    if (education.degree === 'other' && education.field_of_study) {
      return education.field_of_study;
    }
    
    // Fallback to the degree value
    return education.degree;
  };

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: <FaUser /> },
    { id: 'education', name: 'Education', icon: <FaGraduationCap /> },
    { id: 'skills', name: 'Skills', icon: <FaTools /> },
    { id: 'certifications', name: 'Certifications', icon: <FaCertificate /> },
    { id: 'experience', name: 'Work Experience', icon: <FaBriefcase /> },
    { id: 'resume', name: 'Resume', icon: <FaFilePdf /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-white/80">
                  Manage your personal information, skills, and career details
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-white/80">Profile Completion</div>
                    <div className="text-2xl font-bold">{completion}%</div>
                  </div>
                  <div className="w-32">
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Personal Information Section - UPDATED with single name field */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
                
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {personalInfo.profile_picture_url ? (
                        <img 
                          src={personalInfo.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-4xl font-bold">
                          {personalInfo.name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
                    >
                      <FaCamera className="text-sm" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Click the camera icon to upload profile picture
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Single Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={personalInfo.date_of_birth}
                        onChange={(e) => setPersonalInfo({...personalInfo, date_of_birth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={personalInfo.gender}
                        onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={personalInfo.nationality}
                        onChange={(e) => setPersonalInfo({...personalInfo, nationality: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Your nationality"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={personalInfo.postal_code}
                        onChange={(e) => setPersonalInfo({...personalInfo, postal_code: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      rows="2"
                      placeholder="Your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={personalInfo.city}
                        onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={personalInfo.country}
                        onChange={(e) => setPersonalInfo({...personalInfo, country: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={personalInfo.linkedin_url}
                        onChange={(e) => setPersonalInfo({...personalInfo, linkedin_url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={personalInfo.github_url}
                        onChange={(e) => setPersonalInfo({...personalInfo, github_url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        value={personalInfo.portfolio_url}
                        onChange={(e) => setPersonalInfo({...personalInfo, portfolio_url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Summary
                    </label>
                    <textarea
                      value={personalInfo.professional_summary}
                      onChange={(e) => setPersonalInfo({...personalInfo, professional_summary: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      rows="4"
                      placeholder="Brief summary of your professional background..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Career Objective
                    </label>
                    <textarea
                      value={personalInfo.career_objective}
                      onChange={(e) => setPersonalInfo({...personalInfo, career_objective: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      rows="3"
                      placeholder="Your career goals and objectives..."
                    />
                  </div>
                  
                  <button
                    onClick={handlePersonalInfoSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Education Management Section */}
            {activeTab === 'education' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Education</h2>
                  <button
                    onClick={() => document.getElementById('addEducationModal').showModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Add Education</span>
                  </button>
                </div>
                
                {/* Education List */}
                <div className="space-y-4">
                  {profileData.educations.map((edu) => (
                    <div key={edu.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary transition-colors bg-gray-50 hover:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <FaGraduationCap className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                {/* Use helper function to display degree */}
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {getEducationDegreeLabel(edu)}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    {edu.graduation_year}
                                  </span>
                                </div>
                              </div>
                              
                              {edu.field_of_study && edu.field_of_study !== edu.degree && (
                                <p className="text-gray-700 mt-1">
                                  <span className="font-medium">Field of Study:</span> {edu.field_of_study}
                                </p>
                              )}
                              
                              <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <FaBuilding className="text-gray-400 text-sm" />
                                {edu.institution}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                {edu.gpa && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">CGPA:</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-md">{edu.gpa}/10.0</span>
                                  </div>
                                )}
                                {edu.percentage && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Percentage:</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-md">{edu.percentage}%</span>
                                  </div>
                                )}
                              </div>
                              
                              {edu.additional_certifications && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Additional Certifications:</h4>
                                  <p className="text-sm text-gray-600">{edu.additional_certifications}</p>
                                </div>
                              )}
                              
                              {edu.honors && (
                                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FaStar className="text-yellow-500" />
                                    <span className="font-medium text-gray-700">Honors/Distinctions:</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{edu.honors}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2">
                          <button
                            onClick={() => handleDeleteItem('educations', edu.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Education"
                          >
                            <FaTrash className="text-sm" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.educations.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaGraduationCap className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Education Added Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Add your education details to showcase your academic background to potential employers.
                      </p>
                      <button
                        onClick={() => document.getElementById('addEducationModal').showModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FaPlus />
                        Add Your First Education
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Skills Management Section */}
            {activeTab === 'skills' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Skills</h2>
                  <button
                    onClick={() => document.getElementById('addSkillModal').showModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Add Skill</span>
                  </button>
                </div>
                
                {/* Skills List */}
                <div className="space-y-4">
                  {profileData.skills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary transition-colors bg-gray-50 hover:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              skill.category === 'technical' ? 'bg-blue-100' :
                              skill.category === 'soft' ? 'bg-green-100' :
                              skill.category === 'business' ? 'bg-purple-100' :
                              skill.category === 'language' ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              <FaTools className={`${
                                skill.category === 'technical' ? 'text-blue-600' :
                                skill.category === 'soft' ? 'text-green-600' :
                                skill.category === 'business' ? 'text-purple-600' :
                                skill.category === 'language' ? 'text-yellow-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="font-bold text-gray-800 text-lg">{skill.name}</h3>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 text-sm rounded-full ${
                                    skill.level === 'expert' ? 'bg-green-100 text-green-800' :
                                    skill.level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                                    skill.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                                  </span>
                                  <span className="text-sm text-gray-500 capitalize">
                                    {skill.category}
                                  </span>
                                </div>
                              </div>
                              
                              {skill.years_of_experience > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Experience:</span>
                                    <div className="flex items-center gap-1">
                                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-full bg-primary rounded-full"
                                          style={{ width: `${Math.min(skill.years_of_experience * 20, 100)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-600 ml-2">
                                        {skill.years_of_experience} year{skill.years_of_experience > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2">
                          <button
                            onClick={() => handleDeleteItem('skills', skill.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Skill"
                          >
                            <FaTrash className="text-sm" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.skills.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTools className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Skills Added Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Add your skills to showcase your expertise to potential employers and get better job matches.
                      </p>
                      <button
                        onClick={() => document.getElementById('addSkillModal').showModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FaPlus />
                        Add Your First Skill
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Certifications Management Section */}
            {activeTab === 'certifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Certifications</h2>
                  <button
                    onClick={() => document.getElementById('addCertificationModal').showModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Add Certification</span>
                  </button>
                </div>
                
                {/* Certifications List */}
                <div className="space-y-4">
                  {profileData.certifications.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary transition-colors bg-gray-50 hover:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <FaCertificate className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="font-bold text-gray-800 text-lg">{cert.name}</h3>
                              </div>
                              
                              <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <FaBuilding className="text-gray-400 text-sm" />
                                {cert.issuing_organization}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                {cert.issue_date && (
                                  <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400" />
                                    <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-4">
                                {cert.certificate_file && (
                                  <>
                                    <button
                                      onClick={() => handleViewCertificate(cert.certificate_file)}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                    >
                                      <FaEye className="text-sm" />
                                      View Certificate
                                    </button>
                                    <button
                                      onClick={() => handleDownloadResume(cert.certificate_file, cert.name)}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors text-sm"
                                    >
                                      <FaDownload className="text-sm" />
                                      Download Certificate
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2">
                          <button
                            onClick={() => handleDeleteItem('certifications', cert.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Certification"
                          >
                            <FaTrash className="text-sm" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.certifications.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCertificate className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Certifications Added Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Add your certifications to validate your skills and increase your credibility with employers.
                      </p>
                      <button
                        onClick={() => document.getElementById('addCertificationModal').showModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FaPlus />
                        Add Your First Certification
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Work Experience Management Section */}
            {activeTab === 'experience' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Work Experience</h2>
                  <button
                    onClick={() => document.getElementById('addWorkExperienceModal').showModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Add Experience</span>
                  </button>
                </div>
                
                {/* Work Experience List */}
                <div className="space-y-4">
                  {profileData.work_experiences.map((exp) => (
                    <div key={exp.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary transition-colors bg-gray-50 hover:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <FaBriefcase className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="font-bold text-gray-800 text-lg">{exp.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 text-sm rounded-full ${
                                    exp.employment_type === 'full_time' ? 'bg-blue-100 text-blue-800' :
                                    exp.employment_type === 'part_time' ? 'bg-yellow-100 text-yellow-800' :
                                    exp.employment_type === 'contract' ? 'bg-orange-100 text-orange-800' :
                                    exp.employment_type === 'internship' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {exp.employment_type.replace('_', ' ')}
                                  </span>
                                  {exp.remote && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                      Remote
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                                <p className="text-gray-600 flex items-center gap-2">
                                  <FaBuilding className="text-gray-400 text-sm" />
                                  {exp.company}
                                </p>
                                {exp.location && (
                                  <p className="text-gray-500 text-sm flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                    {exp.location}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-3">
                                <FaCalendar className="text-gray-400 text-sm" />
                                <span className="text-sm text-gray-600">
                                  {new Date(exp.start_date).toLocaleDateString()} - 
                                  {exp.currently_working ? ' Present' : ` ${new Date(exp.end_date).toLocaleDateString()}`}
                                </span>
                              </div>
                              
                              {exp.description && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description:</h4>
                                  <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                                </div>
                              )}
                              
                              {exp.achievements && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Achievements:</h4>
                                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    {exp.achievements.split('\n').map((achievement, idx) => (
                                      <li key={idx} className="leading-relaxed">{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2">
                          <button
                            onClick={() => handleDeleteItem('work-experiences', exp.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Experience"
                          >
                            <FaTrash className="text-sm" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.work_experiences.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBriefcase className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Work Experience Added Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Add your work experience to showcase your professional journey and achievements to potential employers.
                      </p>
                      <button
                        onClick={() => document.getElementById('addWorkExperienceModal').showModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FaPlus />
                        Add Your First Experience
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Resume Management Section */}
            {activeTab === 'resume' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Resumes</h2>
                  <button
                    onClick={() => document.getElementById('uploadResumeModal').showModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Upload Resume</span>
                  </button>
                </div>
                
                {/* Resumes List */}
                <div className="space-y-4">
                  {profileData.resumes.map((resume) => (
                    <div key={resume.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary transition-colors bg-gray-50 hover:bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaFilePdf className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-bold text-gray-800 text-lg">{resume.title}</h3>
                                  {resume.is_primary && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                                      <FaStar className="text-xs" />
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">Size:</span>
                                  <span className="bg-gray-100 px-3 py-1 rounded-md">{resume.file_size}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">Format:</span>
                                  <span className="bg-gray-100 px-3 py-1 rounded-md uppercase">{resume.file.split('.').pop()}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2">
                          <button
                            onClick={() => handleSetPrimaryResume(resume.id)}
                            disabled={resume.is_primary}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              resume.is_primary 
                                ? 'text-yellow-600 bg-yellow-50 cursor-default' 
                                : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title={resume.is_primary ? 'Primary Resume' : 'Set as Primary'}
                          >
                            <FaStar className="text-sm" />
                            <span className="hidden sm:inline">Primary</span>
                          </button>
                          
                          <button
                            onClick={() => handleViewResume(resume.file)}
                            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Resume"
                          >
                            <FaEye className="text-sm" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          
                          <button
                            onClick={() => handleDownloadResume(resume.file, resume.title)}
                            className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Resume"
                          >
                            <FaDownload className="text-sm" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteItem('resumes', resume.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Resume"
                          >
                            <FaTrash className="text-sm" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.resumes.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFilePdf className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Resumes Uploaded Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Upload your resume to apply for jobs, get career recommendations, and showcase your profile to employers.
                      </p>
                      <button
                        onClick={() => document.getElementById('uploadResumeModal').showModal()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FaPlus />
                        Upload Your First Resume
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Profile Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Profile Summary</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {personalInfo.profile_picture_url ? (
                        <img 
                          src={personalInfo.profile_picture_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                          {personalInfo.name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800">
                      {personalInfo.name || user?.name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Education</span>
                    <span className="font-medium">
                      {profileData.educations.length} added
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Skills</span>
                    <span className="font-medium">
                      {profileData.skills.length} added
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Certifications</span>
                    <span className="font-medium">
                      {profileData.certifications.length} added
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Work Experience</span>
                    <span className="font-medium">
                      {profileData.work_experiences.length} added
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Resumes</span>
                    <span className="font-medium">
                      {profileData.resumes.length} uploaded
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Profile Strength</div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {completion < 30 && 'Just getting started!'}
                    {completion >= 30 && completion < 60 && 'Good progress!'}
                    {completion >= 60 && completion < 90 && 'Almost there!'}
                    {completion >= 90 && 'Excellent profile!'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('resume')}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaFilePdf className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Upload Resume</div>
                      <div className="text-sm text-gray-600">PDF, DOC, DOCX files</div>
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => loadProfileData()}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaRedo className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Refresh Profile</div>
                      <div className="text-sm text-gray-600">Load latest data</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaPrint className="text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Print Profile</div>
                      <div className="text-sm text-gray-600">Generate PDF</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* MODALS */}
      
      {/* Add Education Modal */}
      <dialog id="addEducationModal" className="modal">
        <div className="modal-box max-w-2xl bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Education Details</h3>
              <p className="text-sm text-gray-600 mt-1">Enter your academic information (saved automatically)</p>
            </div>
            <button 
              onClick={() => document.getElementById('addEducationModal').close()}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Degree Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Degree Level * <span className="text-gray-500">(Choose from extensive list)</span>
                </label>
                <div className="relative">
                  <select
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none"
                    required
                  >
                    <option value="">Select Degree Level</option>
                    {/* School Level */}
                    <optgroup label="School Level">
                      <option value="high_school">High School/Secondary School</option>
                    </optgroup>
                    
                    {/* Undergraduate */}
                    <optgroup label="Undergraduate Degrees">
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor of Engineering (B.E.)</option>
                      <option value="bachelor">Bachelor of Technology (B.Tech)</option>
                      <option value="bachelor">Bachelor of Science (B.Sc)</option>
                      <option value="bachelor">Bachelor of Commerce (B.Com)</option>
                      <option value="bachelor">Bachelor of Arts (B.A.)</option>
                      <option value="bachelor">Bachelor of Business Administration (BBA)</option>
                      <option value="bachelor">Bachelor of Computer Applications (BCA)</option>
                      <option value="bachelor">Bachelor of Architecture (B.Arch)</option>
                      <option value="bachelor">Bachelor of Pharmacy (B.Pharm)</option>
                      <option value="bachelor">Bachelor of Laws (LLB)</option>
                      <option value="bachelor">Bachelor of Medicine, Bachelor of Surgery (MBBS)</option>
                    </optgroup>
                    
                    {/* Postgraduate */}
                    <optgroup label="Postgraduate Degrees">
                      <option value="master">Master of Engineering (M.E.)</option>
                      <option value="master">Master of Technology (M.Tech)</option>
                      <option value="master">Master of Science (M.Sc)</option>
                      <option value="master">Master of Arts (M.A.)</option>
                      <option value="master">Master of Commerce (M.Com)</option>
                      <option value="master">Master of Business Administration (MBA)</option>
                      <option value="master">Master of Computer Applications (MCA)</option>
                      <option value="master">Master of Architecture (M.Arch)</option>
                      <option value="master">Master of Pharmacy (M.Pharm)</option>
                      <option value="master">Master of Laws (LLM)</option>
                      <option value="master">Master of Surgery (MS)</option>
                      <option value="master">Doctor of Medicine (MD)</option>
                    </optgroup>
                    
                    {/* Doctorate */}
                    <optgroup label="Doctoral Degrees">
                      <option value="phd">Doctor of Philosophy (PhD)</option>
                      <option value="phd">Doctor of Science (D.Sc)</option>
                      <option value="phd">Doctor of Literature (D.Litt)</option>
                    </optgroup>
                    
                    {/* Other */}
                    <optgroup label="Other">
                      <option value="other">Other Degree</option>
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Custom degree input if "Other" is selected */}
                {newEducation.degree === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newEducation.customDegree || ''}
                      onChange={(e) => setNewEducation({...newEducation, customDegree: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your custom degree name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Note: This will be stored in the "field_of_study" field
                    </p>
                  </div>
                )}
              </div>
              
              {/* Specialization Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Specialization/Major <span className="text-gray-500">(Choose or type your own)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      onChange={(e) => {
                        const field = e.target.value;
                        if (field && field !== 'custom') {
                          setNewEducation({...newEducation, specialization: field});
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select Field Category</option>
                      {Object.keys(specializationOptions).map((category) => (
                        <optgroup key={category} label={category}>
                          <option value="">--- {category} ---</option>
                          {specializationOptions[category].map((spec, index) => (
                            <option key={`${category}-${index}`} value={spec}>{spec}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newEducation.specialization}
                      onChange={(e) => setNewEducation({...newEducation, specialization: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Or type your specialization"
                    />
                  </div>
                </div>
              </div>
              
              {/* Institution */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Institution Name * <span className="text-gray-500">(Choose or type your own)</span>
                </label>
                <div className="relative">
                  <select
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none"
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutionOptions.map((institution, index) => (
                      <option key={index} value={institution}>{institution}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Custom institution input if "Other" is selected */}
                {newEducation.institution === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newEducation.customInstitution || ''}
                      onChange={(e) => setNewEducation({...newEducation, customInstitution: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your institution name"
                      required
                    />
                  </div>
                )}
              </div>
              
              {/* Academic Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    CGPA (0-10)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={newEducation.gpa}
                      onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="8.75"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">/10</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Enter CGPA if applicable</div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newEducation.percentage}
                      onChange={(e) => setNewEducation({...newEducation, percentage: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="85.5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Enter percentage if applicable</div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year of Graduation *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newEducation.graduation_year}
                      onChange={(e) => setNewEducation({...newEducation, graduation_year: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">YYYY</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Certifications */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Certifications (Optional)
                </label>
                <textarea
                  value={newEducation.additional_certifications}
                  onChange={(e) => setNewEducation({...newEducation, additional_certifications: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  rows="3"
                  placeholder="List any additional certifications, workshops, or training programs completed during this degree..."
                />
                <div className="text-xs text-gray-500">
                  Separate certifications with commas or new lines
                </div>
              </div>
              
              {/* Honors/Distinctions */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Honors/Distinctions (Optional)
                </label>
                <textarea
                  value={newEducation.honors}
                  onChange={(e) => setNewEducation({...newEducation, honors: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  rows="3"
                  placeholder="Any honors, awards, scholarships, or distinctions received..."
                />
              </div>
              
              {/* Data Persistence Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaSave className="text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Automatic Data Saving</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      Your education data is automatically saved to your profile and will persist even after logout.
                      You can edit or delete entries anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => {
                setNewEducation({
                  degree: 'bachelor',
                  specialization: '',
                  institution: '',
                  gpa: '',
                  percentage: '',
                  graduation_year: new Date().getFullYear(),
                  honors: '',
                  additional_certifications: '',
                  customDegree: '',
                  customInstitution: ''
                });
                document.getElementById('addEducationModal').close();
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEducation}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Saving...
                </span>
              ) : 'Save Education'}
            </button>
          </div>
        </div>
        
        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      
      {/* Add Skill Modal */}
      <dialog id="addSkillModal" className="modal">
        <div className="modal-box max-w-2xl bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Skill</h3>
              <p className="text-sm text-gray-600 mt-1">Add your professional skills</p>
            </div>
            <button 
              onClick={() => document.getElementById('addSkillModal').close()}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Skill Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Skill Name * <span className="text-gray-500">(Choose or type your own)</span>
                </label>
                <div className="relative">
                  <select
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none"
                    required
                  >
                    <option value="">Select Skill</option>
                    {skillOptions.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Custom skill input if "Other" is selected */}
                {newSkill.name === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newSkill.customSkill || ''}
                      onChange={(e) => setNewSkill({...newSkill, customSkill: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your custom skill name"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                  >
                    {skillCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                  >
                    {skillLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newSkill.years_of_experience}
                    onChange={(e) => setNewSkill({...newSkill, years_of_experience: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g., 3.5"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => document.getElementById('addSkillModal').close()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSkill}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Adding...
                </span>
              ) : 'Add Skill'}
            </button>
          </div>
        </div>
        
        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      
      {/* Add Certification Modal */}
      <dialog id="addCertificationModal" className="modal">
        <div className="modal-box max-w-2xl bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Certification</h3>
              <p className="text-sm text-gray-600 mt-1">Add your professional certifications</p>
            </div>
            <button 
              onClick={() => document.getElementById('addCertificationModal').close()}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g., AWS Certified Solutions Architect"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={newCertification.issuing_organization}
                    onChange={(e) => setNewCertification({...newCertification, issuing_organization: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Amazon Web Services"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={newCertification.issue_date}
                  onChange={(e) => setNewCertification({...newCertification, issue_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Certificate File (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <FaCertificate className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="certificate-file" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          id="certificate-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileChange(e, setNewCertification, 'certificate_file')}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                    {newCertification.certificate_file && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FaCertificate className="h-6 w-6 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{newCertification.certificate_file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(newCertification.certificate_file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNewCertification({...newCertification, certificate_file: null})}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => document.getElementById('addCertificationModal').close()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCertification}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Adding...
                </span>
              ) : 'Add Certification'}
            </button>
          </div>
        </div>
        
        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      
      {/* Add Work Experience Modal */}
      <dialog id="addWorkExperienceModal" className="modal">
        <div className="modal-box max-w-3xl bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Work Experience</h3>
              <p className="text-sm text-gray-600 mt-1">Add your professional work experience</p>
            </div>
            <button 
              onClick={() => document.getElementById('addWorkExperienceModal').close()}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newWorkExperience.title}
                    onChange={(e) => setNewWorkExperience({...newWorkExperience, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={newWorkExperience.company}
                    onChange={(e) => setNewWorkExperience({...newWorkExperience, company: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Company name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Employment Type
                  </label>
                  <select
                    value={newWorkExperience.employment_type}
                    onChange={(e) => setNewWorkExperience({...newWorkExperience, employment_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newWorkExperience.location}
                    onChange={(e) => setNewWorkExperience({...newWorkExperience, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g., New York, NY"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Remote Work
                  </label>
                  <div className="flex items-center h-12">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      checked={newWorkExperience.remote}
                      onChange={(e) => setNewWorkExperience({...newWorkExperience, remote: e.target.checked})}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor="remoteWork" className="ml-3 text-sm text-gray-700">
                      This is a remote position
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newWorkExperience.start_date}
                    onChange={(e) => setNewWorkExperience({...newWorkExperience, start_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={newWorkExperience.end_date}
                      onChange={(e) => setNewWorkExperience({...newWorkExperience, end_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={newWorkExperience.currently_working}
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="currentlyWorking"
                        checked={newWorkExperience.currently_working}
                        onChange={(e) => setNewWorkExperience({...newWorkExperience, currently_working: e.target.checked})}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                      />
                      <label htmlFor="currentlyWorking" className="ml-3 text-sm text-gray-700">
                        I currently work here
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <textarea
                  value={newWorkExperience.description}
                  onChange={(e) => setNewWorkExperience({...newWorkExperience, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  rows="4"
                  placeholder="Describe your responsibilities, projects, and achievements in this role..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Key Achievements
                </label>
                <textarea
                  value={newWorkExperience.achievements}
                  onChange={(e) => setNewWorkExperience({...newWorkExperience, achievements: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  rows="3"
                  placeholder="List your notable accomplishments, projects, or awards..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate each achievement with a new line
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => document.getElementById('addWorkExperienceModal').close()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkExperience}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Adding...
                </span>
              ) : 'Add Experience'}
            </button>
          </div>
        </div>
        
        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      
      {/* Upload Resume Modal */}
      <dialog id="uploadResumeModal" className="modal">
        <div className="modal-box max-w-xl bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Upload Resume</h3>
              <p className="text-sm text-gray-600 mt-1">Upload your resume in PDF, DOC, or DOCX format</p>
            </div>
            <button 
              onClick={() => document.getElementById('uploadResumeModal').close()}
              className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resume Title
                </label>
                <input
                  type="text"
                  value={newResume.title}
                  onChange={(e) => setNewResume({...newResume, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Updated Resume 2024, Software Engineer Resume"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resume File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="space-y-3 text-center">
                    <FaFilePdf className="mx-auto h-14 w-14 text-gray-400" />
                    <div className="flex flex-col items-center text-sm text-gray-600">
                      <label htmlFor="resume-file" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span className="text-lg">Choose a file</span>
                        <input
                          id="resume-file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, setNewResume, 'file')}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="mt-2">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                    {newResume.file && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FaFilePdf className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{newResume.file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(newResume.file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNewResume({...newResume, file: null})}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => document.getElementById('uploadResumeModal').close()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadResume}
              disabled={saving || !newResume.file}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </span>
              ) : 'Upload Resume'}
            </button>
          </div>
        </div>
        
        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Profile;