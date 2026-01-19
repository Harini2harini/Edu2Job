# profiles/utils/data_preprocessing.py
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import joblib
import os
from django.conf import settings
import json
from datetime import datetime

class DataPreprocessor:
    """Data preprocessing pipeline for education and profile data"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.minmax_scaler = MinMaxScaler(feature_range=(0, 1))
        self.label_encoders = {}
        self.imputer = SimpleImputer(strategy='mean')
        
        # Create ML models directory if not exists
        self.model_dir = os.path.join(settings.ML_MODEL_PATH, 'preprocessing')
        os.makedirs(self.model_dir, exist_ok=True)
    
    def preprocess_education_data(self, education_data):
        """Preprocess education data for ML"""
        processed = {}
        
        # Extract features
        features = self.extract_education_features(education_data)
        
        # Handle missing values
        features_filled = self.handle_missing_values(features)
        
        # Normalize numerical features
        normalized = self.normalize_features(features_filled)
        
        # Encode categorical features
        encoded = self.encode_categorical_features(normalized)
        
        processed['features'] = encoded
        processed['feature_names'] = list(encoded.keys())
        processed['feature_vector'] = list(encoded.values())
        processed['metadata'] = {
            'processed_at': datetime.now().isoformat(),
            'feature_count': len(encoded),
            'original_data_shape': len(education_data)
        }
        
        return processed
    
    def extract_education_features(self, data):
        """Extract relevant features from education data"""
        features = {}
        
        # Numerical features
        features['education_level'] = data.get('education_level', 0)
        features['gpa'] = data.get('gpa', 0) if data.get('gpa') else 0
        features['percentage'] = data.get('percentage', 0) if data.get('percentage') else 0
        features['cgpa'] = data.get('cgpa', 0) if data.get('cgpa') else 0
        features['graduation_year'] = data.get('graduation_year', 2000)
        
        # Calculate derived features
        current_year = datetime.now().year
        features['years_since_graduation'] = current_year - features['graduation_year']
        
        # Academic performance score (combine different metrics)
        features['academic_score'] = self.calculate_academic_score(
            features['gpa'], features['percentage'], features['cgpa']
        )
        
        # Categorical features (will be encoded later)
        features['degree_type'] = data.get('degree', 'other')
        features['grade_scale'] = data.get('grade_scale', '10')
        
        # Boolean features
        features['has_honors'] = bool(data.get('honors'))
        features['has_awards'] = bool(data.get('awards'))
        features['is_higher_education'] = data.get('degree') in ['bachelor', 'master', 'phd']
        
        return features
    
    def calculate_academic_score(self, gpa, percentage, cgpa):
        """Calculate unified academic score from different metrics"""
        scores = []
        
        if gpa:
            # Normalize GPA (assuming 10 or 4 point scale)
            if 0 <= gpa <= 10:  # 10-point scale
                scores.append(gpa / 10.0)
            elif 0 <= gpa <= 4:  # 4-point scale
                scores.append(gpa / 4.0)
        
        if percentage:
            scores.append(percentage / 100.0)
        
        if cgpa:
            scores.append(cgpa / 10.0)
        
        return np.mean(scores) if scores else 0
    
    def handle_missing_values(self, features):
        """Handle missing values in features"""
        # Convert to numpy array for imputation
        numerical_features = [
            features.get('education_level', 0),
            features.get('gpa', 0),
            features.get('percentage', 0),
            features.get('cgpa', 0),
            features.get('years_since_graduation', 0),
            features.get('academic_score', 0)
        ]
        
        # Impute missing values
        numerical_array = np.array(numerical_features).reshape(1, -1)
        imputed = self.imputer.fit_transform(numerical_array).flatten()
        
        # Update features with imputed values
        features['education_level'] = imputed[0]
        features['gpa'] = imputed[1]
        features['percentage'] = imputed[2]
        features['cgpa'] = imputed[3]
        features['years_since_graduation'] = imputed[4]
        features['academic_score'] = imputed[5]
        
        return features
    
    def normalize_features(self, features):
        """Normalize numerical features"""
        numerical_features = [
            features.get('education_level', 0),
            features.get('gpa', 0),
            features.get('percentage', 0),
            features.get('cgpa', 0),
            features.get('years_since_graduation', 0),
            features.get('academic_score', 0)
        ]
        
        # Scale to 0-1 range
        numerical_array = np.array(numerical_features).reshape(1, -1)
        normalized = self.minmax_scaler.fit_transform(numerical_array).flatten()
        
        # Update features with normalized values
        features['education_level_normalized'] = normalized[0]
        features['gpa_normalized'] = normalized[1]
        features['percentage_normalized'] = normalized[2]
        features['cgpa_normalized'] = normalized[3]
        features['years_since_graduation_normalized'] = normalized[4]
        features['academic_score_normalized'] = normalized[5]
        
        return features
    
    def encode_categorical_features(self, features):
        """Encode categorical features"""
        encoded_features = features.copy()
        
        # Encode degree type
        if 'degree_type' in features:
            if 'degree' not in self.label_encoders:
                self.label_encoders['degree'] = LabelEncoder()
                degree_types = ['high_school', 'diploma', 'bachelor', 'master', 'phd', 'other']
                self.label_encoders['degree'].fit(degree_types)
            
            encoded = self.label_encoders['degree'].transform([features['degree_type']])[0]
            encoded_features['degree_encoded'] = encoded / len(self.label_encoders['degree'].classes_)  # Normalize
        
        # Encode grade scale
        if 'grade_scale' in features:
            scale_mapping = {'10': 0, '4': 1, '100': 2, 'other': 3}
            encoded_features['grade_scale_encoded'] = scale_mapping.get(features['grade_scale'], 3) / 3.0
        
        # Convert boolean to binary
        for key in ['has_honors', 'has_awards', 'is_higher_education']:
            if key in encoded_features:
                encoded_features[key] = 1 if encoded_features[key] else 0
        
        return encoded_features
    
    def save_preprocessing_model(self, filename='preprocessor.pkl'):
        """Save preprocessing model"""
        model_path = os.path.join(self.model_dir, filename)
        joblib.dump({
            'scaler': self.scaler,
            'minmax_scaler': self.minmax_scaler,
            'label_encoders': self.label_encoders,
            'imputer': self.imputer
        }, model_path)
        return model_path
    
    def load_preprocessing_model(self, filename='preprocessor.pkl'):
        """Load preprocessing model"""
        model_path = os.path.join(self.model_dir, filename)
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            self.scaler = model_data['scaler']
            self.minmax_scaler = model_data['minmax_scaler']
            self.label_encoders = model_data['label_encoders']
            self.imputer = model_data['imputer']
            return True
        return False

class DataValidator:
    """Data validation and quality checks"""
    
    @staticmethod
    def validate_education_data(data):
        """Validate education data"""
        errors = []
        warnings = []
        
        # Required fields
        required_fields = ['degree', 'institution', 'graduation_year']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Data type validation
        if 'graduation_year' in data and data['graduation_year']:
            try:
                year = int(data['graduation_year'])
                current_year = datetime.now().year
                if year < 1900 or year > current_year + 5:
                    warnings.append(f"Graduation year {year} may be incorrect")
            except ValueError:
                errors.append("Invalid graduation year format")
        
        # Score validation
        for score_field in ['gpa', 'percentage', 'cgpa']:
            if score_field in data and data[score_field]:
                try:
                    score = float(data[score_field])
                    if score < 0:
                        errors.append(f"{score_field} cannot be negative")
                    
                    # Range checks
                    if score_field == 'gpa' and score > 10:
                        warnings.append(f"GPA {score} seems high for standard scales")
                    elif score_field == 'percentage' and score > 100:
                        errors.append("Percentage cannot exceed 100")
                    elif score_field == 'cgpa' and score > 10:
                        warnings.append(f"CGPA {score} seems high for standard scales")
                        
                except ValueError:
                    errors.append(f"Invalid {score_field} format")
        
        # Institution validation
        if 'institution' in data and data['institution']:
            institution = data['institution'].strip()
            if len(institution) < 2:
                errors.append("Institution name is too short")
            if len(institution) > 200:
                warnings.append("Institution name is very long")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'has_warnings': len(warnings) > 0
        }
    
    @staticmethod
    def validate_profile_data(data):
        """Validate profile data"""
        errors = []
        
        # Email validation
        if 'email' in data and data['email']:
            email = data['email'].strip()
            if '@' not in email or '.' not in email:
                errors.append("Invalid email format")
        
        # Date of birth validation
        if 'date_of_birth' in data and data['date_of_birth']:
            try:
                dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                if dob > datetime.now().date():
                    errors.append("Date of birth cannot be in the future")
                if dob < datetime(1900, 1, 1).date():
                    errors.append("Date of birth cannot be before 1900")
            except ValueError:
                errors.append("Invalid date format. Use YYYY-MM-DD")
        
        # URL validation
        url_fields = ['linkedin_url', 'github_url', 'portfolio_url']
        for field in url_fields:
            if field in data and data[field]:
                url = data[field].strip()
                if field == 'linkedin_url' and 'linkedin.com' not in url:
                    warnings.append(f"{field} may not be a valid LinkedIn URL")
                elif field == 'github_url' and 'github.com' not in url:
                    warnings.append(f"{field} may not be a valid GitHub URL")
                elif not url.startswith(('http://', 'https://')):
                    errors.append(f"{field} must start with http:// or https://")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    @staticmethod
    def calculate_data_quality_score(data):
        """Calculate data quality score (0-100)"""
        score = 0
        max_score = 100
        
        # Completeness (40%)
        required_fields = ['degree', 'institution', 'graduation_year']
        completed = sum(1 for field in required_fields if field in data and data[field])
        score += (completed / len(required_fields)) * 40
        
        # Accuracy (30%)
        # Check for reasonable values
        accuracy_score = 0
        
        if 'graduation_year' in data:
            year = int(data['graduation_year']) if str(data['graduation_year']).isdigit() else 0
            current_year = datetime.now().year
            if 1900 <= year <= current_year + 5:
                accuracy_score += 10
        
        if 'gpa' in data and data['gpa']:
            gpa = float(data['gpa']) if data['gpa'] else 0
            if 0 <= gpa <= 10:
                accuracy_score += 10
        
        if 'percentage' in data and data['percentage']:
            percentage = float(data['percentage']) if data['percentage'] else 0
            if 0 <= percentage <= 100:
                accuracy_score += 10
        
        score += accuracy_score
        
        # Consistency (20%)
        # Check for consistent data types and formats
        consistency_score = 0
        
        # Check if institution name is consistent (not too short/long)
        if 'institution' in data and 2 <= len(data['institution']) <= 200:
            consistency_score += 10
        
        # Check if field of study is provided
        if 'field_of_study' in data and data['field_of_study']:
            consistency_score += 10
        
        score += consistency_score
        
        # Timeliness (10%)
        # Check if data is recent
        timeliness_score = 0
        
        if 'graduation_year' in data:
            year = int(data['graduation_year']) if str(data['graduation_year']).isdigit() else 0
            current_year = datetime.now().year
            if year >= current_year - 10:  # Graduated within last 10 years
                timeliness_score += 10
        
        score += timeliness_score
        
        return min(score, max_score)

class DataEncryptor:
    """Data encryption and decryption utilities"""
    
    def __init__(self, key=None):
        from cryptography.fernet import Fernet
        self.key = key or settings.ENCRYPTION_KEY
        self.cipher = Fernet(self.key)
    
    def encrypt_data(self, data):
        """Encrypt sensitive data"""
        if isinstance(data, dict):
            # Encrypt specific fields
            encrypted_data = {}
            for key, value in data.items():
                if key in ['nationality', 'address', 'city', 'country', 'postal_code']:
                    encrypted_data[key] = self.cipher.encrypt(str(value).encode()).decode()
                else:
                    encrypted_data[key] = value
            return encrypted_data
        elif isinstance(data, str):
            return self.cipher.encrypt(data.encode()).decode()
        else:
            return data
    
    def decrypt_data(self, data):
        """Decrypt sensitive data"""
        if isinstance(data, dict):
            decrypted_data = {}
            for key, value in data.items():
                if key in ['nationality', 'address', 'city', 'country', 'postal_code']:
                    try:
                        decrypted_data[key] = self.cipher.decrypt(value.encode()).decode()
                    except:
                        decrypted_data[key] = value  # Return as-is if decryption fails
                else:
                    decrypted_data[key] = value
            return decrypted_data
        elif isinstance(data, str):
            try:
                return self.cipher.decrypt(data.encode()).decode()
            except:
                return data
        else:
            return data
    
    def encrypt_file(self, file_path):
        """Encrypt file content"""
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        encrypted_data = self.cipher.encrypt(file_data)
        
        encrypted_path = file_path + '.enc'
        with open(encrypted_path, 'wb') as f:
            f.write(encrypted_data)
        
        return encrypted_path
    
    def decrypt_file(self, encrypted_path):
        """Decrypt file content"""
        with open(encrypted_path, 'rb') as f:
            encrypted_data = f.read()
        
        decrypted_data = self.cipher.decrypt(encrypted_data)
        
        original_path = encrypted_path.replace('.enc', '')
        with open(original_path, 'wb') as f:
            f.write(decrypted_data)
        
        return original_path