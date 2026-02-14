import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaServer, FaGlobe, FaLock } from 'react-icons/fa';

const SystemCheck = () => {
    const [results, setResults] = useState({
        config: { status: 'pending', details: 'Checking config.js...' },
        dns: { status: 'pending', details: 'Checking DNS resolution...' },
        api: { status: 'pending', details: 'Checking API response...' },
        ssl: { status: 'pending', details: 'Checking SSL/HTTPS...' }
    });
    const [loading, setLoading] = useState(true);

    const runTests = async () => {
        setLoading(true);
        const newResults = { ...results };

        // 1. Config Test
        const API_URL = config.API_URL;
        newResults.config = {
            status: API_URL ? 'success' : 'error',
            details: API_URL ? `API_URL configured: ${API_URL}` : 'API_URL missing in config.js'
        };

        // 2. Network/DNS Test
        try {
            await axios.get(API_URL, { timeout: 5000 });
            newResults.dns = { status: 'success', details: 'Backend host is reachable' };
            newResults.api = { status: 'success', details: 'API root responded successfully' };
            newResults.ssl = { status: 'success', details: 'HTTPS connection established' };
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                newResults.dns = {
                    status: 'error',
                    details: 'DNS/Network Error: Could not resolve or reach host. The Railway domain might be inactive or incorrect.'
                };
                newResults.api = { status: 'error', details: 'No response from API' };
                newResults.ssl = { status: 'error', details: 'Connection failed' };
            } else if (error.response) {
                newResults.dns = { status: 'success', details: 'Host is reachable' };
                newResults.api = {
                    status: 'warning',
                    details: `Server responded with status ${error.response.status}. This is actually GOOD news (connectivity exists).`
                };
                newResults.ssl = { status: 'success', details: 'HTTPS connection established' };
            } else {
                newResults.dns = { status: 'error', details: error.message };
            }
        }

        setResults(newResults);
        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FaCheckCircle className="text-green-500" />;
            case 'error': return <FaTimesCircle className="text-red-500" />;
            case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
            default: return <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">System Diagnostic</h1>
                    <button
                        onClick={runTests}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Retest'}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <FaGlobe className="text-primary mt-1 mr-4 text-xl" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Configuration</h3>
                                {getStatusIcon(results.config.status)}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{results.config.details}</p>
                        </div>
                    </div>

                    <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <FaServer className="text-blue-500 mt-1 mr-4 text-xl" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">DNS & Connectivity</h3>
                                {getStatusIcon(results.dns.status)}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{results.dns.details}</p>
                        </div>
                    </div>

                    <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <FaLock className="text-purple-500 mt-1 mr-4 text-xl" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">SSL / Security</h3>
                                {getStatusIcon(results.ssl.status)}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{results.ssl.details}</p>
                        </div>
                    </div>
                </div>

                {results.dns.status === 'error' && (
                    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                        <h3 className="text-red-800 font-bold mb-2 flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            CRITICAL: Backend Unreachable
                        </h3>
                        <p className="text-red-700 text-sm">
                            The frontend cannot reach your backend. This is usually caused by:
                        </p>
                        <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                            <li>The Railway service is down or sleeping.</li>
                            <li>The domain <code>edu2job-production.up.railway.app</code> has changed.</li>
                            <li>The Public Domain has not been generated in Railway settings.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                            <p className="text-xs font-mono text-gray-600">
                                Current API URL: {config.API_URL}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <a href="/" className="text-primary hover:underline text-sm font-medium">
                        Return to Home
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default SystemCheck;
