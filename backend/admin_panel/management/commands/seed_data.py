from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from admin_panel.models import (
    MLModel, TrainingDataset, PredictionLog, 
    SystemLog, UserActivity, Notification
)
import uuid
from datetime import datetime, timedelta
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial data for admin panel'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding admin panel data...')
        
        # Create admin user if not exists
        admin_user, created = User.objects.get_or_create(
            email='admin@edu2job.com',
            defaults={
                'name': 'System Admin',
                'role': 'admin',
                'is_active': True,
                'is_verified': True,
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')
        
        # Create sample ML model
        ml_model, created = MLModel.objects.get_or_create(
            name='Job Prediction Model',
            defaults={
                'model_type': 'random_forest',
                'version': '1.0.0',
                'description': 'Random Forest model for job role prediction',
                'accuracy': 0.85,
                'precision': 0.83,
                'recall': 0.85,
                'f1_score': 0.84,
                'training_time': 120.5,
                'test_size': 0.2,
                'random_state': 42,
                'features_used': ['education', 'experience', 'skills', 'location'],
                'target_column': 'job_role',
                'trained_by': admin_user,
                'status': 'trained',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('Created ML model')
        
        # Create sample predictions
        if PredictionLog.objects.count() < 10:
            for i in range(10):
                user, _ = User.objects.get_or_create(
                    email=f'user{i}@test.com',
                    defaults={
                        'name': f'Test User {i}',
                        'role': 'user',
                        'is_active': True
                    }
                )
                
                PredictionLog.objects.create(
                    user=user,
                    input_data={
                        'education': 'Bachelor\'s',
                        'experience': f'{i+2} years',
                        'skills': ['Python', 'Django', 'React'],
                        'location': 'New York'
                    },
                    prediction_result={
                        'job_role': 'Software Engineer',
                        'confidence': 0.75 + (i * 0.02),
                        'salary_range': '$80,000 - $120,000'
                    },
                    confidence_score=0.75 + (i * 0.02),
                    model_used=ml_model,
                    model_version='1.0.0',
                    status='success' if i < 8 else 'flagged',
                    is_flagged=True if i >= 8 else False,
                    flag_reason='Low confidence score' if i >= 8 else ''
                )
            
            self.stdout.write('Created sample predictions')
        
        # Create sample system logs
        if SystemLog.objects.count() < 5:
            log_types = [
                ('info', 'system', 'API Server started successfully'),
                ('warning', 'database', 'Database connection pool is 80% full'),
                ('error', 'prediction', 'Prediction service timeout'),
                ('info', 'model_training', 'Model training completed successfully'),
                ('critical', 'auth', 'Failed login attempts detected')
            ]
            
            for level, category, message in log_types:
                SystemLog.objects.create(
                    level=level,
                    category=category,
                    source='system',
                    message=message,
                    details={'timestamp': datetime.now().isoformat()}
                )
            
            self.stdout.write('Created sample system logs')
        
        # Create sample notifications
        if Notification.objects.count() < 5:
            notifications = [
                ('System Update Available', 'New system update v2.0 is available for installation', 'system', 2),
                ('Model Training Complete', 'Job prediction model training completed with 85% accuracy', 'model', 2),
                ('Security Alert', 'Multiple failed login attempts detected from unknown IP', 'security', 4),
                ('New User Registered', 'New user "John Doe" has registered', 'user', 1),
                ('Prediction Flagged', 'Low confidence prediction detected and flagged for review', 'prediction', 3)
            ]
            
            for title, message, ntype, priority in notifications:
                Notification.objects.create(
                    title=title,
                    message=message,
                    notification_type=ntype,
                    priority=priority,
                    is_read=False
                )
            
            self.stdout.write('Created sample notifications')
        
        self.stdout.write(self.style.SUCCESS('Admin panel data seeded successfully!'))