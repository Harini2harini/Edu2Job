from django.db import models
import uuid
from django.conf import settings
import json

class MLModel(models.Model):
    MODEL_TYPES = [
        ('random_forest', 'Random Forest'),
        ('decision_tree', 'Decision Tree'),
        ('svm', 'Support Vector Machine'),
        ('gradient_boosting', 'Gradient Boosting'),
        ('neural_network', 'Neural Network'),
    ]
    
    MODEL_STATUS = [
        ('trained', 'Trained'),
        ('training', 'Training'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    version = models.CharField(max_length=50, default='1.0.0')
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES, default='random_forest')
    description = models.TextField(blank=True)
    
    # Model files
    model_file = models.FileField(upload_to='models/', null=True, blank=True)
    scaler_file = models.FileField(upload_to='scalers/', null=True, blank=True)
    encoder_file = models.FileField(upload_to='encoders/', null=True, blank=True)
    
    # Performance metrics
    accuracy = models.FloatField(default=0.0)
    precision = models.FloatField(default=0.0)
    recall = models.FloatField(default=0.0)
    f1_score = models.FloatField(default=0.0)
    training_time = models.FloatField(default=0.0)  # in seconds
    
    # Training parameters
    test_size = models.FloatField(default=0.2)
    random_state = models.IntegerField(default=42)
    features_used = models.JSONField(default=list, blank=True)
    target_column = models.CharField(max_length=100)
    
    # Status
    is_active = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=MODEL_STATUS, default='pending')
    
    # Training info
    trained_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    trained_at = models.DateTimeField(auto_now_add=True)
    training_dataset = models.ForeignKey('TrainingDataset', on_delete=models.SET_NULL, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} v{self.version}"
    
    def save(self, *args, **kwargs):
        if self.is_active:
            # Deactivate all other models
            MLModel.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)

class TrainingDataset(models.Model):
    DATASET_TYPES = [
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('excel', 'Excel'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # File information
    dataset_file = models.FileField(upload_to='datasets/')
    dataset_type = models.CharField(max_length=10, choices=DATASET_TYPES)
    file_size_mb = models.FloatField(default=0.0)
    
    # Dataset statistics
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)
    column_names = models.JSONField(default=list, blank=True)
    target_column = models.CharField(max_length=100, blank=True)
    
    # Validation
    is_validated = models.BooleanField(default=False)
    validation_report = models.JSONField(default=dict, blank=True)
    
    # Upload info
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.file_size_mb and self.dataset_file:
            self.file_size_mb = self.dataset_file.size / (1024 * 1024)  # Convert to MB
        super().save(*args, **kwargs)

class PredictionLog(models.Model):
    PREDICTION_STATUS = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('flagged', 'Flagged'),
        ('pending', 'Pending'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Prediction data
    input_data = models.JSONField()
    prediction_result = models.JSONField()
    confidence_score = models.FloatField(default=0.0)
    
    # Model used
    model_used = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True)
    model_version = models.CharField(max_length=50)
    
    # Status
    status = models.CharField(max_length=20, choices=PREDICTION_STATUS, default='pending')
    error_message = models.TextField(blank=True)
    
    # Flagging information
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    flag_details = models.JSONField(default=dict, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                   null=True, blank=True, related_name='reviewed_predictions')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    processing_time = models.FloatField(default=0.0)  # in seconds
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Prediction for {self.user.email} - {self.created_at}"

class SystemLog(models.Model):
    LOG_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    LOG_CATEGORIES = [
        ('system', 'System'),
        ('database', 'Database'),
        ('api', 'API'),
        ('model_training', 'Model Training'),
        ('prediction', 'Prediction'),
        ('user', 'User'),
        ('auth', 'Authentication'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Log details
    level = models.CharField(max_length=20, choices=LOG_LEVELS, default='info')
    category = models.CharField(max_length=50, choices=LOG_CATEGORIES, default='system')
    source = models.CharField(max_length=200)
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    
    # User info (if applicable)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"[{self.level.upper()}] {self.message[:100]}"

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('registration', 'Registration'),
        ('profile_update', 'Profile Update'),
        ('prediction', 'Prediction'),
        ('upload', 'File Upload'),
        ('password_change', 'Password Change'),
        ('admin_action', 'Admin Action'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Activity details
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # IP and device info
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type}"

class Notification(models.Model):
    PRIORITY_LEVELS = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Critical'),
    ]
    
    NOTIFICATION_TYPES = [
        ('system', 'System'),
        ('user', 'User'),
        ('prediction', 'Prediction'),
        ('model', 'Model'),
        ('security', 'Security'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Notification content
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='system')
    priority = models.IntegerField(choices=PRIORITY_LEVELS, default=2)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Related objects
    related_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                   null=True, blank=True, related_name='user_notifications')
    related_model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True, blank=True)
    related_prediction = models.ForeignKey(PredictionLog, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class AdminDashboardStats(models.Model):
    """Cache for dashboard statistics to improve performance"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Stats data
    stats_data = models.JSONField(default=dict)
    
    # Refresh info
    last_refreshed = models.DateTimeField(auto_now=True)
    refresh_interval = models.IntegerField(default=300)  # 5 minutes in seconds
    
    class Meta:
        verbose_name_plural = 'Admin Dashboard Stats'
    
    def __str__(self):
        return f"Dashboard Stats - {self.last_refreshed}"