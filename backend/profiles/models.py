from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
import uuid
import os

def user_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f'user_{instance.user.id}/{filename}'

class Education(models.Model):
    DEGREE_CHOICES = (
        ('high_school', 'High School'),
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor\'s Degree'),
        ('master', 'Master\'s Degree'),
        ('phd', 'PhD'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations')
    
    # Basic Information
    degree = models.CharField(max_length=50, choices=DEGREE_CHOICES)
    field_of_study = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    
    # Academic Details
    gpa = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        null=True,
        blank=True
    )
    percentage = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        null=True,
        blank=True
    )
    graduation_year = models.IntegerField()
    honors = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Education'
        verbose_name_plural = 'Educations'
        ordering = ['-graduation_year']
    
    def __str__(self):
        return f"{self.degree} in {self.field_of_study}"

class Skill(models.Model):
    SKILL_LEVELS = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    
    # Skill Details
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)  # e.g., Technical, Soft, Language
    level = models.CharField(max_length=20, choices=SKILL_LEVELS)
    years_of_experience = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.level})"

class Certification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    
    # Certification Details
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    
    # Document
    certificate_file = models.FileField(upload_to=user_directory_path, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Certification'
        verbose_name_plural = 'Certifications'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.name}"

class WorkExperience(models.Model):
    EMPLOYMENT_TYPES = (
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_experiences')
    
    # Job Details
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    
    # Duration
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    currently_working = models.BooleanField(default=False)
    
    # Location
    location = models.CharField(max_length=200, blank=True)
    remote = models.BooleanField(default=False)
    
    # Description
    description = models.TextField(blank=True)
    achievements = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Work Experience'
        verbose_name_plural = 'Work Experiences'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.title} at {self.company}"

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    
    # Resume Details
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to=user_directory_path)
    
    # Metadata
    is_primary = models.BooleanField(default=False)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=50)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title}"
    
    def save(self, *args, **kwargs):
        if self.is_primary:
            # Ensure only one primary resume per user
            Resume.objects.filter(user=self.user, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say')
    ])
    nationality = models.CharField(max_length=100, blank=True)
    
    # Contact Information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Career Preferences
    preferred_job_roles = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    salary_expectation = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    remote_preference = models.BooleanField(default=False)
    
    # Social Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Summary
    professional_summary = models.TextField(blank=True)
    career_objective = models.TextField(blank=True)
    
    # Profile Completion
    profile_completion = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.email}"
    
    def calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        total_fields = 0
        completed_fields = 0
        
        # Check educations
        if self.user.educations.exists():
            completed_fields += 1
        total_fields += 1
        
        # Check skills
        if self.user.skills.exists():
            completed_fields += 1
        total_fields += 1
        
        # Check certifications
        if self.user.certifications.exists():
            completed_fields += 1
        total_fields += 1
        
        # Check work experiences
        if self.user.work_experiences.exists():
            completed_fields += 1
        total_fields += 1
        
        # Check resume
        if self.user.resumes.exists():
            completed_fields += 1
        total_fields += 1
        
        # Check professional summary
        if self.professional_summary:
            completed_fields += 1
        total_fields += 1
        
        # Calculate percentage
        if total_fields > 0:
            self.profile_completion = int((completed_fields / total_fields) * 100)
        else:
            self.profile_completion = 0
        
        self.save()
        return self.profile_completion