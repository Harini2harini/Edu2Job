from rest_framework import serializers
from .models import (
    MLModel, TrainingDataset, PredictionLog, 
    SystemLog, UserActivity, Notification
)
from users.models import User
from datetime import timedelta
from django.utils import timezone
import uuid

class MLModelSerializer(serializers.ModelSerializer):
    trained_by_name = serializers.CharField(source='trained_by.name', read_only=True, allow_null=True)
    trained_by_email = serializers.CharField(source='trained_by.email', read_only=True, allow_null=True)
    training_dataset_name = serializers.CharField(source='training_dataset.name', read_only=True, allow_null=True)
    trained_by_id = serializers.SerializerMethodField()
    training_dataset_id = serializers.SerializerMethodField()
    
    class Meta:
        model = MLModel
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'trained_at', 'training_time')
    
    def get_trained_by_id(self, obj):
        return str(obj.trained_by.id) if obj.trained_by else None
    
    def get_training_dataset_id(self, obj):
        return str(obj.training_dataset.id) if obj.training_dataset else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        if 'trained_by' in representation and representation['trained_by']:
            representation['trained_by'] = str(representation['trained_by'])
        
        if 'training_dataset' in representation and representation['training_dataset']:
            representation['training_dataset'] = str(representation['training_dataset'])
        
        return representation

class TrainingDatasetSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True, allow_null=True)
    uploaded_by_email = serializers.CharField(source='uploaded_by.email', read_only=True, allow_null=True)
    uploaded_by_id = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingDataset
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at', 'created_at', 'file_size_mb', 
                          'row_count', 'column_count', 'column_names', 'validation_report')
    
    def get_uploaded_by_id(self, obj):
        return str(obj.uploaded_by.id) if obj.uploaded_by else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        if 'uploaded_by' in representation and representation['uploaded_by']:
            representation['uploaded_by'] = str(representation['uploaded_by'])
        
        return representation

class PredictionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True, allow_null=True)
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    model_name = serializers.CharField(source='model_used.name', read_only=True, allow_null=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True, allow_null=True)
    user_id = serializers.SerializerMethodField()
    model_used_id = serializers.SerializerMethodField()
    reviewed_by_id = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionLog
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'processing_time')
    
    def get_user_id(self, obj):
        return str(obj.user.id) if obj.user else None
    
    def get_model_used_id(self, obj):
        return str(obj.model_used.id) if obj.model_used else None
    
    def get_reviewed_by_id(self, obj):
        return str(obj.reviewed_by.id) if obj.reviewed_by else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        related_fields = ['user', 'model_used', 'reviewed_by']
        for field in related_fields:
            if field in representation and representation[field]:
                representation[field] = str(representation[field])
        
        return representation

class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True, allow_null=True)
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    user_id = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemLog
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
    
    def get_user_id(self, obj):
        return str(obj.user.id) if obj.user else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        if 'user' in representation and representation['user']:
            representation['user'] = str(representation['user'])
        
        return representation

class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.SerializerMethodField()
    
    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
    
    def get_user_id(self, obj):
        return str(obj.user.id) if obj.user else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        if 'user' in representation and representation['user']:
            representation['user'] = str(representation['user'])
        
        return representation

class NotificationSerializer(serializers.ModelSerializer):
    related_user_name = serializers.CharField(source='related_user.name', read_only=True, allow_null=True)
    related_user_email = serializers.CharField(source='related_user.email', read_only=True, allow_null=True)
    related_model_name = serializers.CharField(source='related_model.name', read_only=True, allow_null=True)
    related_user_id = serializers.SerializerMethodField()
    related_model_id = serializers.SerializerMethodField()
    related_prediction_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'read_at')
    
    def get_related_user_id(self, obj):
        return str(obj.related_user.id) if obj.related_user else None
    
    def get_related_model_id(self, obj):
        return str(obj.related_model.id) if obj.related_model else None
    
    def get_related_prediction_id(self, obj):
        return str(obj.related_prediction.id) if obj.related_prediction else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        # Handle related object IDs
        related_fields = ['related_user', 'related_model', 'related_prediction']
        for field in related_fields:
            if field in representation and representation[field]:
                representation[field] = str(representation[field])
        
        return representation

class MarkNotificationReadSerializer(serializers.Serializer):
    is_read = serializers.BooleanField(default=True)

class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'role', 'is_active', 
                 'is_verified', 'date_joined', 'last_login', 'avatar', 'user_id')
        read_only_fields = ('id', 'date_joined', 'last_login')
    
    def get_user_id(self, obj):
        return str(obj.id) if obj.id else None
    
    def to_representation(self, instance):
        """Convert UUID to string in JSON response"""
        representation = super().to_representation(instance)
        
        # Convert all UUID fields to strings
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
        
        return representation

class TrainingDatasetUploadSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    dataset_file = serializers.FileField(required=True)
    target_column = serializers.CharField(required=False, allow_blank=True)

class TrainModelSerializer(serializers.Serializer):
    dataset_id = serializers.UUIDField(required=True)
    model_name = serializers.CharField(required=True, max_length=200)
    model_type = serializers.ChoiceField(
        choices=[('random_forest', 'Random Forest'), 
                ('decision_tree', 'Decision Tree'),
                ('svm', 'Support Vector Machine'),
                ('gradient_boosting', 'Gradient Boosting')],
        default='random_forest'
    )
    target_column = serializers.CharField(required=True)
    test_size = serializers.FloatField(required=False, default=0.2, min_value=0.1, max_value=0.5)
    random_state = serializers.IntegerField(required=False, default=42)
    description = serializers.CharField(required=False, allow_blank=True)

class FlagPredictionSerializer(serializers.Serializer):
    flag_reason = serializers.CharField(required=True, max_length=500)
    flag_details = serializers.JSONField(required=False, default=dict)

class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_predictions = serializers.IntegerField()
    total_models = serializers.IntegerField()
    flagged_predictions = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    predictions_today = serializers.IntegerField()
    accuracy_avg = serializers.FloatField()
    training_datasets_count = serializers.IntegerField()
    
    # Charts data
    daily_predictions = serializers.ListField()
    user_registrations = serializers.ListField()
    model_performance = serializers.ListField()
    
    # Recent data
    recent_predictions = PredictionLogSerializer(many=True)
    recent_activities = UserActivitySerializer(many=True)
    recent_notifications = NotificationSerializer(many=True)