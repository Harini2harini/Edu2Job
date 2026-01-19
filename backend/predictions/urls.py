from django.urls import path
from . import views

urlpatterns = [
    # Prediction endpoints
    path('predict/', views.PredictJobView.as_view(), name='predict_job'),
    path('history/', views.PredictionHistoryView.as_view(), name='prediction_history'),
    path('history/save/', views.SavePredictionHistoryView.as_view(), name='save_prediction_history'),
    path('history/<uuid:pk>/', views.PredictionDetailView.as_view(), name='prediction_detail'),
    path('prediction/<uuid:prediction_id>/', views.get_prediction_with_feedback, name='prediction_with_feedback'),
    
    # Model management
    path('model/status/', views.MLModelStatusView.as_view(), name='model_status'),
    path('model/retrain/', views.RetrainModelView.as_view(), name='retrain_model'),
    
    # Job roles and skills
    path('job-roles/', views.JobRolesListView.as_view(), name='job_roles_list'),
    
    # User statistics
    path('user-statistics/', views.UserStatisticsView.as_view(), name='user_statistics'),
    
    # Feedback endpoints
    path('feedback/', views.PredictionFeedbackView.as_view(), name='prediction_feedback'),
    path('feedback/list/', views.PredictionFeedbackListView.as_view(), name='user_feedback_list'),
    path('feedback/<uuid:pk>/', views.FeedbackDetailView.as_view(), name='feedback_detail'),
    path('feedback/stats/', views.FeedbackStatsView.as_view(), name='feedback_stats'),
]