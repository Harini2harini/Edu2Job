from django.db import models
from users.models import User
import uuid

class PredictionHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    
    # Input Features
    input_data = models.JSONField(default=dict)
    
    # Prediction Results
    top_prediction = models.CharField(max_length=200)
    confidence_score = models.FloatField()
    all_predictions = models.JSONField(default=list)  # Store top 5 predictions
    
    # Additional Info
    missing_skills = models.JSONField(default=list, blank=True)
    salary_range = models.JSONField(default=dict, blank=True)
    market_demand = models.CharField(max_length=50, blank=True)
    training_required = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Prediction History'
        verbose_name_plural = 'Prediction Histories'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Prediction for {self.user.email} - {self.top_prediction}"

class MLModelVersion(models.Model):
    version = models.CharField(max_length=50, unique=True)
    accuracy_score = models.FloatField()
    trained_on = models.DateTimeField()
    features_used = models.JSONField(default=list)
    total_samples = models.IntegerField()
    model_path = models.CharField(max_length=500)
    
    # Metadata
    is_active = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'ML Model Version'
        verbose_name_plural = 'ML Model Versions'
        ordering = ['-trained_on']
    
    def __str__(self):
        return f"Model v{self.version} - {self.accuracy_score:.2%}"
    
    def save(self, *args, **kwargs):
        if self.is_active:
            # Ensure only one active model
            MLModelVersion.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)

class JobRole(models.Model):
    name = models.CharField(max_length=200, unique=True)
    category = models.CharField(max_length=100)  # e.g., 'Tech', 'Business', 'Data Science'
    description = models.TextField(blank=True)
    
    # Salary Information
    avg_salary_min = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    avg_salary_max = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salary_currency = models.CharField(max_length=10, default='USD')
    
    # Market Information
    demand_level = models.CharField(max_length=50, choices=[
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low')
    ], default='Medium')
    
    required_skills = models.JSONField(default=list, blank=True)
    growth_projection = models.FloatField(default=0)  # Percentage growth
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Job Role'
        verbose_name_plural = 'Job Roles'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)  # Technical, Soft, Domain-specific
    importance_score = models.FloatField(default=0)  # Overall importance across jobs
    
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        ordering = ['-importance_score', 'name']
    
    def __str__(self):
        return self.name

# Add this to predictions/models.py
class PredictionFeedback(models.Model):
    """Model to store user feedback for predictions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to prediction
    prediction = models.ForeignKey(PredictionHistory, on_delete=models.CASCADE, related_name='feedbacks')
    
    # Rating (1-5 stars)
    rating = models.IntegerField(choices=[(1, '1 Star'), (2, '2 Stars'), (3, '3 Stars'), (4, '4 Stars'), (5, '5 Stars')])
    
    # Optional comment
    comment = models.TextField(blank=True)
    
    # User info (optional - can be anonymous)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    user_email = models.EmailField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin fields
    is_reviewed = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Prediction Feedback'
        verbose_name_plural = 'Prediction Feedbacks'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.prediction.top_prediction} - {self.rating} stars"