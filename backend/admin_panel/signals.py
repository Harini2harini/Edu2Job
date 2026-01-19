from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import (
    UserActivity, SystemLog, Notification, PredictionLog, MLModel
)

User = get_user_model()

# User signals
@receiver(post_save, sender=User)
def log_user_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance,
            activity_type='registration',
            description=f'User {instance.email} registered',
            metadata={'email': instance.email, 'role': instance.role}
        )
        
        # Create system log
        SystemLog.objects.create(
            level='info',
            category='user',
            source='authentication',
            message=f'New user registered: {instance.email}',
            user=instance
        )

# Model training signals
@receiver(post_save, sender=MLModel)
def log_model_training(sender, instance, created, **kwargs):
    if created and instance.status == 'trained':
        # Create notification for successful training
        Notification.objects.create(
            title=f'Model "{instance.name}" Trained Successfully',
            message=f'Model {instance.name} has been trained with {instance.accuracy:.2%} accuracy',
            notification_type='model',
            priority=2,
            related_model=instance
        )

# Prediction signals
@receiver(post_save, sender=PredictionLog)
def log_prediction_activity(sender, instance, created, **kwargs):
    if created:
        # Create user activity log
        UserActivity.objects.create(
            user=instance.user,
            activity_type='prediction',
            description=f'Made prediction with {instance.confidence_score:.1%} confidence',
            metadata={
                'model_used': str(instance.model_used.id) if instance.model_used else None,
                'confidence': instance.confidence_score,
                'status': instance.status
            }
        )
        
        # Create system log for failed predictions
        if instance.status == 'failed':
            SystemLog.objects.create(
                level='warning',
                category='prediction',
                source='prediction_service',
                message=f'Prediction failed for user {instance.user.email}',
                user=instance.user,
                details={'error': instance.error_message}
            )