# profiles/admin.py

from django.contrib import admin
from .models import (
    Education,
    Skill,
    Certification,
    WorkExperience,
    Resume,
    UserProfile
)

# Register your models with ModelAdmin classes
@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['user', 'degree', 'institution', 'graduation_year']
    search_fields = ['user__email', 'institution', 'field_of_study']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'level', 'category']
    search_fields = ['user__email', 'name']

@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'issuing_organization', 'issue_date']
    search_fields = ['user__email', 'name', 'issuing_organization']

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'company', 'start_date', 'currently_working']
    search_fields = ['user__email', 'title', 'company']

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_primary', 'uploaded_at']
    search_fields = ['user__email', 'title']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'profile_completion', 'remote_preference', 'updated_at']
    list_filter = ['profile_completion', 'remote_preference']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['profile_completion', 'created_at', 'updated_at']