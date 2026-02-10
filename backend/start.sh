#!/bin/bash

# Navigate to backend directory if not already there
cd "$(dirname "$0")"

echo "🚀 Starting backend initialization..."

# Run migrations
echo "📂 Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "🌐 Starting Gunicorn server on port $PORT..."
gunicorn edu2job_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
