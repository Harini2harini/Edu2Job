from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import (
    Education, Skill, Certification, WorkExperience, 
    Resume, UserProfile
)
from .serializers import (
    EducationSerializer, SkillSerializer, CertificationSerializer,
    WorkExperienceSerializer, ResumeSerializer, UserProfileSerializer,
    CompleteProfileSerializer
)

class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(user=self.request.user).order_by('-graduation_year')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

class SkillListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

class CertificationListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user).order_by('-issue_date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)

class WorkExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkExperience.objects.filter(user=self.request.user).order_by('-start_date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WorkExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WorkExperience.objects.filter(user=self.request.user)

class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

class SetPrimaryResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk, user=request.user)
        
        # Set this resume as primary
        Resume.objects.filter(user=request.user, is_primary=True).update(is_primary=False)
        resume.is_primary = True
        resume.save()
        
        return Response({'message': 'Primary resume updated successfully'})

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class CompleteProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get complete profile data"""
        user = request.user
        
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)
        
        data = {
            'profile': UserProfileSerializer(profile).data,
            'educations': EducationSerializer(
                Education.objects.filter(user=user), many=True
            ).data,
            'skills': SkillSerializer(
                Skill.objects.filter(user=user), many=True
            ).data,
            'certifications': CertificationSerializer(
                Certification.objects.filter(user=user), many=True
            ).data,
            'work_experiences': WorkExperienceSerializer(
                WorkExperience.objects.filter(user=user), many=True
            ).data,
            'resumes': ResumeSerializer(
                Resume.objects.filter(user=user), many=True
            ).data,
        }
        
        return Response(data)

class ProfileCompletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        completion = profile.calculate_profile_completion()
        
        # Calculate detailed completion
        details = {
            'overall_completion': completion,
            'sections': {
                'profile': bool(profile.professional_summary),
                'educations': Education.objects.filter(user=request.user).exists(),
                'skills': Skill.objects.filter(user=request.user).exists(),
                'certifications': Certification.objects.filter(user=request.user).exists(),
                'work_experiences': WorkExperience.objects.filter(user=request.user).exists(),
                'resume': Resume.objects.filter(user=request.user, is_primary=True).exists(),
            }
        }
        
        return Response(details)