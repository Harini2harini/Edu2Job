from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'models', views.MLModelViewSet, basename='mlmodel')
router.register(r'datasets', views.TrainingDatasetViewSet, basename='trainingdataset')
router.register(r'predictions', views.PredictionLogViewSet, basename='predictionlog')
router.register(r'feedback', views.FeedbackViewSet, basename='feedback')

# Create slash-less router
slashless_router = DefaultRouter(trailing_slash=False)
slashless_router.register(r'models', views.MLModelViewSet, basename='mlmodel-slashless')
slashless_router.register(r'datasets', views.TrainingDatasetViewSet, basename='trainingdataset-slashless')
slashless_router.register(r'predictions', views.PredictionLogViewSet, basename='predictionlog-slashless')
slashless_router.register(r'feedback', views.FeedbackViewSet, basename='feedback-slashless')

urlpatterns = [
    # Dashboard
    path('stats/', views.AdminStatsView.as_view(), name='admin_stats'),
    path('stats', views.AdminStatsView.as_view()),
    
    path('charts/', views.DashboardChartsView.as_view(), name='dashboard_charts'),
    path('charts', views.DashboardChartsView.as_view()),
    
    # Model Management
    path('train-model/', views.TrainModelView.as_view(), name='train_model'),
    path('train-model', views.TrainModelView.as_view()),
    
    path('models/<uuid:pk>/activate/', views.ActivateModelView.as_view(), name='activate_model'),
    
    # Prediction Management
    path('predictions/<uuid:prediction_id>/flag/', views.FlagPredictionView.as_view(), name='flag_prediction'),
    path('predictions/<uuid:flag_id>/review/', views.ReviewFlaggedPredictionView.as_view(), name='review_flagged'),
    path('predictions/generate-sample/', views.GenerateSampleDataView.as_view(), name='generate_sample_data'),
    path('predictions/generate-sample', views.GenerateSampleDataView.as_view()),
    
    # User Management
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users', views.UserListView.as_view()),
    
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<uuid:pk>', views.UserDetailView.as_view()),
    
    path('users/<uuid:user_id>/activities/', views.UserActivityView.as_view(), name='user_activities'),
    
    # System Logs
    path('system-logs/', views.SystemLogView.as_view(), name='system_logs'),
    path('system-logs', views.SystemLogView.as_view()),
    
    # Notifications
    path('notifications/', views.NotificationView.as_view(), name='notifications'),
    path('notifications', views.NotificationView.as_view()),
    
    path('notifications/<uuid:notification_id>/mark-read/', views.MarkNotificationReadView.as_view(), name='mark_notification_read'),
    
    # Data Export
    path('export/', views.ExportDataView.as_view(), name='export_data'),
    path('export', views.ExportDataView.as_view()),
    
    # Sample Data Generation
    path('generate-sample-data/', views.GenerateSampleDataView.as_view(), name='generate_sample_data'),
    path('generate-sample-data', views.GenerateSampleDataView.as_view()),
    
    # Include router URLs (both slashed and slash-less)
    path('', include(router.urls)),
    path('', include(slashless_router.urls)),
]