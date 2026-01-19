import os
import json
import traceback
import numpy as np
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db.models import Count, Avg, Max, Min
from collections import Counter
from datetime import datetime, timedelta

from .models import PredictionHistory, MLModelVersion, JobRole, Skill, PredictionFeedback
from .serializers import (
    PredictionHistorySerializer, PredictionInputSerializer,
    MLModelVersionSerializer, RetrainModelSerializer, JobRoleSerializer,
    PredictionFeedbackSerializer, PredictionFeedbackInputSerializer
)
from users.models import User
from .ml_service import JobPredictionService

# Import UserActivity and SystemLog from admin_panel
try:
    from admin_panel.models import UserActivity, SystemLog, Notification
except ImportError:
    # Fallback if admin_panel is not available
    class UserActivity:
        @staticmethod
        def objects():
            return type('obj', (), {
                'create': lambda **kwargs: print(f"Would create UserActivity: {kwargs}")
            })()
    
    class SystemLog:
        @staticmethod
        def objects():
            return type('obj', (), {
                'create': lambda **kwargs: print(f"Would create SystemLog: {kwargs}")
            })()
    
    class Notification:
        @staticmethod
        def objects():
            return type('obj', (), {
                'create': lambda **kwargs: print(f"Would create Notification: {kwargs}")
            })()

