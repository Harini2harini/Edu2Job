from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import MLModel, TrainingDataset, PredictionLog

User = get_user_model()

class AdminPanelTests(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            password='testpass123',
            role='admin'
        )
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            name='Regular User',
            password='testpass123',
            role='user'
        )
        
        # Create test model
        self.model = MLModel.objects.create(
            name='Test Model',
            model_type='random_forest',
            accuracy=0.85,
            is_active=True
        )
        
        # Authenticate as admin
        self.client.force_authenticate(user=self.admin_user)
    
    def test_admin_stats_access(self):
        """Test admin can access stats"""
        response = self.client.get('/api/admin/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
    
    def test_non_admin_stats_access(self):
        """Test non-admin cannot access stats"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/admin/stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_model_list_access(self):
        """Test admin can list models"""
        response = self.client.get('/api/admin/models/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_model_activation(self):
        """Test admin can activate model"""
        response = self.client.post(f'/api/admin/models/{self.model.id}/activate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify model is active
        self.model.refresh_from_db()
        self.assertTrue(self.model.is_active)