from rest_framework import serializers
from .models import (
    Education, Skill, Certification, WorkExperience, 
    Resume, UserProfile
)
from django.utils import timezone
import os

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def validate_graduation_year(self, value):
        current_year = timezone.now().year
        if value > current_year + 5:
            raise serializers.ValidationError('Graduation year cannot be more than 5 years in the future')
        if value < 1900:
            raise serializers.ValidationError('Graduation year cannot be before 1900')
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def validate_years_of_experience(self, value):
        if value < 0 or value > 50:
            raise serializers.ValidationError('Years of experience must be between 0 and 50')
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CertificationSerializer(serializers.ModelSerializer):
    certificate_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Certification
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'certificate_file_url')
    
    def get_certificate_file_url(self, obj):
        if obj.certificate_file:
            return obj.certificate_file.url
        return None
    
    def validate(self, data):
        issue_date = data.get('issue_date')
        expiration_date = data.get('expiration_date')
        
        if expiration_date and issue_date and expiration_date < issue_date:
            raise serializers.ValidationError({
                'expiration_date': 'Expiration date cannot be before issue date'
            })
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WorkExperienceSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkExperience
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'duration')
    
    def get_duration(self, obj):
        if obj.currently_working:
            return f"{obj.start_date.strftime('%b %Y')} - Present"
        elif obj.end_date:
            return f"{obj.start_date.strftime('%b %Y')} - {obj.end_date.strftime('%b %Y')}"
        return f"{obj.start_date.strftime('%b %Y')}"
    
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        currently_working = data.get('currently_working', False)
        
        if not currently_working and not end_date:
            raise serializers.ValidationError({
                'end_date': 'End date is required if not currently working'
            })
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before start date'
            })
        
        if start_date and start_date > timezone.now().date():
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be in the future'
            })
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ('id', 'user', 'file_size', 'file_type', 
                          'uploaded_at', 'file_url', 'file_size_mb')
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return f"{obj.file_size / (1024 * 1024):.2f} MB"
        return "0 MB"
    
    def validate_file(self, value):
        # Check file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError('File size cannot exceed 10MB')
        
        # Check file type
        allowed_types = ['pdf', 'doc', 'docx']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_types:
            raise serializers.ValidationError(
                f'Unsupported file type. Allowed types: {", ".join(allowed_types)}'
            )
        
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['file_size'] = validated_data['file'].size
        validated_data['file_type'] = validated_data['file'].name.split('.')[-1].lower()
        
        # If this is the first resume, set it as primary
        if not Resume.objects.filter(user=validated_data['user']).exists():
            validated_data['is_primary'] = True
        
        return super().create(validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('id', 'user', 'profile_completion', 'created_at', 'updated_at')
    
    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.calculate_profile_completion()
        return instance

class CompleteProfileSerializer(serializers.Serializer):
    """Serializer for complete profile data"""
    profile = UserProfileSerializer(required=False)
    educations = EducationSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    work_experiences = WorkExperienceSerializer(many=True, required=False)
    resumes = ResumeSerializer(many=True, required=False)