class PredictJobView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Validate input data
            input_serializer = PredictionInputSerializer(data=request.data)
            if not input_serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid input data',
                    'details': input_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            input_data = input_serializer.validated_data
            print(f"📋 Received input data with {len(input_data)} fields")
            
            # Initialize prediction service
            try:
                predictor = JobPredictionService()
            except Exception as e:
                return Response({
                    'success': False,
                    'error': 'Prediction service initialization failed',
                    'details': str(e)
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Check if model is loaded
            if not predictor.model_loaded:
                return Response({
                    'success': False,
                    'error': 'Prediction model is not ready',
                    'details': 'Please try again in a few moments or contact administrator'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            print(f"✅ Model is loaded. Making prediction...")
            
            # Make prediction
            try:
                prediction_result = predictor.predict(input_data)
                
                if not prediction_result.get('success', False):
                    return Response({
                        'success': False,
                        'error': 'Prediction failed',
                        'details': prediction_result.get('error', 'Unknown error')
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            except Exception as e:
                print(f"❌ Prediction processing error: {str(e)}")
                print(f"Error details: {traceback.format_exc()}")
                return Response({
                    'success': False,
                    'error': 'Prediction processing failed',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Save prediction history
            saved_prediction_id = None
            try:
                history = PredictionHistory.objects.create(
                    user=request.user,
                    input_data=input_data,
                    top_prediction=prediction_result['top_prediction'],
                    confidence_score=prediction_result['confidence_score'],
                    all_predictions=prediction_result['all_predictions'],
                    missing_skills=prediction_result.get('missing_skills', []),
                    salary_range=prediction_result.get('salary_range', {}),
                    market_demand=prediction_result.get('market_demand', 'Medium'),
                    training_required=prediction_result.get('training_required', '')
                )
                saved_prediction_id = str(history.id)
                print(f"💾 Prediction saved to history with ID: {saved_prediction_id}")
                
                # Try to create user activity log
                try:
                    UserActivity.objects.create(
                        user=request.user,
                        activity_type='prediction',
                        description=f'Made prediction: {history.top_prediction} with {history.confidence_score}% confidence',
                        metadata={
                            'prediction_id': saved_prediction_id,
                            'confidence': history.confidence_score,
                            'job_role': history.top_prediction
                        }
                    )
                except Exception as e:
                    print(f"⚠️ Failed to create UserActivity: {str(e)}")
                
            except Exception as e:
                print(f"⚠️ Failed to save prediction history: {str(e)}")
                # Continue even if history save fails
            
            # Prepare response
            response_data = {
                'success': True,
                'prediction_id': saved_prediction_id,
                'user': {
                    'id': request.user.id,
                    'email': request.user.email,
                    'name': request.user.name
                },
                'input_summary': {
                    'education': f"{input_data.get('highest_degree', 'N/A')} in {input_data.get('degree_field', 'N/A')}",
                    'experience': f"{input_data.get('total_experience_years', 0)} years",
                    'primary_skills': self._extract_top_skills(input_data)
                },
                'predictions': prediction_result['all_predictions'],
                'top_prediction': {
                    'job_role': prediction_result['top_prediction'],
                    'confidence': prediction_result['confidence_score'],
                    'salary_range': prediction_result.get('salary_range', {}),
                    'market_demand': prediction_result.get('market_demand', 'Medium')
                },
                'analysis': {
                    'strengths': self._identify_strengths(input_data),
                    'improvement_areas': prediction_result.get('missing_skills', []),
                    'skill_gap': len(prediction_result.get('missing_skills', [])),
                    'training_months': prediction_result.get('training_months', 3)
                },
                'model_info': {
                    'version': predictor.get_model_version(),
                    'accuracy': predictor.get_model_accuracy(),
                    'last_trained': predictor.get_last_trained_date(),
                    'status': 'active'
                },
                'timestamp': timezone.now().isoformat(),
                'message': 'Prediction completed successfully'
            }
            
            print(f"✅ Prediction completed successfully for user: {request.user.email}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ General prediction error: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': 'Prediction failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_top_skills(self, input_data):
        """Extract top skills from input data"""
        skill_prefixes = ['skill_', 'cert_']
        skills = []
        
        for key, value in input_data.items():
            if any(key.startswith(prefix) for prefix in skill_prefixes):
                if isinstance(value, (int, float)) and value > 0:
                    skill_name = key.replace('skill_', '').replace('cert_', '').replace('_', ' ').title()
                    skills.append({
                        'name': skill_name,
                        'level': value if isinstance(value, (int, float)) else 1
                    })
        
        # Sort by level and take top 5
        skills.sort(key=lambda x: x['level'], reverse=True)
        return skills[:5]
    
    def _identify_strengths(self, input_data):
        """Identify user strengths based on input data"""
        strengths = []
        
        # Education strength
        if input_data.get('gpa_score', 0) >= 8.0:
            strengths.append('Strong academic performance')
        
        # Experience strength
        if input_data.get('total_experience_years', 0) >= 5:
            strengths.append('Significant industry experience')
        
        # Certification strength
        if input_data.get('additional_certs_count', 0) >= 3:
            strengths.append('Multiple professional certifications')
        
        # Technical skills strength
        tech_skills = ['skill_python', 'skill_java', 'skill_javascript', 
                      'skill_machine_learning', 'skill_data_analysis']
        tech_score = sum(input_data.get(skill, 0) for skill in tech_skills) / len(tech_skills)
        if tech_score >= 7.0:
            strengths.append('Strong technical skills foundation')
        
        return strengths if strengths else ['Well-rounded profile']


class SavePredictionHistoryView(APIView):
    """Save prediction to history (alternative endpoint)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['top_prediction', 'confidence_score', 'input_data']
            for field in required_fields:
                if field not in data:
                    return Response({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create prediction history
            history = PredictionHistory.objects.create(
                user=request.user,
                top_prediction=data['top_prediction'],
                confidence_score=data['confidence_score'],
                input_data=data['input_data'],
                all_predictions=data.get('predictions', []),
                missing_skills=data.get('missing_skills', []),
                salary_range=data.get('salary_range', {}),
                market_demand=data.get('market_demand', 'Medium'),
                training_required=data.get('training_required', '')
            )
            
            # Try to create user activity log
            try:
                UserActivity.objects.create(
                    user=request.user,
                    activity_type='prediction',
                    description=f'Made prediction: {history.top_prediction} with {history.confidence_score}% confidence',
                    metadata={
                        'prediction_id': str(history.id),
                        'confidence': history.confidence_score,
                        'job_role': history.top_prediction
                    }
                )
            except Exception as e:
                print(f"⚠️ Failed to create UserActivity: {str(e)}")
            
            return Response({
                'success': True,
                'message': 'Prediction saved successfully',
                'prediction_id': str(history.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error saving prediction: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to save prediction',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PredictionHistoryView(generics.ListAPIView):
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add statistics
        total_predictions = queryset.count()
        avg_confidence = queryset.aggregate(Avg('confidence_score'))['confidence_score__avg'] or 0
        
        return Response({
            'predictions': serializer.data,
            'statistics': {
                'total_predictions': total_predictions,
                'average_confidence': round(avg_confidence, 2),
                'most_predicted_role': self._get_most_predicted_role(queryset),
                'last_prediction': queryset.first().created_at.isoformat() if queryset.exists() else None
            }
        })
    
    def _get_most_predicted_role(self, queryset):
        if not queryset.exists():
            return None
        
        roles = [pred.top_prediction for pred in queryset]
        most_common = Counter(roles).most_common(1)
        
        if most_common:
            return {
                'role': most_common[0][0],
                'count': most_common[0][1]
            }
        return None


class PredictionDetailView(generics.RetrieveAPIView):
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)


class MLModelStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            predictor = JobPredictionService()
            model_info = predictor.get_model_info()
            
            # Get latest model version from database
            latest_model = MLModelVersion.objects.filter(is_active=True).first()
            
            return Response({
                'model_status': 'active' if model_info['loaded'] else 'inactive',
                'model_info': model_info,
                'database_info': MLModelVersionSerializer(latest_model).data if latest_model else None,
                'total_predictions_made': PredictionHistory.objects.count(),
                'average_confidence': PredictionHistory.objects.aggregate(Avg('confidence_score'))['confidence_score__avg'] or 0,
                'system_status': 'operational'
            })
        except Exception as e:
            return Response({
                'error': 'Failed to get model status',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RetrainModelView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        try:
            serializer = RetrainModelSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'error': 'Invalid retraining parameters',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get retraining parameters
            params = serializer.validated_data
            
            # Initialize prediction service
            predictor = JobPredictionService()
            
            # Retrain model
            result = predictor.retrain_model(
                dataset_path=params.get('dataset_path'),
                n_estimators=params.get('n_estimators'),
                max_depth=params.get('max_depth')
            )
            
            if not result.get('success'):
                return Response({
                    'error': 'Model retraining failed',
                    'details': result.get('error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Save model version to database
            model_version = MLModelVersion.objects.create(
                version=f"v{timezone.now().strftime('%Y%m%d_%H%M%S')}",
                accuracy_score=result['accuracy'],
                trained_on=timezone.now(),
                features_used=result.get('features_used', []),
                total_samples=result.get('total_samples', 0),
                model_path=result.get('model_path', ''),
                is_active=True,
                notes=params.get('notes', '')
            )
            
            return Response({
                'success': True,
                'message': 'Model retrained successfully',
                'model_version': MLModelVersionSerializer(model_version).data,
                'training_results': {
                    'accuracy': result['accuracy'],
                    'training_time': result.get('training_time'),
                    'total_samples': result.get('total_samples'),
                    'features_used': len(result.get('features_used', []))
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Model retraining failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobRolesListView(generics.ListAPIView):
    serializer_class = JobRoleSerializer
    permission_classes = [IsAuthenticated]
    queryset = JobRole.objects.all().order_by('name')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add statistics
        categories = JobRole.objects.values('category').annotate(
            count=Count('id'),
            avg_min_salary=Avg('avg_salary_min'),
            avg_max_salary=Avg('avg_salary_max')
        )
        
        return Response({
            'job_roles': serializer.data,
            'statistics': {
                'total_job_roles': queryset.count(),
                'categories': list(categories),
                'highest_demand': self._get_highest_demand_roles(),
                'highest_salary': self._get_highest_salary_roles()
            }
        })
    
    def _get_highest_demand_roles(self):
        return JobRole.objects.filter(demand_level='High').values('name', 'demand_level', 'growth_projection')[:5]
    
    def _get_highest_salary_roles(self):
        return JobRole.objects.order_by('-avg_salary_max').values('name', 'avg_salary_min', 'avg_salary_max')[:5]


class UserStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user predictions
        predictions = PredictionHistory.objects.filter(user=user)
        
        if not predictions.exists():
            return Response({
                'message': 'No predictions found for this user',
                'statistics': {}
            })
        
        # Calculate statistics
        total_predictions = predictions.count()
        avg_confidence = predictions.aggregate(Avg('confidence_score'))['confidence_score__avg'] or 0
        latest_prediction = predictions.latest('created_at')
        
        # Most predicted role
        roles = [pred.top_prediction for pred in predictions]
        role_counter = Counter(roles)
        most_common_role = role_counter.most_common(1)[0] if role_counter else None
        
        # Skill trends (extract from input data)
        skill_trends = self._analyze_skill_trends(predictions)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            },
            'statistics': {
                'total_predictions': total_predictions,
                'average_confidence': round(avg_confidence, 2),
                'most_predicted_role': {
                    'role': most_common_role[0] if most_common_role else None,
                    'count': most_common_role[1] if most_common_role else 0
                },
                'latest_prediction': {
                    'role': latest_prediction.top_prediction,
                    'confidence': latest_prediction.confidence_score,
                    'date': latest_prediction.created_at.isoformat()
                },
                'prediction_timeline': self._get_prediction_timeline(predictions),
                'skill_trends': skill_trends
            }
        })
    
    def _analyze_skill_trends(self, predictions):
        """Analyze skill trends from prediction history"""
        skill_data = {}
        
        for pred in predictions:
            input_data = pred.input_data
            for key, value in input_data.items():
                if key.startswith('skill_'):
                    skill_name = key.replace('skill_', '').replace('_', ' ').title()
                    if skill_name not in skill_data:
                        skill_data[skill_name] = []
                    skill_data[skill_name].append({
                        'date': pred.created_at.isoformat(),
                        'level': value
                    })
        
        # Calculate trends
        trends = []
        for skill, data in skill_data.items():
            if len(data) >= 2:
                first = data[0]['level']
                last = data[-1]['level']
                trend = 'improving' if last > first else 'declining' if last < first else 'stable'
                trends.append({
                    'skill': skill,
                    'trend': trend,
                    'change': round(last - first, 2),
                    'data_points': len(data)
                })
        
        return trends
    
    def _get_prediction_timeline(self, predictions):
        """Create prediction timeline"""
        timeline = []
        for pred in predictions.order_by('created_at'):
            timeline.append({
                'date': pred.created_at.strftime('%Y-%m-%d'),
                'role': pred.top_prediction,
                'confidence': pred.confidence_score
            })
        return timeline


class PredictionFeedbackView(APIView):
    """Handle prediction feedback submission"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            serializer = PredictionFeedbackInputSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Invalid feedback data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            prediction = data['prediction']
            
            # Check if user already gave feedback for this prediction
            existing_feedback = PredictionFeedback.objects.filter(
                prediction=prediction,
                user=request.user
            ).first()
            
            if existing_feedback:
                # Update existing feedback
                existing_feedback.rating = data['rating']
                existing_feedback.comment = data.get('comment', '')
                existing_feedback.save()
                feedback = existing_feedback
            else:
                # Create new feedback
                feedback = PredictionFeedback.objects.create(
                    prediction=prediction,
                    rating=data['rating'],
                    comment=data.get('comment', ''),
                    user=request.user,
                    user_email=request.user.email
                )
            
            # Try to log the feedback
            try:
                SystemLog.objects.create(
                    level='info',
                    category='prediction',
                    source='feedback_system',
                    message=f'User feedback submitted for prediction {prediction.id}',
                    user=request.user,
                    details={
                        'prediction_id': str(prediction.id),
                        'rating': data['rating'],
                        'has_comment': bool(data.get('comment', ''))
                    }
                )
            except Exception as e:
                print(f"⚠️ Failed to create SystemLog: {str(e)}")
            
            # Try to create notification for admin if rating is low
            if data['rating'] <= 2:
                try:
                    Notification.objects.create(
                        title=f'Low Rating Received for Prediction',
                        message=f'Prediction {prediction.top_prediction} received {data["rating"]}/5 stars',
                        notification_type='prediction',
                        priority=2,
                        related_prediction=prediction,
                        related_user=request.user
                    )
                except Exception as e:
                    print(f"⚠️ Failed to create Notification: {str(e)}")
            
            return Response({
                'success': True,
                'message': 'Thank you for your feedback!',
                'feedback_id': str(feedback.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error submitting feedback: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to submit feedback',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FeedbackDetailView(generics.RetrieveUpdateAPIView):
    """Get or update specific feedback (admin only)"""
    serializer_class = PredictionFeedbackSerializer
    permission_classes = [IsAdminUser]
    queryset = PredictionFeedback.objects.all()
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_reviewed = request.data.get('is_reviewed', instance.is_reviewed)
        instance.admin_notes = request.data.get('admin_notes', instance.admin_notes)
        instance.save()
        
        return Response({
            'success': True,
            'message': 'Feedback updated successfully'
        })


class FeedbackStatsView(APIView):
    """Get feedback statistics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            # Calculate statistics
            total_feedback = PredictionFeedback.objects.count()
            avg_rating = PredictionFeedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0
            
            # Rating distribution
            rating_distribution = {}
            for rating in range(1, 6):
                count = PredictionFeedback.objects.filter(rating=rating).count()
                percentage = (count / total_feedback * 100) if total_feedback > 0 else 0
                rating_distribution[rating] = {
                    'count': count,
                    'percentage': round(percentage, 2)
                }
            
            # Feedback with comments
            feedback_with_comments = PredictionFeedback.objects.exclude(comment='').count()
            comments_percentage = (feedback_with_comments / total_feedback * 100) if total_feedback > 0 else 0
            
            # Recent feedback
            recent_feedback = PredictionFeedback.objects.select_related('prediction', 'user').order_by('-created_at')[:10]
            recent_serializer = PredictionFeedbackSerializer(recent_feedback, many=True)
            
            # Common issues from low ratings
            low_rating_feedback = PredictionFeedback.objects.filter(rating__lte=3).exclude(comment='')
            common_issues = []
            if low_rating_feedback.exists():
                # Simple word frequency analysis
                comments = low_rating_feedback.values_list('comment', flat=True)
                all_words = ' '.join(comments).lower().split()
                word_freq = Counter(all_words)
                # Filter common negative words
                negative_words = ['bad', 'poor', 'wrong', 'inaccurate', 'not', 'doesnt', 'incorrect', 'useless', 'waste']
                common_issues = [{'word': word, 'count': count} 
                                for word, count in word_freq.items() 
                                if word in negative_words and count > 1]
            
            return Response({
                'statistics': {
                    'total_feedback': total_feedback,
                    'average_rating': round(avg_rating, 2),
                    'rating_distribution': rating_distribution,
                    'feedback_with_comments': {
                        'count': feedback_with_comments,
                        'percentage': round(comments_percentage, 2)
                    },
                    'unreviewed_feedback': PredictionFeedback.objects.filter(is_reviewed=False).count(),
                    'low_ratings': PredictionFeedback.objects.filter(rating__lte=2).count()
                },
                'recent_feedback': recent_serializer.data,
                'common_issues': common_issues[:5],
                'timeline_data': self._get_feedback_timeline()
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to get feedback statistics',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_feedback_timeline(self):
        """Get feedback timeline for last 30 days"""
        today = timezone.now().date()
        timeline = []
        
        for i in range(29, -1, -1):
            date = today - timedelta(days=i)
            date_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
            date_end = timezone.make_aware(datetime.combine(date, datetime.max.time()))
            
            count = PredictionFeedback.objects.filter(
                created_at__gte=date_start,
                created_at__lte=date_end
            ).count()
            
            avg = PredictionFeedback.objects.filter(
                created_at__gte=date_start,
                created_at__lte=date_end
            ).aggregate(Avg('rating'))['rating__avg'] or 0
            
            timeline.append({
                'date': date.isoformat(),
                'count': count,
                'average_rating': round(avg, 2)
            })
        
        return timeline


class PredictionFeedbackListView(generics.ListAPIView):
    """List all feedback for the current user"""
    serializer_class = PredictionFeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionFeedback.objects.filter(user=self.request.user).order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prediction_with_feedback(request, prediction_id):
    """Get prediction details with feedback"""
    try:
        prediction = PredictionHistory.objects.get(id=prediction_id, user=request.user)
        prediction_serializer = PredictionHistorySerializer(prediction)
        
        # Get feedback for this prediction
        feedback = PredictionFeedback.objects.filter(prediction=prediction, user=request.user).first()
        feedback_data = PredictionFeedbackSerializer(feedback).data if feedback else None
        
        return Response({
            'prediction': prediction_serializer.data,
            'feedback': feedback_data,
            'has_feedback': feedback is not None
        })
    except PredictionHistory.DoesNotExist:
        return Response({
            'error': 'Prediction not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to get prediction',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)