from django.contrib import admin
from .models import (
    MLModel, TrainingDataset, PredictionLog,
    SystemLog, UserActivity, Notification, AdminDashboardStats
)

@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'model_type', 'accuracy', 'is_active', 'status', 'trained_at')
    list_filter = ('model_type', 'is_active', 'status', 'trained_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'training_time')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'version', 'model_type', 'description')
        }),
        ('Model Files', {
            'fields': ('model_file', 'scaler_file', 'encoder_file')
        }),
        ('Performance Metrics', {
            'fields': ('accuracy', 'precision', 'recall', 'f1_score')
        }),
        ('Training Parameters', {
            'fields': ('test_size', 'random_state', 'features_used', 'target_column')
        }),
        ('Status', {
            'fields': ('is_active', 'status')
        }),
        ('Training Info', {
            'fields': ('trained_by', 'trained_at', 'training_dataset')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'training_time')
        }),
    )

@admin.register(TrainingDataset)
class TrainingDatasetAdmin(admin.ModelAdmin):
    list_display = ('name', 'dataset_type', 'row_count', 'column_count', 'is_validated', 'uploaded_at')
    list_filter = ('dataset_type', 'is_validated', 'uploaded_at')
    search_fields = ('name', 'description')
    readonly_fields = ('uploaded_at', 'file_size_mb', 'row_count', 'column_count', 'column_names', 'validation_report')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'target_column')
        }),
        ('File Information', {
            'fields': ('dataset_file', 'dataset_type')
        }),
        ('Dataset Statistics', {
            'fields': ('file_size_mb', 'row_count', 'column_count', 'column_names')
        }),
        ('Validation', {
            'fields': ('is_validated', 'validation_report')
        }),
        ('Upload Info', {
            'fields': ('uploaded_by', 'uploaded_at')
        }),
    )

@admin.register(PredictionLog)
class PredictionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'confidence_score', 'status', 'is_flagged', 'created_at')
    list_filter = ('status', 'is_flagged', 'created_at')
    search_fields = ('user__email', 'user__name', 'prediction_result')
    readonly_fields = ('created_at', 'processing_time')
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Prediction Data', {
            'fields': ('input_data', 'prediction_result', 'confidence_score')
        }),
        ('Model Information', {
            'fields': ('model_used', 'model_version')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Flagging Information', {
            'fields': ('is_flagged', 'flag_reason', 'flag_details', 'reviewed_by', 'reviewed_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'processing_time')
        }),
    )

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('level', 'category', 'source', 'message', 'created_at')
    list_filter = ('level', 'category', 'created_at')
    search_fields = ('message', 'source', 'details')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Log Details', {
            'fields': ('level', 'category', 'source', 'message', 'details')
        }),
        ('User Information', {
            'fields': ('user', 'ip_address')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__email', 'user__name', 'description')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Activity Details', {
            'fields': ('user', 'activity_type', 'description', 'metadata')
        }),
        ('Technical Information', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'notification_type', 'priority', 'is_read', 'created_at')
    list_filter = ('notification_type', 'priority', 'is_read', 'is_archived', 'created_at')
    search_fields = ('title', 'message')
    readonly_fields = ('created_at', 'read_at')
    fieldsets = (
        ('Notification Content', {
            'fields': ('title', 'message', 'notification_type', 'priority')
        }),
        ('Status', {
            'fields': ('is_read', 'is_archived', 'read_at', 'expires_at')
        }),
        ('Related Objects', {
            'fields': ('related_user', 'related_model', 'related_prediction')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

@admin.register(AdminDashboardStats)
class AdminDashboardStatsAdmin(admin.ModelAdmin):
    list_display = ('last_refreshed', 'refresh_interval')
    readonly_fields = ('last_refreshed', 'stats_data')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False