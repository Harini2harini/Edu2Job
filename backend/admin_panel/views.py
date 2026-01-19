from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
import joblib
import numpy as np
import json
import os
from django.conf import settings
import logging
from django.db import transaction
import random
import uuid
from django.utils.dateparse import parse_date

from .models import (
    MLModel, TrainingDataset, PredictionLog, 
    SystemLog, UserActivity, Notification, AdminDashboardStats
)
from .serializers import (
    MLModelSerializer, TrainingDatasetSerializer, PredictionLogSerializer,
    SystemLogSerializer, UserActivitySerializer, NotificationSerializer,
    UserSerializer, TrainingDatasetUploadSerializer, TrainModelSerializer,
    FlagPredictionSerializer
)
from users.models import User

logger = logging.getLogger(__name__)

# ML Training imports
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import warnings
warnings.filterwarnings('ignore')

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return MLModel.objects.all().order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        model = self.get_object()
        
        # Deactivate all models
        MLModel.objects.filter(is_active=True).update(is_active=False)
        
        # Activate this model
        model.is_active = True
        model.save()
        
        # Log the action
        SystemLog.objects.create(
            level='info',
            category='model',
            source='admin_panel',
            message=f'Model "{model.name}" activated',
            user=request.user,
            details={'model_id': str(model.id), 'model_name': model.name}
        )
        
        return Response({'message': 'Model activated successfully'})

