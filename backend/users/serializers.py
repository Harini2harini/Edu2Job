from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, PasswordResetToken
from django.utils import timezone
from datetime import timedelta
import jwt
from django.conf import settings

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'password', 'confirm_password', 'role')
        extra_kwargs = {
            'name': {'required': True},
            'email': {'required': True},
            'phone': {'required': False},  # Make phone optional
        }
    
    def validate(self, attrs):
        print("Validating registration data:", attrs)
        
        # Check if passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": ["Password fields didn't match."]
            })
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "email": ["A user with this email already exists."]
            })
        
        # Set default role if not provided
        if 'role' not in attrs:
            attrs['role'] = 'user'
        
        # Remove confirm_password before creating user
        attrs.pop('confirm_password')
        
        return attrs
    
    def create(self, validated_data):
        print("Creating user with data:", validated_data)
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'user'),
            password=validated_data['password']
        )
        
        print(f"User created successfully: {user.email}")
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            
            if not user.is_active:
                raise serializers.ValidationError('Account is disabled')
            
        else:
            raise serializers.ValidationError('Must include "email" and "password"')
        
        attrs['user'] = user
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'role', 'is_verified', 
                  'date_joined', 'last_login', 'avatar', 'email_notifications')
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'date_joined', 'last_login')

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'phone', 'avatar', 'email_notifications')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No active user found with this email address")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        
        try:
            token = PasswordResetToken.objects.get(token=attrs['token'], is_used=False)
            if not token.is_valid():
                raise serializers.ValidationError({"token": "Token is invalid or has expired"})
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid reset token"})
        
        attrs['reset_token'] = token
        return attrs

class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField(required=False)
    code = serializers.CharField(required=False)
    id_token = serializers.CharField(required=False) 