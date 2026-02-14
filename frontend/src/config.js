const config = {
    API_URL: process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000/api'
        : 'https://edu2job-production-up.railway.app/api'),
    REDIRECT_URI: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/oauth/callback'
        : 'https://edu2-job-kohl.vercel.app/oauth/callback'
};

export default config;