class TrainingDatasetViewSet(viewsets.ModelViewSet):
    queryset = TrainingDataset.objects.all()
    serializer_class = TrainingDatasetSerializer
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return TrainingDataset.objects.all().order_by('-uploaded_at')
    
    def create(self, request, *args, **kwargs):
        serializer = TrainingDatasetUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            dataset_file = request.FILES['dataset_file']
            
            # Validate file type
            allowed_types = ['.csv', '.json', '.xlsx', '.xls']
            file_extension = os.path.splitext(dataset_file.name)[1].lower()
            if file_extension not in allowed_types:
                return Response({'error': 'Unsupported file type'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create dataset
            dataset = TrainingDataset.objects.create(
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', ''),
                dataset_file=dataset_file,
                dataset_type=file_extension[1:],  # Remove dot
                uploaded_by=request.user,
                target_column=serializer.validated_data.get('target_column', '')
            )
            
            # Process dataset to get stats
            self._process_dataset(dataset)
            
            # Log the upload
            SystemLog.objects.create(
                level='info',
                category='model_training',
                source='admin_panel',
                message=f'Dataset "{dataset.name}" uploaded',
                user=request.user,
                details={
                    'dataset_id': str(dataset.id),
                    'file_size': f"{dataset.file_size_mb:.2f} MB",
                    'rows': dataset.row_count,
                    'columns': dataset.column_count
                }
            )
            
            return Response(TrainingDatasetSerializer(dataset).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading dataset: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _process_dataset(self, dataset):
        """Process dataset to extract statistics"""
        try:
            file_path = dataset.dataset_file.path
            
            if dataset.dataset_type == 'csv':
                df = pd.read_csv(file_path)
            elif dataset.dataset_type == 'json':
                df = pd.read_json(file_path)
            elif dataset.dataset_type in ['xlsx', 'xls']:
                df = pd.read_excel(file_path)
            else:
                return
            
            # Update dataset statistics
            dataset.row_count = len(df)
            dataset.column_count = len(df.columns)
            dataset.column_names = list(df.columns)
            
            # Basic validation
            validation_report = {
                'missing_values': df.isnull().sum().to_dict(),
                'data_types': df.dtypes.astype(str).to_dict(),
                'basic_stats': df.describe().to_dict() if len(df.select_dtypes(include=[np.number]).columns) > 0 else {}
            }
            
            dataset.validation_report = validation_report
            dataset.is_validated = True
            dataset.save()
            
        except Exception as e:
            logger.error(f"Error processing dataset: {str(e)}")
            dataset.validation_report = {'error': str(e)}
            dataset.save()

class PredictionLogViewSet(viewsets.ModelViewSet):
    queryset = PredictionLog.objects.all()
    serializer_class = PredictionLogSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = PredictionLog.objects.select_related('user', 'model_used').order_by('-created_at')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        prediction = self.get_object()
        serializer = FlagPredictionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        prediction.is_flagged = True
        prediction.status = 'flagged'
        prediction.flag_reason = serializer.validated_data['flag_reason']
        prediction.flag_details = serializer.validated_data.get('flag_details', {})
        prediction.save()
        
        # Create notification
        Notification.objects.create(
            title=f'Prediction Flagged for Review',
            message=f'Prediction by {prediction.user.email} has been flagged: {prediction.flag_reason}',
            notification_type='prediction',
            priority=3,
            related_user=prediction.user,
            related_prediction=prediction
        )
        
        # Log the action
        SystemLog.objects.create(
            level='warning',
            category='prediction',
            source='admin_panel',
            message=f'Prediction flagged for review',
            user=request.user,
            details={
                'prediction_id': str(prediction.id),
                'user': prediction.user.email,
                'flag_reason': prediction.flag_reason
            }
        )
        
        return Response({'message': 'Prediction flagged successfully'})
    
    @action(detail=False, methods=['post'])
    def generate_sample_data(self, request):
        """Generate sample prediction data for testing"""
        try:
            # Get or create test users
            users = User.objects.filter(role='user')
            
            if not users.exists():
                # Create some test users
                for i in range(5):
                    user, _ = User.objects.get_or_create(
                        email=f'testuser{i+1}@example.com',
                        defaults={
                            'name': f'Test User {i+1}',
                            'role': 'user',
                            'is_active': True
                        }
                    )
                    users = User.objects.filter(role='user')
            
            # Get active model
            active_model = MLModel.objects.filter(is_active=True).first()
            
            if not active_model:
                # Create a default model if none exists
                active_model = MLModel.objects.create(
                    name='Default Prediction Model',
                    model_type='random_forest',
                    accuracy=0.85,
                    is_active=True,
                    status='trained'
                )
            
            # Sample data for predictions
            job_roles = [
                'Software Engineer', 'Data Scientist', 'ML Engineer',
                'DevOps Engineer', 'Frontend Developer', 'Backend Developer',
                'Full Stack Developer', 'Data Analyst', 'AI Engineer'
            ]
            
            skills_sets = [
                ['Python', 'Django', 'React', 'SQL'],
                ['Java', 'Spring Boot', 'Angular'],
                ['Python', 'TensorFlow', 'PyTorch'],
                ['JavaScript', 'Node.js', 'AWS'],
                ['C++', 'Python', 'Linux'],
                ['Python', 'Flask', 'PostgreSQL'],
                ['JavaScript', 'TypeScript', 'React'],
                ['R', 'Python', 'Tableau'],
                ['Python', 'OpenCV', 'Keras']
            ]
            
            locations = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo']
            
            # Create sample predictions
            predictions_created = 0
            for i in range(20):  # Create 20 sample predictions
                user = random.choice(users)
                job_index = random.randint(0, len(job_roles) - 1)
                confidence = random.uniform(0.65, 0.95)
                
                # Random status
                status_options = ['success', 'success', 'success', 'success', 'flagged', 'failed']
                status = random.choice(status_options)
                
                prediction = PredictionLog.objects.create(
                    user=user,
                    input_data={
                        'education': random.choice(['Bachelor\'s', 'Master\'s', 'PhD']),
                        'experience': f"{random.randint(1, 10)} years",
                        'skills': skills_sets[job_index],
                        'location': random.choice(locations),
                        'field': random.choice(['Computer Science', 'Data Science', 'Engineering'])
                    },
                    prediction_result={
                        'job_role': job_roles[job_index],
                        'confidence': confidence,
                        'salary_range': f"${random.randint(60, 120)}k - ${random.randint(80, 180)}k",
                        'probability_distribution': {
                            job_roles[job_index]: confidence,
                            'Alternative Role': 1 - confidence
                        }
                    },
                    confidence_score=confidence,
                    model_used=active_model,
                    model_version=active_model.version or '1.0.0',
                    status=status,
                    is_flagged=status == 'flagged',
                    flag_reason='Low confidence score' if status == 'flagged' else '',
                    processing_time=random.uniform(0.1, 2.5)
                )
                
                # Create user activity
                UserActivity.objects.create(
                    user=user,
                    activity_type='prediction',
                    description=f'Made prediction for {job_roles[job_index]} with {confidence:.1%} confidence',
                    metadata={
                        'model_used': str(active_model.id),
                        'confidence': confidence,
                        'status': status
                    }
                )
                
                predictions_created += 1
            
            return Response({
                'message': f'Successfully created {predictions_created} sample predictions',
                'total_predictions': PredictionLog.objects.count()
            })
            
        except Exception as e:
            logger.error(f"Error generating sample data: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrainModelView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request):
        serializer = TrainModelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get dataset
            dataset_id = serializer.validated_data['dataset_id']
            dataset = TrainingDataset.objects.get(id=dataset_id)
            
            # Read dataset
            file_path = dataset.dataset_file.path
            
            if dataset.dataset_type == 'csv':
                df = pd.read_csv(file_path)
            else:
                return Response({'error': 'Only CSV files are supported for training'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare data
            target_column = serializer.validated_data['target_column']
            if target_column not in df.columns:
                return Response({'error': f'Target column "{target_column}" not found in dataset'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Separate features and target
            X = df.drop(columns=[target_column])
            y = df[target_column]
            
            # Handle categorical variables
            categorical_cols = X.select_dtypes(include=['object']).columns
            label_encoders = {}
            if len(categorical_cols) > 0:
                for col in categorical_cols:
                    le = LabelEncoder()
                    X[col] = le.fit_transform(X[col].astype(str))
                    label_encoders[col] = le
            
            # Split data
            test_size = serializer.validated_data.get('test_size', 0.2)
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=serializer.validated_data.get('random_state', 42)
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model based on selected type
            model_type = serializer.validated_data['model_type']
            
            if model_type == 'random_forest':
                model = RandomForestClassifier(n_estimators=100, random_state=42)
            elif model_type == 'decision_tree':
                model = DecisionTreeClassifier(random_state=42)
            elif model_type == 'svm':
                model = SVC(probability=True, random_state=42)
            elif model_type == 'gradient_boosting':
                model = GradientBoostingClassifier(random_state=42)
            else:
                return Response({'error': f'Unsupported model type: {model_type}'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            import time
            start_time = time.time()
            model.fit(X_train_scaled, y_train)
            training_time = time.time() - start_time
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            
            # Create new model record
            ml_model = MLModel.objects.create(
                name=serializer.validated_data['model_name'],
                version='1.0.0',
                model_type=model_type,
                description=serializer.validated_data.get('description', ''),
                accuracy=accuracy,
                precision=precision,
                recall=recall,
                f1_score=f1,
                training_time=training_time,
                test_size=test_size,
                random_state=serializer.validated_data.get('random_state', 42),
                features_used=list(X.columns),
                target_column=target_column,
                trained_by=request.user,
                training_dataset=dataset,
                status='trained'
            )
            
            # Save model and scaler
            models_dir = os.path.join(settings.MEDIA_ROOT, 'models')
            scalers_dir = os.path.join(settings.MEDIA_ROOT, 'scalers')
            encoders_dir = os.path.join(settings.MEDIA_ROOT, 'encoders')
            
            os.makedirs(models_dir, exist_ok=True)
            os.makedirs(scalers_dir, exist_ok=True)
            os.makedirs(encoders_dir, exist_ok=True)
            
            model_path = os.path.join(models_dir, f'model_{ml_model.id}.joblib')
            scaler_path = os.path.join(scalers_dir, f'scaler_{ml_model.id}.joblib')
            encoder_path = os.path.join(encoders_dir, f'encoder_{ml_model.id}.joblib')
            
            joblib.dump(model, model_path)
            joblib.dump(scaler, scaler_path)
            
            # Save label encoders if any
            if label_encoders:
                joblib.dump(label_encoders, encoder_path)
                ml_model.encoder_file.name = f'encoders/encoder_{ml_model.id}.joblib'
            
            ml_model.model_file.name = f'models/model_{ml_model.id}.joblib'
            ml_model.scaler_file.name = f'scalers/scaler_{ml_model.id}.joblib'
            ml_model.save()
            
            # Log successful training
            SystemLog.objects.create(
                level='info',
                category='model_training',
                source='admin_panel',
                message=f'Model "{ml_model.name}" trained successfully',
                user=request.user,
                details={
                    'model_id': str(ml_model.id),
                    'accuracy': accuracy,
                    'training_time': training_time,
                    'features_used': len(ml_model.features_used)
                }
            )
            
            return Response({
                'message': 'Model trained successfully',
                'model': MLModelSerializer(ml_model).data,
                'metrics': {
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'training_time': training_time
                }
            })
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            
            # Log the error
            SystemLog.objects.create(
                level='error',
                category='model_training',
                source='admin_panel',
                message=f'Model training failed: {str(e)}',
                user=request.user,
                details={'error': str(e)}
            )
            
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminStatsView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            # Check if we have cached stats
            cache_duration = timedelta(seconds=300)  # 5 minutes
            recent_stats = AdminDashboardStats.objects.first()
            
            if recent_stats and timezone.now() - recent_stats.last_refreshed < cache_duration:
                return Response(recent_stats.stats_data)
            
            # Calculate fresh stats
            stats = self._calculate_stats(request)
            
            # Update or create cache
            if recent_stats:
                recent_stats.stats_data = stats
                recent_stats.save()
            else:
                AdminDashboardStats.objects.create(stats_data=stats)
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error calculating stats: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_stats(self, request):
        """Calculate all dashboard statistics"""
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        
        # Basic counts
        total_users = User.objects.count()
        total_predictions = PredictionLog.objects.count()
        total_models = MLModel.objects.count()
        flagged_predictions = PredictionLog.objects.filter(is_flagged=True).count()
        
        # Today's stats
        active_users_today = UserActivity.objects.filter(
            created_at__gte=today_start,
            activity_type='login'
        ).values('user').distinct().count()
        
        predictions_today = PredictionLog.objects.filter(
            created_at__gte=today_start
        ).count()
        
        # Average accuracy
        accuracy_avg_result = MLModel.objects.filter(status='trained').aggregate(
            avg_accuracy=Avg('accuracy')
        )
        accuracy_avg = accuracy_avg_result['avg_accuracy'] or 0
        
        training_datasets_count = TrainingDataset.objects.count()
        
        # Daily predictions for last 7 days
        daily_predictions = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            date_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            date_end = timezone.make_aware(datetime.combine(date, datetime.max.time()))
            
            count = PredictionLog.objects.filter(
                created_at__gte=date_start,
                created_at__lte=date_end
            ).count()
            
            daily_predictions.append({
                'date': date.isoformat(),
                'count': count
            })
        
        # User registrations for last 7 days
        user_registrations = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            date_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            date_end = timezone.make_aware(datetime.combine(date, datetime.max.time()))
            
            count = User.objects.filter(
                date_joined__gte=date_start,
                date_joined__lte=date_end
            ).count()
            
            user_registrations.append({
                'date': date.isoformat(),
                'count': count
            })
        
        # Model performance
        model_performance = list(MLModel.objects.filter(status='trained').values(
            'name', 'accuracy', 'f1_score', 'trained_at'
        ).order_by('-accuracy')[:5])
        
        # Convert datetime objects to strings
        for model in model_performance:
            if 'trained_at' in model and model['trained_at']:
                model['trained_at'] = model['trained_at'].isoformat()
        
        # Recent data - limit queries
        recent_predictions = PredictionLog.objects.select_related('user').order_by('-created_at')[:10]
        recent_activities = UserActivity.objects.select_related('user').order_by('-created_at')[:10]
        recent_notifications = Notification.objects.filter(is_read=False).order_by('-created_at')[:10]
        
        # Use serializers with context to properly format data
        prediction_serializer = PredictionLogSerializer(recent_predictions, many=True, context={'request': request})
        activity_serializer = UserActivitySerializer(recent_activities, many=True, context={'request': request})
        notification_serializer = NotificationSerializer(recent_notifications, many=True, context={'request': request})
        
        stats = {
            'total_users': total_users,
            'total_predictions': total_predictions,
            'total_models': total_models,
            'flagged_predictions': flagged_predictions,
            'active_users_today': active_users_today,
            'predictions_today': predictions_today,
            'accuracy_avg': round(accuracy_avg * 100, 2) if accuracy_avg else 0,
            'training_datasets_count': training_datasets_count,
            'daily_predictions': daily_predictions,
            'user_registrations': user_registrations,
            'model_performance': model_performance,
            'recent_predictions': prediction_serializer.data,
            'recent_activities': activity_serializer.data,
            'recent_notifications': notification_serializer.data
        }
        
        return stats

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        return queryset

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_object(self):
        # Get user by ID or email
        user_id = self.kwargs.get('pk')
        try:
            # Try to get by UUID
            return User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            # Try to get by email
            return User.objects.get(email=user_id)

class UserActivityView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        try:
            return UserActivity.objects.filter(user_id=user_id).order_by('-created_at')
        except:
            return UserActivity.objects.none()

class SystemLogView(generics.ListAPIView):
    serializer_class = SystemLogSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = SystemLog.objects.select_related('user').order_by('-created_at')
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(level=level)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset

class NotificationView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = Notification.objects.select_related('related_user').order_by('-created_at')
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=int(priority))
        
        # Filter by type
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset

class MarkNotificationReadView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            return Response({'message': 'Notification marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

class ActivateModelView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, pk):
        try:
            model = MLModel.objects.get(id=pk)
            
            # Deactivate all models
            MLModel.objects.all().update(is_active=False)
            
            # Activate this model
            model.is_active = True
            model.save()
            
            # Log the action
            SystemLog.objects.create(
                level='info',
                category='model',
                source='admin_panel',
                message=f'Model "{model.name}" activated',
                user=request.user,
                details={'model_id': str(model.id)}
            )
            
            return Response({'message': 'Model activated successfully'})
        except MLModel.DoesNotExist:
            return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)

class FlagPredictionView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, prediction_id):
        try:
            prediction = PredictionLog.objects.get(id=prediction_id)
            serializer = FlagPredictionSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            prediction.is_flagged = True
            prediction.status = 'flagged'
            prediction.flag_reason = serializer.validated_data['flag_reason']
            prediction.flag_details = serializer.validated_data.get('flag_details', {})
            prediction.save()
            
            # Create notification
            Notification.objects.create(
                title=f'Prediction Flagged for Review',
                message=f'Prediction by {prediction.user.email} has been flagged: {prediction.flag_reason}',
                notification_type='prediction',
                priority=3,
                related_user=prediction.user,
                related_prediction=prediction
            )
            
            # Log the action
            SystemLog.objects.create(
                level='warning',
                category='prediction',
                source='admin_panel',
                message=f'Prediction flagged for review',
                user=request.user,
                details={
                    'prediction_id': str(prediction.id),
                    'user': prediction.user.email,
                    'flag_reason': prediction.flag_reason
                }
            )
            
            return Response({'message': 'Prediction flagged successfully'})
        except PredictionLog.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)

class ReviewFlaggedPredictionView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, flag_id):
        try:
            prediction = PredictionLog.objects.get(id=flag_id, is_flagged=True)
            
            # Update prediction status
            prediction.is_flagged = False
            prediction.status = 'resolved'
            prediction.reviewed_by = request.user
            prediction.reviewed_at = timezone.now()
            prediction.save()
            
            # Log the action
            SystemLog.objects.create(
                level='info',
                category='prediction',
                source='admin_panel',
                message=f'Flagged prediction reviewed and resolved',
                user=request.user,
                details={'prediction_id': str(prediction.id)}
            )
            
            return Response({'message': 'Prediction reviewed and resolved'})
        except PredictionLog.DoesNotExist:
            return Response({'error': 'Flagged prediction not found'}, status=status.HTTP_404_NOT_FOUND)

class ExportDataView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        export_type = request.query_params.get('type', 'predictions')
        
        if export_type == 'predictions':
            data = PredictionLog.objects.all()
            serializer = PredictionLogSerializer(data, many=True, context={'request': request})
        elif export_type == 'users':
            data = User.objects.all()
            serializer = UserSerializer(data, many=True, context={'request': request})
        elif export_type == 'activities':
            data = UserActivity.objects.all()
            serializer = UserActivitySerializer(data, many=True, context={'request': request})
        elif export_type == 'system_logs':
            data = SystemLog.objects.all()
            serializer = SystemLogSerializer(data, many=True, context={'request': request})
        elif export_type == 'models':
            data = MLModel.objects.all()
            serializer = MLModelSerializer(data, many=True, context={'request': request})
        else:
            return Response({'error': 'Invalid export type'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.data)

class DashboardChartsView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        # Get data for various charts
        today = timezone.now().date()
        
        # Prediction trends for last 30 days
        prediction_trends = []
        for i in range(29, -1, -1):
            date = today - timedelta(days=i)
            date_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            date_end = timezone.make_aware(datetime.combine(date, datetime.max.time()))
            
            count = PredictionLog.objects.filter(
                created_at__gte=date_start,
                created_at__lte=date_end
            ).count()
            
            prediction_trends.append({
                'date': date.isoformat(),
                'count': count
            })
        
        # User activity by type
        activity_by_type = list(UserActivity.objects.values('activity_type').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        # Model performance comparison
        model_performance = list(MLModel.objects.filter(status='trained').values(
            'name', 'accuracy', 'precision', 'recall', 'f1_score'
        ).order_by('-accuracy'))
        
        # System logs by level
        logs_by_level = list(SystemLog.objects.values('level').annotate(
            count=Count('id')
        ).order_by('level'))
        
        charts_data = {
            'prediction_trends': prediction_trends,
            'activity_by_type': activity_by_type,
            'model_performance': model_performance,
            'logs_by_level': logs_by_level
        }
        
        return Response(charts_data)

class GenerateSampleDataView(APIView):
    """Generate sample data for testing"""
    permission_classes = [IsAdmin]
    
    def post(self, request):
        try:
            # Generate sample users
            sample_users = []
            for i in range(1, 6):
                user, created = User.objects.get_or_create(
                    email=f'user{i}@example.com',
                    defaults={
                        'name': f'User {i}',
                        'role': 'user',
                        'is_active': True,
                        'is_verified': True
                    }
                )
                if created:
                    user.set_password('password123')
                    user.save()
                    sample_users.append(user)
            
            # Get or create active model
            active_model = MLModel.objects.filter(is_active=True).first()
            if not active_model:
                active_model = MLModel.objects.create(
                    name='Job Prediction Model v1.0',
                    model_type='random_forest',
                    accuracy=0.87,
                    precision=0.85,
                    recall=0.86,
                    f1_score=0.855,
                    is_active=True,
                    status='trained',
                    version='1.0.0',
                    description='Default model for job role prediction'
                )
            
            # Generate sample predictions
            job_roles = [
                'Software Engineer',
                'Data Scientist', 
                'Machine Learning Engineer',
                'DevOps Engineer',
                'Frontend Developer',
                'Backend Developer',
                'Full Stack Developer',
                'Data Analyst',
                'AI Engineer',
                'Cloud Architect'
            ]
            
            predictions_created = 0
            for i in range(50):  # Create 50 sample predictions
                # Random date within last 30 days
                days_ago = random.randint(0, 29)
                created_date = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                
                user = random.choice(sample_users) if sample_users else User.objects.first()
                job_role = random.choice(job_roles)
                confidence = random.uniform(0.7, 0.98)
                
                # Random status (mostly success, some flagged/failed)
                status_roll = random.random()
                if status_roll < 0.85:
                    status = 'success'
                    is_flagged = False
                elif status_roll < 0.95:
                    status = 'flagged'
                    is_flagged = True
                else:
                    status = 'failed'
                    is_flagged = False
                
                prediction = PredictionLog(
                    user=user,
                    input_data={
                        'education': random.choice(['Bachelor\'s', 'Master\'s', 'PhD']),
                        'experience': f"{random.randint(1, 15)} years",
                        'skills': random.choice([
                            ['Python', 'Django', 'React', 'PostgreSQL'],
                            ['Java', 'Spring', 'MySQL', 'Docker'],
                            ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
                            ['JavaScript', 'Node.js', 'MongoDB', 'AWS'],
                            ['C++', 'Python', 'Linux', 'Git']
                        ]),
                        'location': random.choice(['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo']),
                        'field': random.choice(['Computer Science', 'Data Science', 'Software Engineering'])
                    },
                    prediction_result={
                        'job_role': job_role,
                        'confidence': confidence,
                        'salary_range': f"${random.randint(70, 150)}k - ${random.randint(100, 250)}k",
                        'top_skills': random.sample(['Python', 'SQL', 'AWS', 'Docker', 'React', 'TensorFlow'], 3)
                    },
                    confidence_score=confidence,
                    model_used=active_model,
                    model_version=active_model.version,
                    status=status,
                    is_flagged=is_flagged,
                    flag_reason='Low confidence' if is_flagged else '',
                    processing_time=random.uniform(0.5, 3.0)
                )
                prediction.created_at = created_date
                prediction.save()
                
                # Create corresponding user activity
                UserActivity.objects.create(
                    user=user,
                    activity_type='prediction',
                    description=f'Predicted as {job_role} with {confidence:.1%} confidence',
                    metadata={
                        'prediction_id': str(prediction.id),
                        'job_role': job_role,
                        'confidence': confidence,
                        'status': status
                    },
                    created_at=created_date
                )
                
                predictions_created += 1
            
            # Create some system logs
            log_messages = [
                ('info', 'User login successful'),
                ('info', 'Model prediction completed'),
                ('warning', 'High prediction latency detected'),
                ('error', 'Database connection timeout'),
                ('info', 'New user registered'),
                ('warning', 'Low confidence prediction flagged'),
                ('info', 'Dataset uploaded successfully'),
                ('error', 'Model training failed'),
                ('info', 'System backup completed'),
                ('warning', 'Memory usage above threshold')
            ]
            
            for level, message in log_messages:
                days_ago = random.randint(0, 14)
                created_date = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                
                SystemLog.objects.create(
                    level=level,
                    category=random.choice(['system', 'database', 'api', 'prediction']),
                    source='prediction_service',
                    message=message,
                    details={'timestamp': created_date.isoformat()},
                    created_at=created_date
                )
            
            # Create notifications
            notifications = [
                ('New Prediction Available', 'A new job prediction has been made', 'prediction', 2),
                ('Model Training Complete', 'ML model training completed successfully', 'model', 2),
                ('System Alert', 'High server load detected', 'system', 3),
                ('User Registered', 'New user joined the platform', 'user', 1),
                ('Data Export Ready', 'Prediction data export is ready for download', 'system', 2)
            ]
            
            for title, message, ntype, priority in notifications:
                days_ago = random.randint(0, 7)
                created_date = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                
                Notification.objects.create(
                    title=title,
                    message=message,
                    notification_type=ntype,
                    priority=priority,
                    is_read=random.choice([True, False]),
                    created_at=created_date
                )
            
            return Response({
                'success': True,
                'message': f'Successfully generated sample data',
                'data': {
                    'predictions_created': predictions_created,
                    'total_predictions': PredictionLog.objects.count(),
                    'total_users': User.objects.count(),
                    'total_models': MLModel.objects.count(),
                    'total_logs': SystemLog.objects.count(),
                    'total_notifications': Notification.objects.count()
                }
            })
            
        except Exception as e:
            logger.error(f"Error generating sample data: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)