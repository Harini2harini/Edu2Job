import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRocket, FaBrain, FaChartLine, FaUsers, FaShieldAlt, FaGraduationCap, FaBriefcase, FaAward, FaArrowRight, FaCheckCircle, FaStar, FaRegClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <FaBrain className="text-3xl text-white" />,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze your profile to suggest the most suitable job roles.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaChartLine className="text-3xl text-white" />,
      title: "Personalized Career Path",
      description: "Get customized career roadmaps based on your education, skills, and aspirations.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FaUsers className="text-3xl text-white" />,
      title: "Professional Community",
      description: "Connect with industry experts, mentors, and peers in your field.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaShieldAlt className="text-3xl text-white" />,
      title: "Secure & Private",
      description: "Enterprise-grade security to protect your personal and professional data.",
      color: "from-red-500 to-red-600"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description: "Sign up and enter your educational details, skills, and experience"
    },
    {
      number: "02",
      title: "Upload Documents",
      description: "Upload your resume, certificates, and other relevant documents"
    },
    {
      number: "03",
      title: "Get Predictions",
      description: "Our AI analyzes your profile and suggests suitable job roles"
    },
    {
      number: "04",
      title: "Start Your Journey",
      description: "Follow personalized recommendations and track your progress"
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative gradient-bg text-white min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-flex items-center px-4 py-2 glass-effect rounded-full mb-6">
                <FaRocket className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered Career Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                From <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Education</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">Career</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Bridge the gap between your academic qualifications and dream job with our 
                intelligent AI prediction system. Get personalized career guidance, skill analysis, 
                and job role recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <span>Start Now</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <Link
                  to="/about"
                  className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl text-lg font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>95% Prediction Accuracy</span>
                </div>
                <div className="flex items-center">
                  <FaRegClock className="w-5 h-5 text-blue-400 mr-2" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center">
                  <FaStar className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>Trusted by 10K+ Users</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                    <FaGraduationCap className="text-4xl text-blue-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Education Analysis</h3>
                    <p className="text-sm text-gray-300">Analyze your academic profile</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
                    <FaBriefcase className="text-4xl text-purple-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Job Matching</h3>
                    <p className="text-sm text-gray-300">Find your perfect job role</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
                    <FaChartLine className="text-4xl text-green-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Skill Gap Analysis</h3>
                    <p className="text-sm text-gray-300">Identify missing skills</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
                    <FaAward className="text-4xl text-red-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Certifications</h3>
                    <p className="text-sm text-gray-300">Get certified recommendations</p>
                  </div>
                </div>
                
                <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Get Your Career Score</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      Get Score
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-primary">Edu2Job</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with career expertise to guide you 
              towards your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card overflow-hidden group"
              >
                <div className={`p-6 bg-gradient-to-r ${feature.color} text-white`}>
                  <div className="flex items-center justify-between">
                    {feature.icon}
                    <span className="text-5xl font-bold opacity-20">{index + 1}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to="/job-prediction"
                      className="text-primary font-semibold hover:text-primary-dark transition-colors flex items-center"
                    >
                      Learn More
                      <FaArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to transform your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-primary/30 transition-all duration-300 group hover:shadow-xl">
                  <div className="text-5xl font-bold text-primary/10 mb-4 group-hover:text-primary/20 transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                  <div className="mt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <FaArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-1 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Join thousands of successful professionals who found their dream jobs with Edu2Job
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="bg-white text-primary px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Now
                </button>
                <Link
                  to="/about"
                  className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;