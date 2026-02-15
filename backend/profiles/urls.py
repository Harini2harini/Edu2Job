from django.urls import path
from . import views

urlpatterns = [
    # Education
    path('educations/', views.EducationListCreateView.as_view(), name='education-list'),
    path('educations', views.EducationListCreateView.as_view()),
    
    path('educations/<uuid:pk>/', views.EducationDetailView.as_view(), name='education-detail'),
    
    # Skills
    path('skills/', views.SkillListCreateView.as_view(), name='skill-list'),
    path('skills', views.SkillListCreateView.as_view()),
    
    path('skills/<uuid:pk>/', views.SkillDetailView.as_view(), name='skill-detail'),
    
    # Certifications
    path('certifications/', views.CertificationListCreateView.as_view(), name='certification-list'),
    path('certifications', views.CertificationListCreateView.as_view()),
    
    path('certifications/<uuid:pk>/', views.CertificationDetailView.as_view(), name='certification-detail'),
    
    # Work Experience
    path('work-experiences/', views.WorkExperienceListCreateView.as_view(), name='work-experience-list'),
    path('work-experiences', views.WorkExperienceListCreateView.as_view()),
    
    path('work-experiences/<uuid:pk>/', views.WorkExperienceDetailView.as_view(), name='work-experience-detail'),
    
    # Resumes
    path('resumes/', views.ResumeListCreateView.as_view(), name='resume-list'),
    path('resumes', views.ResumeListCreateView.as_view()),
    
    path('resumes/<uuid:pk>/', views.ResumeDetailView.as_view(), name='resume-detail'),
    path('resumes/<uuid:pk>/set-primary/', views.SetPrimaryResumeView.as_view(), name='set-primary-resume'),
    
    # Profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile', views.UserProfileView.as_view()),
    
    path('profile/complete/', views.CompleteProfileView.as_view(), name='complete-profile'),
    path('profile/complete', views.CompleteProfileView.as_view()),
    
    path('profile/completion/', views.ProfileCompletionView.as_view(), name='profile-completion'),
    path('profile/completion', views.ProfileCompletionView.as_view()),
] 