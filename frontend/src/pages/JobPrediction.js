import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBrain, FaChartLine, FaMoneyBillWave, FaStar, FaCheckCircle,
  FaClock, FaLightbulb, FaArrowRight, FaHistory,
  FaCogs, FaRobot, FaGraduationCap, FaUser,
  FaCode, FaDatabase, FaCloud, FaMobile, FaShieldAlt, FaTools,
  FaExclamationTriangle, FaTimes, FaSmile, FaFrown, FaMeh,
  FaComment, FaDownload, FaShareAlt, FaSyncAlt, FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';

const JobPrediction = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [savingPrediction, setSavingPrediction] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  // Initialize form data with proper defaults
  const [formData, setFormData] = useState({
    // Personal Information
    age: 25,
    gender: 'Male',
    location_country: 'USA',
    location_city_tier: '1',
    second_language: 'None',

    // Education
    highest_degree: 'bachelor',
    degree_field: 'computer_science',
    institution_tier: '2',
    gpa_score: 8.5,
    graduation_year: 2020,
    years_since_graduation: 4,

    // Experience
    total_experience_years: 3,
    current_role_level: 'mid',
    industry: 'tech',
    company_size: 'startup',
    job_hop_count: 1,
    has_managerial_exp: false,
    team_size_managed: 0,
    budget_responsibility: 0.0,
    international_exp: false,
    remote_work_percentage: 50,
    freelance_projects: 0,
    patents_filed: 0,
    open_source_contributions: 0,
    career_gap_months: 0,

    // Skills & Certifications
    additional_certs_count: 2,
    online_courses_completed: 5,
    research_publications: 0,
    academic_awards: 1,
    professional_network_size: 150,

    // Certifications (binary flags)
    cert_aws: 0,
    cert_google_cloud: 0,
    cert_azure: 0,
    cert_pmp: 0,
    cert_scrum: 0,
    cert_data_science: 0,
    cert_cybersecurity: 0,
    cert_digital_marketing: 0,
    cert_oracle: 0,
    cert_redhat: 0,
    cert_cisco: 0,
    cert_microsoft: 0,
    cert_salesforce: 0,
    cert_tableau: 0,
    cert_python_institute: 0,
    cert_java_ocp: 0,

    // Derived scores (will be calculated)
    tech_skill_score: 0,
    soft_skill_score: 0,
    premium_cert_score: 0,
    experience_quality_score: 0,
    education_score: 0,
    overall_profile_score: 0,
    career_progression_rate: 0,
    skill_diversity_index: 0,
    industry_experience_years: 0,
    profile_completeness: 0,
  });

  // All technical skills from dataset (134 skills)
  const allTechnicalSkills = [
    // ======= PROGRAMMING LANGUAGES (17 skills) =======
    { value: 'skill_python', label: 'Python', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_java', label: 'Java', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_javascript', label: 'JavaScript', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_cpp', label: 'C++', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_csharp', label: 'C#', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_go', label: 'Go', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_rust', label: 'Rust', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_kotlin', label: 'Kotlin', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_swift', label: 'Swift', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_php', label: 'PHP', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_ruby', label: 'Ruby', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_scala', label: 'Scala', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_typescript', label: 'TypeScript', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_r', label: 'R', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_perl', label: 'Perl', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_bash', label: 'Bash', category: 'Programming Languages', icon: <FaCode /> },
    { value: 'skill_powershell', label: 'PowerShell', category: 'Programming Languages', icon: <FaCode /> },

    // ======= WEB DEVELOPMENT FRAMEWORKS (17 skills) =======
    { value: 'skill_react', label: 'React', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_angular', label: 'Angular', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_vue', label: 'Vue.js', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_nodejs', label: 'Node.js', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_django', label: 'Django', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_flask', label: 'Flask', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_spring', label: 'Spring', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_laravel', label: 'Laravel', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_express', label: 'Express.js', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_ruby_on_rails', label: 'Ruby on Rails', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_asp_net', label: 'ASP.NET', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_jquery', label: 'jQuery', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_html_css', label: 'HTML/CSS', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_bootstrap', label: 'Bootstrap', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_sass', label: 'Sass', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_webpack', label: 'Webpack', category: 'Web Development', icon: <FaCode /> },
    { value: 'skill_figma', label: 'Figma', category: 'Design', icon: <FaCode /> },
    { value: 'skill_design_systems', label: 'Design Systems', category: 'Design', icon: <FaCode /> },
    { value: 'skill_user_research', label: 'User Research', category: 'Design', icon: <FaCode /> },
    { value: 'skill_prototyping', label: 'Prototyping', category: 'Design', icon: <FaCode /> },

    // ======= DATABASES (12 skills) =======
    { value: 'skill_sql', label: 'SQL', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_mongodb', label: 'MongoDB', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_postgresql', label: 'PostgreSQL', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_mysql', label: 'MySQL', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_redis', label: 'Redis', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_elasticsearch', label: 'Elasticsearch', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_oracle_db', label: 'Oracle DB', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_sql_server', label: 'SQL Server', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_cassandra', label: 'Cassandra', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_dynamodb', label: 'DynamoDB', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_firebase', label: 'Firebase', category: 'Databases', icon: <FaDatabase /> },
    { value: 'skill_cosmosdb', label: 'Cosmos DB', category: 'Databases', icon: <FaDatabase /> },

    // ======= DATA SCIENCE & MACHINE LEARNING (17 skills) =======
    { value: 'skill_machine_learning', label: 'Machine Learning', category: 'Data Science & ML', icon: <FaBrain /> },
    { value: 'skill_deep_learning', label: 'Deep Learning', category: 'Data Science & ML', icon: <FaBrain /> },
    { value: 'skill_data_analysis', label: 'Data Analysis', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_data_visualization', label: 'Data Visualization', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_tensorflow', label: 'TensorFlow', category: 'Data Science & ML', icon: <FaBrain /> },
    { value: 'skill_pytorch', label: 'PyTorch', category: 'Data Science & ML', icon: <FaBrain /> },
    { value: 'skill_scikit_learn', label: 'Scikit-learn', category: 'Data Science & ML', icon: <FaBrain /> },
    { value: 'skill_pandas', label: 'Pandas', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_numpy', label: 'NumPy', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_tableau', label: 'Tableau', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_powerbi', label: 'Power BI', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_qlik', label: 'Qlik', category: 'Data Science & ML', icon: <FaChartLine /> },
    { value: 'skill_hadoop', label: 'Hadoop', category: 'Data Science & ML', icon: <FaDatabase /> },
    { value: 'skill_spark', label: 'Spark', category: 'Data Science & ML', icon: <FaDatabase /> },
    { value: 'skill_kafka', label: 'Kafka', category: 'Data Science & ML', icon: <FaDatabase /> },
    { value: 'skill_airflow', label: 'Airflow', category: 'Data Science & ML', icon: <FaDatabase /> },

    // ======= CLOUD & DEVOPS (11 skills) =======
    { value: 'skill_aws', label: 'AWS', category: 'Cloud & DevOps', icon: <FaCloud /> },
    { value: 'skill_azure', label: 'Azure', category: 'Cloud & DevOps', icon: <FaCloud /> },
    { value: 'skill_google_cloud', label: 'Google Cloud', category: 'Cloud & DevOps', icon: <FaCloud /> },
    { value: 'skill_docker', label: 'Docker', category: 'Cloud & DevOps', icon: <FaCloud /> },
    { value: 'skill_kubernetes', label: 'Kubernetes', category: 'Cloud & DevOps', icon: <FaCloud /> },
    { value: 'skill_jenkins', label: 'Jenkins', category: 'Cloud & DevOps', icon: <FaTools /> },
    { value: 'skill_ansible', label: 'Ansible', category: 'Cloud & DevOps', icon: <FaTools /> },
    { value: 'skill_terraform', label: 'Terraform', category: 'Cloud & DevOps', icon: <FaTools /> },
    { value: 'skill_git', label: 'Git', category: 'Cloud & DevOps', icon: <FaTools /> },
    { value: 'skill_ci_cd', label: 'CI/CD', category: 'Cloud & DevOps', icon: <FaTools /> },
    { value: 'skill_linux', label: 'Linux', category: 'Cloud & DevOps', icon: <FaTools /> },

    // ======= SYSTEM & SERVER (3 skills) =======
    { value: 'skill_windows_server', label: 'Windows Server', category: 'System & Server', icon: <FaTools /> },
    { value: 'skill_nginx', label: 'Nginx', category: 'System & Server', icon: <FaTools /> },
    { value: 'skill_apache', label: 'Apache', category: 'System & Server', icon: <FaTools /> },

    // ======= MOBILE DEVELOPMENT (6 skills) =======
    { value: 'skill_android_development', label: 'Android Development', category: 'Mobile Development', icon: <FaMobile /> },
    { value: 'skill_ios_development', label: 'iOS Development', category: 'Mobile Development', icon: <FaMobile /> },
    { value: 'skill_react_native', label: 'React Native', category: 'Mobile Development', icon: <FaMobile /> },
    { value: 'skill_flutter', label: 'Flutter', category: 'Mobile Development', icon: <FaMobile /> },
    { value: 'skill_xamarin', label: 'Xamarin', category: 'Mobile Development', icon: <FaMobile /> },
    { value: 'skill_ionic', label: 'Ionic', category: 'Mobile Development', icon: <FaMobile /> },

    // ======= TESTING TOOLS (8 skills) =======
    { value: 'skill_selenium', label: 'Selenium', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_junit', label: 'JUnit', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_testng', label: 'TestNG', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_jmeter', label: 'JMeter', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_postman', label: 'Postman', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_soapui', label: 'SoapUI', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_cypress', label: 'Cypress', category: 'Testing Tools', icon: <FaTools /> },
    { value: 'skill_jest', label: 'Jest', category: 'Testing Tools', icon: <FaTools /> },

    // ======= CYBERSECURITY (5 skills) =======
    { value: 'skill_cybersecurity', label: 'Cybersecurity', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_network_security', label: 'Network Security', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_ethical_hacking', label: 'Ethical Hacking', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_penetration_testing', label: 'Penetration Testing', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_security_audit', label: 'Security Audit', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_incident_response', label: 'Incident Response', category: 'Cybersecurity', icon: <FaShieldAlt /> },
    { value: 'skill_siem', label: 'SIEM (Splunk/ELK)', category: 'Cybersecurity', icon: <FaShieldAlt /> },

    // ======= EMERGING TECHNOLOGIES (9 skills) =======
    { value: 'skill_blockchain', label: 'Blockchain', category: 'Emerging Technologies', icon: <FaCode /> },
    { value: 'skill_iot', label: 'IoT', category: 'Emerging Technologies', icon: <FaCode /> },
    { value: 'skill_ar_vr', label: 'AR/VR', category: 'Emerging Technologies', icon: <FaCode /> },
    { value: 'skill_computer_vision', label: 'Computer Vision', category: 'Emerging Technologies', icon: <FaBrain /> },
    { value: 'skill_nlp', label: 'NLP', category: 'Emerging Technologies', icon: <FaBrain /> },
    { value: 'skill_robotics', label: 'Robotics', category: 'Emerging Technologies', icon: <FaTools /> },
    { value: 'skill_embedded_systems', label: 'Embedded Systems', category: 'Emerging Technologies', icon: <FaTools /> },
    { value: 'skill_fpga', label: 'FPGA', category: 'Emerging Technologies', icon: <FaTools /> },
    { value: 'skill_vls', label: 'VLSI', category: 'Emerging Technologies', icon: <FaTools /> },

    // ======= SOFT SKILLS (15 skills) =======
    { value: 'skill_communication', label: 'Communication', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_leadership', label: 'Leadership', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_problem_solving', label: 'Problem Solving', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_teamwork', label: 'Teamwork', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_project_management', label: 'Project Management', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_english_proficiency', label: 'English Proficiency', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_presentation_skills', label: 'Presentation Skills', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_negotiation_skills', label: 'Negotiation Skills', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_time_management', label: 'Time Management', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_critical_thinking', label: 'Critical Thinking', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_creativity', label: 'Creativity', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_adaptability', label: 'Adaptability', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_conflict_resolution', label: 'Conflict Resolution', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_mentoring', label: 'Mentoring', category: 'Soft Skills', icon: <FaUser /> },
    { value: 'skill_client_management', label: 'Client Management', category: 'Soft Skills', icon: <FaUser /> }
  ];

  const proficiencyLevels = [
    { value: 0, label: 'No Experience' },
    { value: 1, label: 'Basic Awareness' },
    { value: 2, label: 'Novice' },
    { value: 3, label: 'Beginner' },
    { value: 4, label: 'Intermediate' },
    { value: 5, label: 'Proficient' },
    { value: 6, label: 'Advanced' },
    { value: 7, label: 'Expert' },
    { value: 8, label: 'Master' },
    { value: 9, label: 'Specialist' },
    { value: 10, label: 'World Class' }
  ];

  // Group skills by category
  const skillsByCategory = {};
  allTechnicalSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  const categories = [
    'Programming Languages',
    'Web Development',
    'Databases',
    'Data Science & ML',
    'Cloud & DevOps',
    'System & Server',
    'Mobile Development',
    'Testing Tools',
    'Cybersecurity',
    'Emerging Technologies',
    'Soft Skills'
  ];

  const quickSkillSuggestions = {
    // ===== SOFTWARE DEVELOPMENT ROLES =====
    'Software Engineer': ['skill_python', 'skill_java', 'skill_javascript', 'skill_react', 'skill_nodejs', 'skill_sql', 'skill_git', 'skill_problem_solving'],
    'Frontend Developer': ['skill_javascript', 'skill_react', 'skill_html_css', 'skill_typescript', 'skill_vue', 'skill_angular', 'skill_sass', 'skill_webpack'],
    'Backend Developer': ['skill_python', 'skill_java', 'skill_nodejs', 'skill_sql', 'skill_mongodb', 'skill_django', 'skill_spring', 'skill_postgresql'],
    'Full Stack Developer': ['skill_javascript', 'skill_python', 'skill_react', 'skill_nodejs', 'skill_sql', 'skill_aws', 'skill_docker', 'skill_git'],

    // ===== DATA & AI ROLES =====
    'Data Scientist': ['skill_python', 'skill_r', 'skill_machine_learning', 'skill_sql', 'skill_pandas', 'skill_tensorflow', 'skill_data_analysis', 'skill_data_visualization'],
    'Data Analyst': ['skill_sql', 'skill_python', 'skill_data_analysis', 'skill_data_visualization', 'skill_tableau', 'skill_powerbi', 'skill_pandas', 'skill_numpy'],
    'ML Engineer': ['skill_python', 'skill_machine_learning', 'skill_deep_learning', 'skill_tensorflow', 'skill_pytorch', 'skill_scikit_learn', 'skill_numpy', 'skill_pandas'],
    'Data Engineer': ['skill_python', 'skill_sql', 'skill_spark', 'skill_hadoop', 'skill_kafka', 'skill_airflow', 'skill_aws', 'skill_postgresql'],

    // ===== DEVOPS & CLOUD ROLES =====
    'DevOps Engineer': ['skill_aws', 'skill_docker', 'skill_kubernetes', 'skill_jenkins', 'skill_linux', 'skill_python', 'skill_terraform', 'skill_ci_cd'],
    'Cloud Architect': ['skill_aws', 'skill_azure', 'skill_google_cloud', 'skill_kubernetes', 'skill_terraform', 'skill_docker', 'skill_linux', 'skill_ansible'],
    'Linux Administrator': ['skill_linux', 'skill_bash', 'skill_powershell', 'skill_python', 'skill_nginx', 'skill_apache', 'skill_git', 'skill_network_security'],

    // ===== MOBILE DEVELOPMENT ROLES =====
    'Mobile Developer': ['skill_react_native', 'skill_flutter', 'skill_javascript', 'skill_kotlin', 'skill_swift', 'skill_android_development', 'skill_ios_development', 'skill_firebase'],
    'iOS Developer': ['skill_swift', 'skill_ios_development', 'skill_git', 'skill_firebase', 'skill_sql', 'skill_javascript'],

    // ===== SPECIALIZED ENGINEERING =====
    'Security Engineer': ['skill_cybersecurity', 'skill_network_security', 'skill_penetration_testing', 'skill_ethical_hacking', 'skill_linux', 'skill_incident_response', 'skill_siem', 'skill_problem_solving'],
    'QA Engineer': ['skill_selenium', 'skill_junit', 'skill_testng', 'skill_jmeter', 'skill_postman', 'skill_cypress', 'skill_jest', 'skill_python'],
    'Database Administrator': ['skill_sql', 'skill_postgresql', 'skill_mysql', 'skill_oracle_db', 'skill_mongodb', 'skill_redis', 'skill_linux', 'skill_python'],
    'Game Developer': ['skill_cpp', 'skill_csharp', 'skill_python', 'skill_javascript', 'skill_git'],
    'Embedded Systems Engineer': ['skill_embedded_systems', 'skill_cpp', 'skill_python', 'skill_fpga', 'skill_vls', 'skill_robotics', 'skill_linux'],
    'UI/UX Designer': ['skill_figma', 'skill_design_systems', 'skill_user_research', 'skill_prototyping', 'skill_html_css', 'skill_creativity', 'skill_javascript'],
    'Product Manager': ['skill_communication', 'skill_leadership', 'skill_data_analysis', 'skill_project_management', 'skill_teamwork', 'skill_problem_solving']
  };

  // Helper to format job role labels (snake_case to Title Case)
  const formatJobRole = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Ui Ux', 'UI/UX')
      .replace('Ml', 'ML')
      .replace('Qa', 'QA')
      .replace('Ai', 'AI');
  };

  // Feedback star descriptions
  const starDescriptions = [
    'Very Dissatisfied',
    'Dissatisfied',
    'Neutral',
    'Satisfied',
    'Very Satisfied'
  ];

  // Star emojis for different ratings
  const starEmojis = [<FaFrown />, <FaFrown />, <FaMeh />, <FaSmile />, <FaSmile />];

  useEffect(() => {
    // Reset form when component mounts
    setFormData({
      age: 25,
      gender: 'Male',
      location_country: 'USA',
      location_city_tier: '1',
      second_language: 'None',
      highest_degree: 'bachelor',
      degree_field: 'computer_science',
      institution_tier: '2',
      gpa_score: 8.5,
      graduation_year: 2020,
      years_since_graduation: 4,
      total_experience_years: 3,
      current_role_level: 'mid',
      industry: 'tech',
      company_size: 'startup',
      job_hop_count: 1,
      has_managerial_exp: false,
      team_size_managed: 0,
      budget_responsibility: 0.0,
      international_exp: false,
      remote_work_percentage: 50,
      freelance_projects: 0,
      patents_filed: 0,
      open_source_contributions: 0,
      career_gap_months: 0,
      additional_certs_count: 2,
      online_courses_completed: 5,
      research_publications: 0,
      academic_awards: 1,
      professional_network_size: 150,
      cert_aws: 0,
      cert_google_cloud: 0,
      cert_azure: 0,
      cert_pmp: 0,
      cert_scrum: 0,
      cert_data_science: 0,
      cert_cybersecurity: 0,
      cert_digital_marketing: 0,
      cert_oracle: 0,
      cert_redhat: 0,
      cert_cisco: 0,
      cert_microsoft: 0,
      cert_salesforce: 0,
      cert_tableau: 0,
      cert_python_institute: 0,
      cert_java_ocp: 0,
      tech_skill_score: 0,
      soft_skill_score: 0,
      premium_cert_score: 0,
      experience_quality_score: 0,
      education_score: 0,
      overall_profile_score: 0,
      career_progression_rate: 0,
      skill_diversity_index: 0,
      industry_experience_years: 0,
      profile_completeness: 0,
    });
    setSelectedSkills([]);
    setPrediction(null);
    setPredictionId(null);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) :
        type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleAddSkill = (skillValue) => {
    if (!skillValue) return;

    const skill = allTechnicalSkills.find(s => s.value === skillValue);
    if (!skill) return;

    // Check if skill already exists
    if (selectedSkills.some(s => s.skill === skillValue)) return;

    setSelectedSkills(prev => [
      ...prev,
      {
        skill: skillValue,
        proficiency: 5,
        category: skill.category,
        label: skill.label,
        icon: skill.icon
      }
    ]);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(prev => prev.filter(s => s.skill !== skillToRemove));
  };

  const handleProficiencyChange = (skill, proficiency) => {
    setSelectedSkills(prev =>
      prev.map(s =>
        s.skill === skill ? { ...s, proficiency: parseInt(proficiency) } : s
      )
    );
  };

  const validateForm = () => {
    if (!formData.age || formData.age < 18 || formData.age > 70) {
      setError('Age must be between 18 and 70');
      return false;
    }
    if (!formData.gpa_score || formData.gpa_score < 0 || formData.gpa_score > 10) {
      setError('GPA must be between 0 and 10');
      return false;
    }
    if (selectedSkills.length === 0) {
      setError('Please add at least one technical skill');
      return false;
    }
    return true;
  };

  const calculateDerivedScores = () => {
    // Calculate tech skill score (average of all selected technical skills)
    const techSkills = selectedSkills.filter(s =>
      s.category !== 'Soft Skills' &&
      !s.skill.includes('score') &&
      !s.skill.includes('index')
    );

    const totalTechProficiency = techSkills.reduce((sum, skill) => sum + skill.proficiency, 0);
    const techSkillScore = techSkills.length > 0 ? totalTechProficiency / techSkills.length : 0;

    // Calculate soft skill score (average of soft skills)
    const softSkills = selectedSkills.filter(s => s.category === 'Soft Skills');
    const totalSoftProficiency = softSkills.reduce((sum, skill) => sum + skill.proficiency, 0);
    const softSkillScore = softSkills.length > 0 ? totalSoftProficiency / softSkills.length : 0;

    // Calculate premium cert score
    const premiumCertScore = (
      (formData.cert_aws ? 1 : 0) +
      (formData.cert_google_cloud ? 1 : 0) +
      (formData.cert_azure ? 1 : 0) +
      (formData.cert_pmp ? 1 : 0) +
      (formData.cert_scrum ? 1 : 0)
    ) * 2;

    // Calculate experience quality score
    const experienceQualityScore = Math.min(
      (formData.total_experience_years * 0.5) +
      (formData.has_managerial_exp ? 2 : 0) +
      (formData.international_exp ? 1 : 0) +
      (formData.remote_work_percentage > 50 ? 1 : 0),
      10
    );

    // Calculate education score
    const educationScore = (
      (formData.gpa_score * 0.7) +
      (formData.institution_tier === '1' ? 3 :
        formData.institution_tier === '2' ? 2 :
          formData.institution_tier === '3' ? 1 : 0)
    );

    // Calculate overall profile score
    const overallProfileScore = (
      techSkillScore * 0.35 +
      softSkillScore * 0.15 +
      educationScore * 0.25 +
      experienceQualityScore * 0.25
    );

    // Calculate skill diversity index
    const uniqueCategories = new Set(selectedSkills.map(s => s.category));
    const skillDiversityIndex = (uniqueCategories.size / categories.length) * 10;

    return {
      tech_skill_score: parseFloat(techSkillScore.toFixed(2)),
      soft_skill_score: parseFloat(softSkillScore.toFixed(2)),
      premium_cert_score: premiumCertScore,
      experience_quality_score: parseFloat(experienceQualityScore.toFixed(2)),
      education_score: parseFloat(educationScore.toFixed(2)),
      overall_profile_score: parseFloat(overallProfileScore.toFixed(2)),
      skill_diversity_index: parseFloat(skillDiversityIndex.toFixed(2)),
      career_progression_rate: 1.5,
      industry_experience_years: formData.total_experience_years,
      profile_completeness: 85
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate derived scores
      const derivedScores = calculateDerivedScores();

      // Prepare form data
      const submissionData = { ...formData, ...derivedScores };

      // IMPORTANT: Initialize ALL skill fields to 0
      allTechnicalSkills.forEach(skill => {
        submissionData[skill.value] = 0;
      });

      // Set values for selected skills
      selectedSkills.forEach(({ skill, proficiency }) => {
        submissionData[skill] = proficiency;
      });

      console.log('Submitting data with', selectedSkills.length, 'skills');

      // Step 1: Get the prediction
      const predictionResponse = await axios.post('http://localhost:8000/api/predictions/predict/', submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (predictionResponse.data) {
        // Step 2: Set the prediction for display
        setPrediction(predictionResponse.data);
        setStep(3);

        // Step 3: Check if we need to save to history
        // Only save if we get a successful prediction response
        let savedPredictionId = null;
        try {
          const historyData = {
            top_prediction: predictionResponse.data.top_prediction?.job_role || predictionResponse.data.predictions?.[0]?.job_role,
            confidence_score: predictionResponse.data.top_prediction?.confidence || predictionResponse.data.predictions?.[0]?.confidence_score || 85,
            input_data: submissionData,
            all_predictions: predictionResponse.data.predictions || []
          };

          const historyResponse = await axios.post('http://localhost:8000/api/predictions/history/save/', historyData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          savedPredictionId = historyResponse.data?.prediction_id;
          console.log('Prediction saved to history with ID:', savedPredictionId);
        } catch (historyError) {
          console.error('Error saving to history:', historyError);
          // Don't fail the whole prediction if history save fails
        }

        setPredictionId(savedPredictionId);

        // Step 4: Show feedback popup after 2 seconds
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmittingFeedback(true);
    setError('');

    try {
      const feedbackData = {
        prediction_id: predictionId,
        rating: feedbackRating,
        comment: feedbackComment,
        user_id: user?.id,
        user_email: user?.email
      };

      console.log('Submitting feedback:', feedbackData);

      // First try the main feedback endpoint
      try {
        const response = await axios.post('http://localhost:8000/api/predictions/feedback/', feedbackData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          alert('Thank you for your feedback! Your rating helps us improve the prediction model.');
          setShowFeedback(false);
          setFeedbackRating(0);
          setFeedbackComment('');
          setHoverRating(0);
          return;
        }
      } catch (firstErr) {
        console.log('First feedback endpoint failed, trying alternative...');
      }

      // Try to create feedback directly if endpoint doesn't exist
      if (predictionId) {
        try {
          // Get the prediction first
          const predictionResponse = await axios.get(`http://localhost:8000/api/predictions/history/${predictionId}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (predictionResponse.data) {
            // Save feedback to localStorage as fallback
            const savedFeedback = JSON.parse(localStorage.getItem('predictionFeedback') || '[]');
            savedFeedback.push({
              prediction_id: predictionId,
              rating: feedbackRating,
              comment: feedbackComment,
              user_email: user?.email,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('predictionFeedback', JSON.stringify(savedFeedback));

            alert('Thank you for your feedback! (Saved locally)');
            setShowFeedback(false);
            setFeedbackRating(0);
            setFeedbackComment('');
            setHoverRating(0);
            return;
          }
        } catch (fetchErr) {
          console.log('Could not fetch prediction:', fetchErr.message);
        }
      }

      // If all else fails, just close with message
      alert('Thank you for your feedback!');
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setHoverRating(0);

    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Feedback submission failed, but your prediction is complete. Thank you for using our service!');
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setHoverRating(0);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSkipFeedback = () => {
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackComment('');
    setHoverRating(0);
  };

  const handleSavePrediction = async () => {
    if (!prediction || !predictionId) return;

    setSavingPrediction(true);
    try {
      // First try to mark as saved via API
      try {
        await axios.patch(`http://localhost:8000/api/predictions/history/${predictionId}/`, {
          is_saved: true
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        console.log('API save failed, using localStorage:', apiError.message);
      }

      // Always save to localStorage for redundancy
      const savedPredictions = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
      const existingIndex = savedPredictions.findIndex(item => item.id === predictionId);

      if (existingIndex === -1) {
        savedPredictions.push({
          id: predictionId,
          prediction: prediction,
          saved_at: new Date().toISOString(),
          user_email: user?.email
        });
        localStorage.setItem('savedPredictions', JSON.stringify(savedPredictions));
      }

      setSavedSuccessfully(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setSavedSuccessfully(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving prediction:', err);
      alert('Failed to save prediction to history');
    } finally {
      setSavingPrediction(false);
    }
  };

  const handleExportPrediction = () => {
    if (!prediction) return;

    const exportData = {
      user: user ? {
        name: user.name,
        email: user.email
      } : null,
      prediction: {
        top_prediction: prediction.top_prediction,
        confidence_score: prediction.top_prediction?.confidence || prediction.predictions?.[0]?.confidence_score || 85,
        all_predictions: prediction.predictions || [],
        analysis: prediction.analysis || {},
        timestamp: new Date().toISOString()
      },
      profile_summary: {
        education: `${formData.highest_degree} in ${formData.degree_field}`,
        experience: `${formData.total_experience_years} years`,
        skills_count: selectedSkills.length,
        profile_score: profileScore.overallScore
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `job-prediction-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSharePrediction = () => {
    if (!prediction) return;

    const predictionText = `I got my AI job prediction! Top match: ${prediction.top_prediction?.job_role} with ${prediction.top_prediction?.confidence || 85}% confidence. Try it out!`;

    if (navigator.share) {
      navigator.share({
        title: 'My Job Prediction Results',
        text: predictionText,
        url: window.location.href,
      })
        .catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(predictionText)
        .then(() => alert('Prediction copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  const calculateProfileScore = () => {
    const educationScore = formData.gpa_score * 10;
    const experienceScore = Math.min(formData.total_experience_years * 2, 20);
    const certScore = formData.additional_certs_count * 5;

    const technicalSkills = selectedSkills.filter(s =>
      s.category !== 'Soft Skills' &&
      !s.skill.includes('score') &&
      !s.skill.includes('index')
    );

    const totalProficiency = technicalSkills.reduce((sum, skill) => sum + skill.proficiency, 0);
    const techScore = technicalSkills.length > 0 ? totalProficiency / technicalSkills.length : 0;

    const overallScore = (
      educationScore * 0.25 +
      experienceScore * 0.25 +
      techScore * 0.40 +
      certScore * 0.10
    );

    return {
      educationScore: Math.round(educationScore),
      experienceScore: Math.round(experienceScore),
      techScore: Math.round(techScore),
      certScore: Math.round(certScore),
      overallScore: Math.round(overallScore)
    };
  };

  const applyQuickSkills = (role) => {
    const skillsToAdd = quickSkillSuggestions[role] || [];
    skillsToAdd.forEach(skillValue => {
      if (!selectedSkills.some(s => s.skill === skillValue)) {
        handleAddSkill(skillValue);
      }
    });
  };

  const profileScore = calculateProfileScore();

  const steps = [
    { number: 1, title: 'Profile Details', icon: <FaUser /> },
    { number: 2, title: 'Technical Skills', icon: <FaCogs /> },
    { number: 3, title: 'Get Predictions', icon: <FaBrain /> }
  ];

  // Feedback Popup Component
  const FeedbackPopup = () => (
    <AnimatePresence>
      {showFeedback && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleSkipFeedback}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleSkipFeedback}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <FaTimes className="text-xl" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar className="text-2xl text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Rate Your Prediction
                </h3>
                <p className="text-gray-600 mb-6">
                  How satisfied are you with your job prediction results?
                </p>

                {/* Star Rating */}
                <div className="flex justify-center mb-6 space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                    >
                      {star <= (hoverRating || feedbackRating) ? (
                        <FaStar className="text-yellow-500 fill-current" />
                      ) : (
                        <FaStar className="text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Rating Description */}
                {feedbackRating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
                      <span className="text-lg font-semibold text-primary mr-2">
                        {starDescriptions[feedbackRating - 1]}
                      </span>
                      <span className="text-2xl">
                        {starEmojis[feedbackRating - 1]}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Comment Section */}
                <div className="mb-6">
                  <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                    <FaComment className="inline mr-2 text-gray-400" />
                    Optional Comments
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share your thoughts about the prediction..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm"
                    rows="3"
                    maxLength="500"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {feedbackComment.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSkipFeedback}
                    disabled={submittingFeedback}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={feedbackRating === 0 || submittingFeedback}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {submittingFeedback ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin inline-block mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>

                {/* Privacy Notice */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>Your feedback helps us improve the AI model.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Save Confirmation Modal
  const SaveConfirmationModal = () => (
    <AnimatePresence>
      {showSaveModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => !savingPrediction && setShowSaveModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {savedSuccessfully ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Saved Successfully!</h3>
                  <p className="text-gray-600">Your prediction has been saved to your history.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Save Prediction</h3>
                  <p className="text-gray-600 mb-6">
                    Save this prediction to your history for future reference?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowSaveModal(false)}
                      disabled={savingPrediction}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePrediction}
                      disabled={savingPrediction}
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {savingPrediction ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Prediction'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Feedback Popup */}
      <FeedbackPopup />

      {/* Save Confirmation Modal */}
      <SaveConfirmationModal />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Job Role Prediction</h1>
                <p className="text-white/80 text-sm md:text-base">
                  Get personalized job recommendations based on your profile and technical skills
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3">
                  <FaRobot className="text-xl md:text-2xl" />
                </div>
                <div>
                  <div className="text-xs md:text-sm">AI Accuracy</div>
                  <div className="text-lg md:text-xl font-bold">
                    95%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex flex-col items-center flex-1 relative">
                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full mb-2 transition-all duration-300 ${step >= s.number
                  ? 'bg-primary text-white transform scale-110'
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {s.icon}
                </div>
                <span className={`text-xs md:text-sm font-medium ${step >= s.number ? 'text-primary' : 'text-gray-500'
                  }`}>
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`absolute h-1 w-1/4 transform translate-x-12 md:translate-x-12 -translate-y-5 md:-translate-y-6 ${step > s.number ? 'bg-primary' : 'bg-gray-200'
                    }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-dark"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-xl mb-6"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-3 flex-shrink-0" />
              <span className="text-sm md:text-base">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl md:shadow-2xl p-6 md:p-8"
          >
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Personal & Education Details</h2>
              <p className="text-gray-600 text-sm md:text-base">Tell us about your background and education</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Personal Info */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4 flex items-center">
                    <FaUser className="mr-2 text-primary text-sm md:text-base" />
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="18"
                      max="70"
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Country *
                    </label>
                    <select
                      name="location_country"
                      value={formData.location_country}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    >
                      <option value="USA">United States</option>
                      <option value="India">India</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      City Tier (1-3) *
                    </label>
                    <select
                      name="location_city_tier"
                      value={formData.location_city_tier}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    >
                      <option value="1">Tier 1 (Major Metro)</option>
                      <option value="2">Tier 2 (Large City)</option>
                      <option value="3">Tier 3 (Smaller City)</option>
                    </select>
                  </div>
                </div>

                {/* Education & Experience */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4 flex items-center">
                    <FaGraduationCap className="mr-2 text-primary text-sm md:text-base" />
                    Education & Experience
                  </h3>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Highest Degree *
                    </label>
                    <select
                      name="highest_degree"
                      value={formData.highest_degree}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    >
                      <option value="high_school">High School</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      name="degree_field"
                      value={formData.degree_field}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Institution Tier (1-5) *
                    </label>
                    <select
                      name="institution_tier"
                      value={formData.institution_tier}
                      onChange={handleInputChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                    >
                      <option value="1">Tier 1 (Top Universities)</option>
                      <option value="2">Tier 2 (Good Universities)</option>
                      <option value="3">Tier 3 (Average Universities)</option>
                      <option value="4">Tier 4 (Below Average)</option>
                      <option value="5">Tier 5 (Others)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        GPA (0-10) *
                      </label>
                      <input
                        type="number"
                        name="gpa_score"
                        value={formData.gpa_score}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        name="total_experience_years"
                        value={formData.total_experience_years}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between pt-4 md:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 md:px-8 py-2 md:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  Continue to Technical Skills
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Technical Skills Assessment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl md:shadow-2xl p-6 md:p-8"
          >
            <div className="mb-6 md:mb-8">
              <div className="flex items-center mb-2">
                <FaCogs className="text-xl md:text-2xl text-primary mr-2 md:mr-3" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Technical Skills Assessment</h2>
              </div>
              <p className="text-gray-600 text-sm md:text-base">Add your technical skills and rate your proficiency (0-10 scale)</p>

              {/* Quick Skill Suggestions */}
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                  <FaLightbulb className="mr-2 text-sm md:text-base" />
                  Quick Skill Suggestions by Role
                </h4>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {Object.keys(quickSkillSuggestions).map(role => (
                    <button
                      key={role}
                      onClick={() => applyQuickSkills(role)}
                      className="px-2 md:px-3 py-1 md:py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-xs md:text-sm"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Skill Section */}
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 md:mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-700 flex items-center">
                  <FaCogs className="mr-2 text-primary text-sm md:text-base" />
                  Add Technical Skills
                </h3>
                <span className="text-xs md:text-sm bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full">
                  {selectedSkills.length} skills added
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-grow relative">
                  <select
                    onChange={(e) => handleAddSkill(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white appearance-none text-sm md:text-base"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a skill to add...</option>
                    {categories.map(category => (
                      <optgroup key={category} label={`${category} (${skillsByCategory[category]?.length || 0} skills)`}>
                        {skillsByCategory[category]?.map(skill => (
                          <option
                            key={skill.value}
                            value={skill.value}
                            disabled={selectedSkills.some(s => s.skill === skill.value)}
                          >
                            {skill.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const select = document.querySelector('select');
                    if (select && select.value) handleAddSkill(select.value);
                  }}
                  className="px-4 md:px-6 py-2 md:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors whitespace-nowrap flex items-center justify-center text-sm md:text-base"
                >
                  <FaCogs className="mr-2 text-sm md:text-base" />
                  Add Skill
                </button>
              </div>

              <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center p-2 bg-white rounded-lg border">
                  <div className="text-base md:text-lg font-bold text-primary">{allTechnicalSkills.length}</div>
                  <div className="text-xs text-gray-600">Total Skills</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border">
                  <div className="text-base md:text-lg font-bold text-blue-500">{categories.length}</div>
                  <div className="text-xs text-gray-600">Categories</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border">
                  <div className="text-base md:text-lg font-bold text-green-500">{selectedSkills.length}</div>
                  <div className="text-xs text-gray-600">Selected</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border">
                  <div className="text-base md:text-lg font-bold text-purple-500">{profileScore.techScore}/10</div>
                  <div className="text-xs text-gray-600">Avg Proficiency</div>
                </div>
              </div>
            </div>

            {/* Selected Skills List */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">Your Technical Skills</h3>

              {selectedSkills.length === 0 ? (
                <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <FaCogs className="text-3xl md:text-4xl text-gray-300 mx-auto mb-2 md:mb-3" />
                  <p className="text-gray-500 mb-1 md:mb-2 text-sm md:text-base">No skills added yet</p>
                  <p className="text-xs md:text-sm text-gray-400">Add some technical skills above to get accurate job predictions</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {/* Group by category */}
                  {categories.map(category => {
                    const categorySkills = selectedSkills.filter(s => s.category === category);
                    if (categorySkills.length === 0) return null;

                    return (
                      <div key={category} className="mb-3 md:mb-4">
                        <div className="flex items-center mb-1 md:mb-2">
                          <h4 className="font-semibold text-gray-700 text-sm md:text-base">{category}</h4>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-1 md:px-2 py-0.5 md:py-1 rounded">
                            {categorySkills.length} skills
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                          {categorySkills.map((item, index) => (
                            <motion.div
                              key={item.skill}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-2 md:p-3 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2 md:mr-3">
                                  {item.icon || <FaCogs className="text-primary text-xs md:text-sm" />}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 text-xs md:text-sm">{item.label}</div>
                                  <div className="text-xs text-gray-500">Proficiency: {item.proficiency}/10</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 md:space-x-2">
                                <select
                                  value={item.proficiency}
                                  onChange={(e) => handleProficiencyChange(item.skill, e.target.value)}
                                  className="px-1 md:px-2 py-0.5 md:py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-xs md:text-sm"
                                >
                                  {proficiencyLevels.map(level => (
                                    <option key={level.value} value={level.value}>
                                      {level.value} - {level.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(item.skill)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-0.5 md:p-1 text-sm md:text-base"
                                  title="Remove skill"
                                >
                                  ×
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Score Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 md:mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4 md:p-6"
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                <FaStar className="mr-2 text-yellow-500 text-base md:text-lg" />
                Profile Strength Analysis
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white rounded-xl p-2 md:p-4 text-center border">
                  <div className="text-lg md:text-2xl font-bold text-primary">{profileScore.educationScore}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Education</div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
                <div className="bg-white rounded-xl p-2 md:p-4 text-center border">
                  <div className="text-lg md:text-2xl font-bold text-blue-500">{profileScore.experienceScore}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Experience</div>
                  <div className="text-xs text-gray-400">/20</div>
                </div>
                <div className="bg-white rounded-xl p-2 md:p-4 text-center border">
                  <div className="text-lg md:text-2xl font-bold text-green-500">{profileScore.techScore}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Tech Skills</div>
                  <div className="text-xs text-gray-400">/10</div>
                </div>
                <div className="bg-white rounded-xl p-2 md:p-4 text-center border">
                  <div className="text-lg md:text-2xl font-bold text-purple-500">{profileScore.certScore}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Certifications</div>
                  <div className="text-xs text-gray-400">/20</div>
                </div>
                <div className="bg-white rounded-xl p-2 md:p-4 text-center border-2 border-primary bg-primary/5">
                  <div className="text-xl md:text-3xl font-bold text-primary">{profileScore.overallScore}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">Overall Score</div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
              </div>

              <div className="mt-2 md:mt-4">
                <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                  <span>Technical Skills: {selectedSkills.filter(s => s.category !== 'Soft Skills').length}</span>
                  <span>Soft Skills: {selectedSkills.filter(s => s.category === 'Soft Skills').length}</span>
                </div>
                <div className="h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 transition-all duration-1000"
                    style={{ width: `${profileScore.overallScore}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 md:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                ← Back to Personal Info
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || selectedSkills.length === 0}
                className="px-6 md:px-8 py-2 md:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2 md:mr-3"></div>
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    Get AI Predictions
                    <FaBrain className="ml-2 text-sm md:text-base" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Prediction Results */}
        {step === 3 && prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Top Prediction Card */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 md:p-6 lg:p-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 md:mr-4">
                      <FaCheckCircle className="text-lg md:text-xl lg:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">Your Top Match</h2>
                      <p className="text-white/80 text-sm md:text-base">Based on AI analysis of your technical profile</p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{formatJobRole(prediction.top_prediction?.job_role || prediction.predictions?.[0]?.job_role)}</h3>
                    <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-300 mr-1 md:mr-2 text-sm md:text-base" />
                        <span className="text-base md:text-xl font-bold">
                          {prediction.top_prediction?.confidence || prediction.predictions?.[0]?.confidence_score || 85}% Match
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-300 mr-1 md:mr-2 text-sm md:text-base" />
                        <span className="text-sm md:text-lg">
                          ${prediction.top_prediction?.salary_range?.min?.toLocaleString() || '60,000'} -
                          ${prediction.top_prediction?.salary_range?.max?.toLocaleString() || '120,000'}/year
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaChartLine className="text-blue-300 mr-1 md:mr-2 text-sm md:text-base" />
                        <span className="text-sm md:text-lg">
                          Market Demand: {prediction.top_prediction?.market_demand || 'High'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 lg:mt-0 lg:ml-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">
                        {prediction.top_prediction?.confidence || prediction.predictions?.[0]?.confidence_score || 85}%
                      </div>
                      <div className="text-white/80 text-sm md:text-base">Confidence Score</div>
                    </div>
                    <div className="mt-2 md:mt-4 text-xs md:text-sm">
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <span>Skills Analyzed:</span>
                        <span className="font-semibold">{selectedSkills.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Profile Score:</span>
                        <span className="font-semibold">{profileScore.overallScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 md:px-6 py-2 md:py-3 bg-white border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors flex items-center text-sm md:text-base"
              >
                <FaCheckCircle className="mr-2" />
                Save Prediction
              </button>
              <button
                onClick={handleExportPrediction}
                className="px-4 md:px-6 py-2 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center text-sm md:text-base"
              >
                <FaDownload className="mr-2" />
                Export Results
              </button>
              <button
                onClick={handleSharePrediction}
                className="px-4 md:px-6 py-2 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center text-sm md:text-base"
              >
                <FaShareAlt className="mr-2" />
                Share
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setPrediction(null);
                  setSelectedSkills([]);
                  setPredictionId(null);
                }}
                className="px-4 md:px-6 py-2 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center text-sm md:text-base"
              >
                <FaSyncAlt className="mr-2" />
                New Prediction
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* All Predictions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                    <FaChartLine className="mr-2 text-primary text-base md:text-lg" />
                    Top Job Recommendations
                  </h3>

                  {prediction.predictions && prediction.predictions.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {prediction.predictions.slice(0, 5).map((job, index) => (
                        <motion.div
                          key={job.rank || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg ${index === 0
                            ? 'border-primary border-2 bg-primary/5'
                            : 'border-gray-200 hover:border-primary/30'
                            }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4">
                            <div className="flex items-center mb-2 md:mb-0">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 ${index === 0
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                <span className="font-bold text-sm md:text-base">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="text-base md:text-lg font-bold text-gray-800">{formatJobRole(job.job_role)}</h4>
                                <div className="flex items-center text-xs md:text-sm text-gray-600">
                                  <FaMoneyBillWave className="mr-1 text-xs md:text-sm" />
                                  <span>
                                    ${job.salary_range?.min?.toLocaleString() || '50000'} - ${job.salary_range?.max?.toLocaleString() || '100000'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-xl md:text-2xl font-bold ${job.confidence_score >= 80 ? 'text-green-600' :
                                job.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {job.confidence_score || 75}%
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">Confidence</div>
                            </div>
                          </div>

                          <div className="mt-2 md:mt-4">
                            <div className="flex flex-col md:flex-row md:justify-between text-xs md:text-sm text-gray-600 mb-2">
                              <span>Market Demand: <strong>{job.market_demand || 'Medium'}</strong></span>
                              <span>Growth: <strong>{job.growth_outlook || 'High'}</strong></span>
                            </div>

                            {job.required_skills && job.required_skills.length > 0 && (
                              <div className="mt-2 md:mt-3">
                                <div className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Key Skills Matched:</div>
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  {job.required_skills.slice(0, 5).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <FaBrain className="text-3xl md:text-4xl text-gray-300 mx-auto mb-2 md:mb-3" />
                      <p className="text-gray-500 text-sm md:text-base">No predictions available. Try adjusting your skills.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis & Recommendations */}
              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                {/* Your Skills Summary */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                    <FaCogs className="mr-2 text-blue-500 text-base md:text-lg" />
                    Your Technical Skills
                  </h3>

                  <div className="space-y-1 md:space-y-2">
                    {selectedSkills
                      .filter(s => s.category !== 'Soft Skills')
                      .sort((a, b) => b.proficiency - a.proficiency)
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={item.skill} className="flex items-center justify-between p-1 md:p-2">
                          <span className="text-gray-700 text-xs md:text-sm truncate mr-2">{item.label}</span>
                          <div className="flex items-center">
                            <div className="w-12 md:w-16 h-1 md:h-2 bg-gray-200 rounded-full overflow-hidden mr-1 md:mr-2">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                                style={{ width: `${item.proficiency * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-primary whitespace-nowrap">{item.proficiency}/10</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Skill Gap Analysis */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                    <FaLightbulb className="mr-2 text-yellow-500 text-base md:text-lg" />
                    Skill Recommendations
                  </h3>

                  <div className="space-y-2 md:space-y-3">
                    <p className="text-gray-600 text-xs md:text-sm">Based on your profile, consider adding:</p>
                    <ul className="space-y-1 md:space-y-2">
                      {(() => {
                        const recommendations = [];

                        // Check for technical roles
                        const hasWebDev = selectedSkills.some(s =>
                          ['skill_react', 'skill_angular', 'skill_vue', 'skill_nodejs', 'skill_javascript'].includes(s.skill)
                        );
                        const hasBackend = selectedSkills.some(s =>
                          ['skill_python', 'skill_java', 'skill_csharp', 'skill_nodejs'].includes(s.skill)
                        );
                        const hasCloud = selectedSkills.some(s =>
                          ['skill_aws', 'skill_azure', 'skill_google_cloud', 'skill_docker'].includes(s.skill)
                        );
                        const hasData = selectedSkills.some(s =>
                          ['skill_python', 'skill_sql', 'skill_machine_learning', 'skill_data_analysis'].includes(s.skill)
                        );

                        if (hasWebDev && !hasBackend) {
                          recommendations.push('Backend skills (Node.js, Python, Java)');
                        }
                        if ((hasWebDev || hasBackend) && !hasCloud) {
                          recommendations.push('Cloud platforms (AWS, Azure, Docker)');
                        }
                        if (hasData && !hasCloud) {
                          recommendations.push('Big Data tools (Spark, Hadoop)');
                        }
                        if (recommendations.length === 0) {
                          recommendations.push('Specialized frameworks for your chosen domain');
                          recommendations.push('DevOps and CI/CD practices');
                          recommendations.push('Advanced data structures and algorithms');
                        }

                        return recommendations.slice(0, 3).map((rec, index) => (
                          <motion.li
                            key={index}
                            className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <FaClock className="text-blue-500 mr-2 text-xs md:text-sm" />
                            <span className="text-gray-700 text-xs md:text-sm">{rec}</span>
                          </motion.li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Next Steps</h3>

                  <div className="space-y-2 md:space-y-3">
                    <button
                      onClick={() => {
                        setStep(1);
                        setPrediction(null);
                        setSelectedSkills([]);
                        setPredictionId(null);
                      }}
                      className="w-full flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center">
                        <FaBrain className="text-gray-400 group-hover:text-primary mr-2 md:mr-3 text-sm md:text-base" />
                        <span className="font-medium text-gray-700 group-hover:text-primary text-xs md:text-sm">
                          Make Another Prediction
                        </span>
                      </div>
                      <FaArrowRight className="text-gray-400 group-hover:text-primary text-sm md:text-base" />
                    </button>

                    <button
                      onClick={() => navigate('/prediction-history')}
                      className="w-full flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center">
                        <FaHistory className="text-gray-400 group-hover:text-primary mr-2 md:mr-3 text-sm md:text-base" />
                        <span className="font-medium text-gray-700 group-hover:text-primary text-xs md:text-sm">
                          View Prediction History
                        </span>
                      </div>
                      <FaArrowRight className="text-gray-400 group-hover:text-primary text-sm md:text-base" />
                    </button>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center justify-between p-3 md:p-4 border border-primary border-2 rounded-lg hover:bg-primary/10 transition-all group"
                    >
                      <div className="flex items-center">
                        <FaChartLine className="text-primary group-hover:text-primary-dark mr-2 md:mr-3 text-sm md:text-base" />
                        <span className="font-medium text-primary group-hover:text-primary-dark text-xs md:text-sm">
                          View Dashboard
                        </span>
                      </div>
                      <FaArrowRight className="text-primary group-hover:text-primary-dark text-sm md:text-base" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobPrediction;