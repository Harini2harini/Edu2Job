from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import requests
import json

from .models import User, PasswordResetToken
from .serializers import (
    UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, GoogleAuthSerializer
)
from .utils import generate_password_reset_token, send_password_reset_email

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        print("Register request data:", request.data)
        
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            print("Serializer is valid, creating user...")
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'phone': user.phone,
                    'role': user.role,
                    'is_verified': user.is_verified,
                    'avatar': user.avatar,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Registration successful'
            }
            
            print("Registration successful:", response_data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        # Return validation errors
        print("Serializer errors:", serializer.errors)
        return Response({
            'error': 'Registration failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        
        if not user:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Determine user role
        user_role = user.role
        if user.is_superuser and user.role == 'user':
            user_role = 'admin'
        
        # Generate tokens with role in payload
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user_role
        refresh['email'] = user.email
        refresh['name'] = user.name
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'role': user_role,  # Use determined role
                'is_verified': user.is_verified,
                'avatar': user.avatar,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print("=== Google OAuth Process Started ===")
            print("Google Auth Request Data:", request.data)
            print("Google Client ID:", settings.GOOGLE_CLIENT_ID[:20] + "...")
            
            # Get authorization code from request
            code = request.data.get('code')
            
            if not code:
                print("❌ No authorization code provided")
                return Response({
                    'error': 'Authorization code is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"✅ Received code (length: {len(code)})")
            
            # Exchange code for tokens
            token_url = 'https://oauth2.googleapis.com/token'
            token_data = {
                'code': code,
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                'grant_type': 'authorization_code'
            }
            
            print("📤 Sending token exchange request to Google...")
            token_response = requests.post(token_url, data=token_data)
            
            print(f"📥 Token response status: {token_response.status_code}")
            print(f"📥 Token response text: {token_response.text[:200]}...")
            
            if token_response.status_code != 200:
                print("❌ Token exchange failed")
                # If it's an invalid_grant error, suggest user to try again
                if "invalid_grant" in token_response.text:
                    return Response({
                        'error': 'Authorization code expired or already used. Please try logging in again.',
                        'details': 'The authorization code can only be used once. Click the Google login button again.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    'error': 'Failed to exchange code for tokens',
                    'details': token_response.text
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token_json = token_response.json()
            print("✅ Token exchange successful")
            
            id_token_str = token_json.get('id_token')
            access_token = token_json.get('access_token')
            
            if not id_token_str:
                print("❌ No ID token received from Google")
                return Response({
                    'error': 'No ID token received from Google'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify ID token
            try:
                print("🔍 Verifying ID token...")
                idinfo = id_token.verify_oauth2_token(
                    id_token_str, 
                    google_requests.Request(), 
                    settings.GOOGLE_CLIENT_ID
                )
                
                print("✅ ID token verified successfully")
                
                email = idinfo.get('email')
                name = idinfo.get('name', email.split('@')[0] if email else 'User')
                google_id = idinfo.get('sub')
                avatar = idinfo.get('picture')
                
                if not email:
                    print("❌ Email not provided by Google")
                    return Response({
                        'error': 'Email not provided by Google'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                print(f"👤 Google user info - Email: {email}, Name: {name}")
                
            except ValueError as e:
                print(f"❌ ID token verification failed: {str(e)}")
                # Try alternative approach with access token
                if access_token:
                    print("🔄 Trying alternative approach with access token...")
                    try:
                        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
                        headers = {'Authorization': f'Bearer {access_token}'}
                        user_info_response = requests.get(user_info_url, headers=headers)
                        user_info_response.raise_for_status()
                        user_info = user_info_response.json()
                        
                        email = user_info.get('email')
                        name = user_info.get('name', email.split('@')[0] if email else 'User')
                        google_id = user_info.get('id')
                        avatar = user_info.get('picture')
                        
                        if not email:
                            return Response({
                                'error': 'Email not provided by Google'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        print(f"✅ Alternative method successful - Email: {email}")
                    except Exception as alt_error:
                        print(f"❌ Alternative method also failed: {str(alt_error)}")
                        return Response({
                            'error': 'Failed to verify Google identity',
                            'details': str(e)
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'error': 'Invalid Google token',
                        'details': str(e)
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                print(f"✅ Existing user found: {user.email}")
                
                # Update Google ID if not set
                if not user.google_id and google_id:
                    user.google_id = google_id
                # Update avatar if not set
                if avatar and not user.avatar:
                    user.avatar = avatar
                # Ensure user is verified
                if not user.is_verified:
                    user.is_verified = True
                user.save()
                
            except User.DoesNotExist:
                print(f"👤 Creating new user for: {email}")
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    name=name,
                    google_id=google_id,
                    avatar=avatar,
                    is_verified=True
                )
                print(f"✅ New user created: {user.email}")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            refresh['email'] = user.email
            refresh['name'] = user.name
            
            print(f"✅ Authentication successful for user: {user.email}")
            
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'role': user.role,
                    'is_verified': user.is_verified,
                    'avatar': user.avatar,
                    'is_superuser': user.is_superuser,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Google authentication successful'
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Google API request failed: {str(e)}")
            return Response({
                'error': 'Failed to communicate with Google API',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"❌ Unexpected error in Google auth: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Google authentication failed',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'user': UserProfileSerializer(instance).data,
            'message': 'Profile updated successfully'
        })

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)

class ForgotPasswordView(generics.CreateAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email, is_active=True)
        
        # Generate reset token
        token = generate_password_reset_token(user)
        
        # Send email
        send_password_reset_email(user, token)
        
        return Response({
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)

class ResetPasswordView(generics.CreateAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        # Update user password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)

class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Simple redirect view - actual authentication happens in frontend"""
        return Response({
            'message': 'Please use the frontend OAuth flow'
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                "message": "Successfully logged out"
            }, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TestView(APIView):
    # Add these two lines to disable authentication for this view
    authentication_classes = []  # No authentication required
    permission_classes = []      # No permissions required
    
    def get(self, request):
        print("=== TestView Called ===")
        return Response({
            'message': '✅ Backend is working perfectly!',
            'status': 'OK',
            'timestamp': timezone.now().isoformat(),
            'instructions': 'Server is ready for authentication'
        })