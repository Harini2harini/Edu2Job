#!/bin/bash

# Navigate to backend directory if not already there
cd "$(dirname "$0")"

echo "🚀 Starting backend Gunicorn server..."

# Start Gunicorn
echo "🌐 Starting Gunicorn server on port $PORT..."
gunicorn edu2job_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
