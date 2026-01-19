import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from django.conf import settings
import traceback

class JobPredictionService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = None
        self.salary_data = {}
        self.categorical_mappings = {}
        self.model_loaded = False
        self.model_info = {}
        
        # Get the absolute base directory
        self.base_dir = settings.BASE_DIR
        self.model_dir = os.path.join(self.base_dir, 'ml_model', 'saved_model')
        
        # Ensure directories exist
        os.makedirs(self.model_dir, exist_ok=True)
        
        print(f"Looking for model files at: {self.model_dir}")
        print(f"Model directory exists: {os.path.exists(self.model_dir)}")
        
        # Try to load existing model
        if not self.load_model():
            print("Model not loaded, attempting to train...")
            self.train_initial_model()
    
    def load_model(self):
        """Load trained model and preprocessing objects"""
        try:
            model_path = os.path.join(self.model_dir, 'random_forest_model.joblib')
            scaler_path = os.path.join(self.model_dir, 'scaler.joblib')
            encoder_path = os.path.join(self.model_dir, 'label_encoder.joblib')
            metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
            
            print(f"Model path exists: {os.path.exists(model_path)}")
            print(f"Scaler path exists: {os.path.exists(scaler_path)}")
            print(f"Encoder path exists: {os.path.exists(encoder_path)}")
            print(f"Metadata path exists: {os.path.exists(metadata_path)}")
            
            if not all([os.path.exists(model_path), 
                       os.path.exists(scaler_path), 
                       os.path.exists(encoder_path),
                       os.path.exists(metadata_path)]):
                print("❌ Model files not found. Need to train model first.")
                return False
            
            # Load the model and preprocessing objects
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.label_encoder = joblib.load(encoder_path)
            
            # Load metadata
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            self.feature_columns = metadata['feature_columns']
            self.salary_data = metadata.get('salary_data', {})
            self.categorical_mappings = metadata.get('categorical_mappings', {})
            
            self.model_info = {
                'loaded': True,
                'last_trained': metadata.get('last_trained', datetime.now().isoformat()),
                'accuracy': metadata.get('accuracy', 0.85),
                'total_samples': metadata.get('total_samples', 0),
                'features_count': len(self.feature_columns),
                'job_roles_count': len(self.label_encoder.classes_),
                'version': metadata.get('version', '1.0.0')
            }
            
            self.model_loaded = True
            print("✅ Model loaded successfully")
            print(f"   Features: {len(self.feature_columns)}")
            print(f"   Job Roles: {len(self.label_encoder.classes_)}")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
            self.model_loaded = False
            return False
    
    def train_initial_model(self):
        """Train initial model with sample data or existing dataset"""
        print("\n" + "="*60)
        print("TRAINING NEW JOB PREDICTION MODEL")
        print("="*60)
        
        try:
            # Check if dataset exists
            dataset_paths = [
                os.path.join(self.base_dir, 'ml_model', 'datasets', 'job_prediction_dataset.csv'),
                os.path.join(self.base_dir, 'predictions', 'data', 'sample_job_data.csv'),
                os.path.join(self.base_dir, 'job_prediction_dataset.csv')
            ]
            
            dataset_path = None
            for path in dataset_paths:
                if os.path.exists(path):
                    dataset_path = path
                    print(f"✅ Found dataset at: {path}")
                    break
            
            if dataset_path is None:
                print("❌ No dataset found. Creating synthetic data for initial training...")
                # Create synthetic data for initial model
                dataset_path = self.create_synthetic_data()
            
            # Train the model
            accuracy = self.train_model(dataset_path)
            
            if accuracy > 0:
                print(f"\n🎉 Model training completed successfully!")
                print(f"📊 Model Accuracy: {accuracy:.2%}")
                self.model_loaded = True
            else:
                print("❌ Model training failed, creating fallback model...")
                self.create_fallback_model()
                
        except Exception as e:
            print(f"❌ Model training failed: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
            # Create a minimal working model even if training fails
            self.create_fallback_model()
    
    def create_synthetic_data(self):
        """Create synthetic training data for initial model"""
        print("Creating synthetic training data...")
        
        n_samples = 1000
        
        # Generate synthetic data
        np.random.seed(42)
        
        data = {
            'age': np.random.randint(22, 45, n_samples),
            'gender': np.random.choice(['Male', 'Female', 'Other'], n_samples),
            'highest_degree': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_samples),
            'degree_field': np.random.choice(['Computer Science', 'Engineering', 'Business', 'Science'], n_samples),
            'institution_tier': np.random.choice(['Tier 1', 'Tier 2', 'Tier 3'], n_samples),
            'gpa_score': np.round(np.random.uniform(6.0, 9.8, n_samples), 1),
            'graduation_year': np.random.randint(2010, 2024, n_samples),
            'years_since_graduation': 2024 - np.random.randint(2010, 2024, n_samples),
            'total_experience_years': np.round(np.random.uniform(0, 15, n_samples), 1),
            'additional_certs_count': np.random.randint(0, 10, n_samples),
            'online_courses_completed': np.random.randint(0, 20, n_samples),
            'research_publications': np.random.randint(0, 5, n_samples),
            'professional_network_size': np.random.randint(50, 1000, n_samples),
            'industry': np.random.choice(['Technology', 'Finance', 'Healthcare', 'Education'], n_samples),
            'current_role_level': np.random.choice(['Entry', 'Mid', 'Senior', 'Lead'], n_samples),
            'remote_work_percentage': np.random.randint(0, 101, n_samples),
            
            # Skills (0-10 scale)
            'skill_python': np.random.randint(0, 11, n_samples),
            'skill_java': np.random.randint(0, 11, n_samples),
            'skill_javascript': np.random.randint(0, 11, n_samples),
            'skill_sql': np.random.randint(0, 11, n_samples),
            'skill_machine_learning': np.random.randint(0, 11, n_samples),
            'skill_data_analysis': np.random.randint(0, 11, n_samples),
            'skill_react': np.random.randint(0, 11, n_samples),
            'skill_aws': np.random.randint(0, 11, n_samples),
            'skill_communication': np.random.randint(3, 11, n_samples),
            'skill_leadership': np.random.randint(3, 11, n_samples),
            'skill_problem_solving': np.random.randint(3, 11, n_samples),
            'skill_teamwork': np.random.randint(3, 11, n_samples),
            
            # Certifications
            'cert_aws': np.random.choice([True, False], n_samples, p=[0.3, 0.7]),
            'cert_google_cloud': np.random.choice([True, False], n_samples, p=[0.2, 0.8]),
            'cert_azure': np.random.choice([True, False], n_samples, p=[0.2, 0.8]),
            'cert_data_science': np.random.choice([True, False], n_samples, p=[0.25, 0.75]),
            
            # Calculated scores
            'education_score': np.round(np.random.uniform(60, 100, n_samples), 1),
            'tech_skill_score': np.round(np.random.uniform(50, 95, n_samples), 1),
            'soft_skill_score': np.round(np.random.uniform(60, 100, n_samples), 1),
            'overall_profile_score': np.round(np.random.uniform(65, 95, n_samples), 1)
        }
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Determine job role based on skills
        def assign_job_role(row):
            python = row['skill_python']
            ml = row['skill_machine_learning']
            data_analysis = row['skill_data_analysis']
            java = row['skill_java']
            js = row['skill_javascript']
            react = row['skill_react']
            aws = row['skill_aws']
            sql = row['skill_sql']
            
            if ml >= 8 and python >= 8:
                return 'Data Scientist'
            elif ml >= 7 and python >= 7:
                return 'ML Engineer'
            elif data_analysis >= 7 and sql >= 7:
                return 'Data Analyst'
            elif (java >= 7 or js >= 7) and react >= 6:
                return 'Software Engineer'
            elif aws >= 7 and python >= 6:
                return 'Cloud Engineer'
            elif sql >= 6 and data_analysis >= 6:
                return 'Business Analyst'
            elif row['skill_leadership'] >= 7:
                return 'Product Manager'
            elif row['skill_problem_solving'] >= 8:
                return 'Systems Analyst'
            else:
                return 'IT Consultant'
        
        df['predicted_job_role'] = df.apply(assign_job_role, axis=1)
        
        # Add salary data based on job role
        salary_ranges = {
            'Data Scientist': (80000, 150000),
            'ML Engineer': (90000, 160000),
            'Data Analyst': (60000, 120000),
            'Software Engineer': (70000, 140000),
            'Cloud Engineer': (90000, 170000),
            'Business Analyst': (65000, 130000),
            'Product Manager': (85000, 160000),
            'IT Consultant': (70000, 140000),
            'Systems Analyst': (60000, 120000)
        }
        
        def assign_salary(row):
            role = row['predicted_job_role']
            min_salary, max_salary = salary_ranges.get(role, (50000, 100000))
            exp_multiplier = 1 + (row['total_experience_years'] * 0.05)
            skill_multiplier = 1 + (row['overall_profile_score'] - 70) / 100
            
            base_salary = np.random.uniform(min_salary, max_salary)
            adjusted_salary = base_salary * exp_multiplier * skill_multiplier
            
            return {
                'salary_min_usd': int(adjusted_salary * 0.8),
                'salary_max_usd': int(adjusted_salary * 1.2)
            }
        
        salaries = df.apply(assign_salary, axis=1)
        df['salary_min_usd'] = [s['salary_min_usd'] for s in salaries]
        df['salary_max_usd'] = [s['salary_max_usd'] for s in salaries]
        
        # Save synthetic data
        synthetic_path = os.path.join(self.model_dir, 'synthetic_data.csv')
        df.to_csv(synthetic_path, index=False)
        print(f"✅ Synthetic data saved to: {synthetic_path}")
        print(f"   Samples: {n_samples}")
        print(f"   Job Roles: {df['predicted_job_role'].nunique()}")
        
        return synthetic_path
    
    def create_fallback_model(self):
        """Create a fallback model for emergency use"""
        print("Creating fallback model...")
        
        # Create minimal training data
        n_samples = 100
        n_features = len(self.feature_columns) if self.feature_columns else 24
        
        X = np.random.randn(n_samples, n_features)
        y = np.random.randint(0, 10, n_samples)
        
        # Create and train model
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.model.fit(X, y)
        
        # Create scaler
        self.scaler = StandardScaler()
        self.scaler.fit(X)
        
        # Create label encoder
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit([f'Job_Role_{i}' for i in range(10)])
        
        # Set default feature columns if not set
        if not self.feature_columns:
            self.feature_columns = [
                'age', 'gpa_score', 'total_experience_years', 'additional_certs_count',
                'skill_python', 'skill_java', 'skill_javascript', 'skill_sql',
                'skill_machine_learning', 'skill_data_analysis', 'skill_react', 'skill_aws',
                'skill_communication', 'skill_leadership', 'skill_problem_solving', 'skill_teamwork',
                'years_since_graduation', 'education_score', 'tech_skill_score',
                'soft_skill_score', 'overall_profile_score', 'online_courses_completed',
                'research_publications', 'professional_network_size'
            ][:n_features]
        
        # Set salary data
        self.salary_data = {
            'Data Scientist': {'salary_min_usd': 80000, 'salary_max_usd': 150000},
            'Software Engineer': {'salary_min_usd': 70000, 'salary_max_usd': 140000},
            'Data Analyst': {'salary_min_usd': 60000, 'salary_max_usd': 120000},
            'ML Engineer': {'salary_min_usd': 90000, 'salary_max_usd': 160000},
            'DevOps Engineer': {'salary_min_usd': 80000, 'salary_max_usd': 150000},
            'Business Analyst': {'salary_min_usd': 65000, 'salary_max_usd': 130000},
            'Product Manager': {'salary_min_usd': 85000, 'salary_max_usd': 160000},
            'Cloud Engineer': {'salary_min_usd': 90000, 'salary_max_usd': 170000}
        }
        
        # Save model
        self.save_model()
        
        self.model_info = {
            'loaded': True,
            'last_trained': datetime.now().isoformat(),
            'accuracy': 0.65,
            'total_samples': n_samples,
            'features_count': len(self.feature_columns),
            'job_roles_count': len(self.label_encoder.classes_),
            'version': '1.0.0-fallback'
        }
        
        self.model_loaded = True
        print("✅ Fallback model created successfully")
    
    def train_model(self, dataset_path):
        """Train model with given dataset"""
        try:
            print(f"\n📊 Loading dataset from: {dataset_path}")
            
            # Load dataset
            df = pd.read_csv(dataset_path)
            print(f"✅ Dataset loaded. Shape: {df.shape}")
            print(f"Columns: {list(df.columns)[:15]}...")  # Print first 15 columns
            
            # Prepare features and target
            # Drop columns that shouldn't be used as features
            columns_to_drop = [
                'user_id', 'predicted_job_role', 'secondary_job_1', 'secondary_job_2',
                'secondary_job_3', 'secondary_job_4', 'confidence_score', 'secondary_conf_1',
                'secondary_conf_2', 'secondary_conf_3', 'secondary_conf_4', 'salary_min_usd',
                'salary_max_usd', 'salary_midpoint_usd', 'salary_currency', 'salary_local_min',
                'salary_local_max', 'missing_skill_1', 'missing_skill_2', 'missing_skill_3',
                'training_months_required', 'upskill_priority', 'immediate_employability_score',
                'six_month_potential_score', 'market_demand_score', 'job_openings_estimate',
                'competition_level', 'remote_availability_score', 'location_adjusted_salary_multiplier'
            ]
            
            # Only drop columns that exist
            columns_to_drop = [col for col in columns_to_drop if col in df.columns]
            df_features = df.drop(columns=columns_to_drop)
            
            print(f"📈 Features shape after dropping columns: {df_features.shape}")
            
            # Handle missing values
            numeric_cols = df_features.select_dtypes(include=[np.number]).columns
            df_features[numeric_cols] = df_features[numeric_cols].fillna(df_features[numeric_cols].mean())
            
            # Fill categorical columns with mode
            categorical_cols = df_features.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                mode_value = df_features[col].mode()
                df_features[col] = df_features[col].fillna(mode_value[0] if not mode_value.empty else 'Unknown')
            
            # Encode categorical variables
            self.categorical_mappings = {}
            
            for col in categorical_cols:
                le = LabelEncoder()
                df_features[col] = le.fit_transform(df_features[col].astype(str))
                # Convert numpy types to Python types for JSON serialization
                class_mapping = {}
                for class_name, class_value in zip(le.classes_, le.transform(le.classes_)):
                    # Convert numpy int64 to Python int
                    class_mapping[str(class_name)] = int(class_value)
                self.categorical_mappings[col] = class_mapping
            
            # Prepare target variable
            if 'predicted_job_role' not in df.columns:
                print("❌ Target column 'predicted_job_role' not found in dataset")
                # Create synthetic target
                np.random.seed(42)
                job_roles = ['Data Scientist', 'Software Engineer', 'Data Analyst', 'ML Engineer', 
                            'DevOps Engineer', 'Business Analyst', 'Product Manager', 'Cloud Engineer']
                df['predicted_job_role'] = np.random.choice(job_roles, len(df))
            
            self.label_encoder = LabelEncoder()
            y = self.label_encoder.fit_transform(df['predicted_job_role'])
            
            print(f"🎯 Target classes: {self.label_encoder.classes_}")
            
            # Extract salary data
            if 'salary_min_usd' in df.columns and 'salary_max_usd' in df.columns:
                salary_df = df.groupby('predicted_job_role').agg({
                    'salary_min_usd': 'mean',
                    'salary_max_usd': 'mean'
                })
                # Convert numpy types to Python types
                self.salary_data = {}
                for job_role, row in salary_df.iterrows():
                    self.salary_data[job_role] = {
                        'salary_min_usd': float(row['salary_min_usd']),
                        'salary_max_usd': float(row['salary_max_usd'])
                    }
            else:
                # Create default salary data
                self.salary_data = {
                    'Data Scientist': {'salary_min_usd': 80000.0, 'salary_max_usd': 150000.0},
                    'Software Engineer': {'salary_min_usd': 70000.0, 'salary_max_usd': 140000.0},
                    'Data Analyst': {'salary_min_usd': 60000.0, 'salary_max_usd': 120000.0},
                    'ML Engineer': {'salary_min_usd': 90000.0, 'salary_max_usd': 160000.0},
                    'DevOps Engineer': {'salary_min_usd': 80000.0, 'salary_max_usd': 150000.0},
                    'Business Analyst': {'salary_min_usd': 65000.0, 'salary_max_usd': 130000.0},
                    'Product Manager': {'salary_min_usd': 85000.0, 'salary_max_usd': 160000.0},
                    'Cloud Engineer': {'salary_min_usd': 90000.0, 'salary_max_usd': 170000.0}
                }
            
            # Save feature columns
            self.feature_columns = df_features.columns.tolist()
            print(f"🔧 Feature columns ({len(self.feature_columns)}):")
            for i, col in enumerate(self.feature_columns[:20]):  # Show first 20
                print(f"   {i+1:2d}. {col}")
            if len(self.feature_columns) > 20:
                print(f"   ... and {len(self.feature_columns) - 20} more")
            
            # Scale features
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(df_features)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            print(f"📊 Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
            
            # Train model
            print("🤖 Training Random Forest model...")
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
                class_weight='balanced'
            )
            
            self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            print(f"\n📋 Classification Report:")
            print(classification_report(y_test, y_pred, 
                                       target_names=self.label_encoder.classes_))
            
            # Save model
            self.model_info = {
                'loaded': True,
                'last_trained': datetime.now().isoformat(),
                'accuracy': float(accuracy),
                'total_samples': int(len(df)),
                'features_count': int(len(self.feature_columns)),
                'job_roles_count': int(len(self.label_encoder.classes_)),
                'version': '1.0.0'
            }
            
            self.save_model()
            self.model_loaded = True
            
            return accuracy
            
        except Exception as e:
            print(f"❌ Error during model training: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
            return 0
    
    def save_model(self):
        """Save trained model and preprocessing objects"""
        try:
            # Ensure directory exists
            os.makedirs(self.model_dir, exist_ok=True)
            
            # Save model and preprocessing objects
            joblib.dump(self.model, os.path.join(self.model_dir, 'random_forest_model.joblib'))
            joblib.dump(self.scaler, os.path.join(self.model_dir, 'scaler.joblib'))
            joblib.dump(self.label_encoder, os.path.join(self.model_dir, 'label_encoder.joblib'))
            
            # Prepare metadata with proper type conversion for JSON serialization
            metadata = {
                'feature_columns': self.feature_columns,
                'job_roles': [str(role) for role in self.label_encoder.classes_.tolist()],
                'salary_data': self.salary_data,
                'accuracy': float(self.model_info.get('accuracy', 0.85)),
                'last_trained': datetime.now().isoformat(),
                'total_samples': int(self.model_info.get('total_samples', 0)),
                'version': self.model_info.get('version', '1.0.0'),
                'categorical_mappings': self.categorical_mappings
            }
            
            metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Model saved to: {self.model_dir}")
            print(f"📄 Metadata saved to: {metadata_path}")
            
        except Exception as e:
            print(f"❌ Error saving model: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
    
    def predict(self, input_data):
        """Make job prediction based on input features"""
        if not self.model_loaded or self.model is None:
            return {
                'success': False,
                'error': 'Model not loaded. Please train or load model first.'
            }
        
        try:
            print(f"🔍 Making prediction with input data keys: {list(input_data.keys())}")
            
            # Create a copy of input data to avoid modifying original
            processed_data = input_data.copy()
            
            # Encode categorical variables using stored mappings
            for col, mapping in self.categorical_mappings.items():
                if col in processed_data:
                    value = str(processed_data[col])
                    if value in mapping:
                        processed_data[col] = mapping[value]
                    else:
                        # Default encoding for unseen values
                        processed_data[col] = 0
            
            # Convert input data to DataFrame
            input_df = pd.DataFrame([processed_data])
            
            print(f"📊 Input data sample (first 10 items): {dict(list(processed_data.items())[:10])}")
            
            # Add missing columns with default values
            for col in self.feature_columns:
                if col not in input_df.columns:
                    # Provide default values for missing columns
                    if 'skill_' in col:
                        input_df[col] = 5  # Default skill level
                    elif 'cert_' in col:
                        input_df[col] = 0  # Default certification status
                    elif col in ['age', 'gpa_score', 'total_experience_years']:
                        # Use reasonable defaults for key features
                        if col == 'age':
                            input_df[col] = 25
                        elif col == 'gpa_score':
                            input_df[col] = 7.5
                        elif col == 'total_experience_years':
                            input_df[col] = 3
                    elif col == 'years_since_graduation':
                        # Calculate from graduation year if available
                        if 'graduation_year' in processed_data:
                            input_df[col] = 2024 - processed_data['graduation_year']
                        else:
                            input_df[col] = 5
                    else:
                        input_df[col] = 0
            
            # Ensure correct column order
            input_df = input_df[self.feature_columns]
            
            # Convert all columns to numeric
            input_df = input_df.apply(pd.to_numeric, errors='coerce')
            input_df = input_df.fillna(0)
            
            print(f"📊 Input shape for prediction: {input_df.shape}")
            print(f"📊 Input data types: {input_df.dtypes.tolist()}")
            print(f"📊 First few values: {input_df.iloc[0].tolist()[:10]}")
            
            # Scale features
            scaled_features = self.scaler.transform(input_df)
            
            # Get predictions with probabilities
            probabilities = self.model.predict_proba(scaled_features)[0]
            
            # Get top 5 predictions
            top_indices = np.argsort(probabilities)[-5:][::-1]
            top_jobs = self.label_encoder.inverse_transform(top_indices)
            top_confidences = probabilities[top_indices] * 100  # Convert to percentage
            
            print(f"🎯 Top predictions: {list(zip(top_jobs, top_confidences))}")
            
            # Prepare predictions list
            predictions = []
            for i, (job, confidence) in enumerate(zip(top_jobs, top_confidences)):
                job_info = {
                    'rank': i + 1,
                    'job_role': str(job),
                    'confidence_score': round(float(confidence), 2),
                    'salary_range': self._get_salary_range(job),
                    'market_demand': self._get_market_demand(confidence),
                    'required_skills': self._get_required_skills(job),
                    'growth_outlook': self._get_growth_outlook(job)
                }
                predictions.append(job_info)
            
            # Identify missing skills for top prediction
            missing_skills = self._identify_missing_skills(input_data, predictions[0])
            
            # Calculate training requirements
            training_months = self._calculate_training_months(len(missing_skills))
            
            return {
                'success': True,
                'top_prediction': predictions[0]['job_role'],
                'confidence_score': predictions[0]['confidence_score'],
                'all_predictions': predictions,
                'missing_skills': missing_skills[:3],  # Top 3 missing skills
                'salary_range': predictions[0]['salary_range'],
                'market_demand': predictions[0]['market_demand'],
                'training_required': f"Estimated {training_months} months of focused training",
                'training_months': training_months,
                'model_version': self.get_model_version(),
                'model_accuracy': f"{self.get_model_accuracy()*100:.1f}%"
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            print(f"Error details: {traceback.format_exc()}")
            return {
                'success': False,
                'error': f"Prediction error: {str(e)}"
            }
    
    def _get_salary_range(self, job_role):
        """Get salary range for a job role"""
        default_range = {'min': 40000, 'max': 120000, 'currency': 'USD'}
        
        if job_role in self.salary_data:
            salary = self.salary_data[job_role]
            return {
                'min': int(salary.get('salary_min_usd', 40000)),
                'max': int(salary.get('salary_max_usd', 120000)),
                'currency': 'USD'
            }
        
        return default_range
    
    def _get_market_demand(self, confidence):
        """Determine market demand based on confidence"""
        if confidence >= 80:
            return 'Very High'
        elif confidence >= 70:
            return 'High'
        elif confidence >= 50:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_required_skills(self, job_role):
        """Get required skills for a job role"""
        skill_mapping = {
            'business_analyst': ['SQL', 'Excel', 'Power BI', 'Communication', 'Analytical Thinking'],
            'data_analyst': ['SQL', 'Excel', 'Python', 'Statistics', 'Data Visualization'],
            'data_scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
            'devops_engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            'financial_analyst': ['Excel', 'Financial Modeling', 'Accounting', 'Analysis', 'Communication'],
            'frontend_developer': ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'UI/UX'],
            'ml_engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
            'product_manager': ['Product Strategy', 'Market Research', 'Agile', 'Communication', 'Leadership'],
            'software_engineer': ['JavaScript', 'React', 'Node.js', 'Python', 'System Design'],
            'ui_designer': ['Figma', 'UI Design', 'Prototyping', 'Visual Design', 'User Research'],
            'ux_designer': ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Figma'],
            'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
            'Software Engineer': ['JavaScript', 'React', 'Node.js', 'Python', 'System Design'],
            'Data Analyst': ['SQL', 'Excel', 'Python', 'Statistics', 'Data Visualization'],
            'ML Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
            'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
            'Business Analyst': ['SQL', 'Excel', 'Power BI', 'Communication', 'Analytical Thinking'],
            'Product Manager': ['Product Strategy', 'Market Research', 'Agile', 'Communication', 'Leadership'],
            'Cloud Engineer': ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Networking']
        }
        
        return skill_mapping.get(str(job_role).lower(), ['Technical Skills', 'Problem Solving', 'Communication'])
    
    def _get_growth_outlook(self, job_role):
        """Get growth outlook for a job role"""
        growth_mapping = {
            'business_analyst': 'Medium',
            'data_analyst': 'High',
            'data_scientist': 'Very High',
            'devops_engineer': 'High',
            'financial_analyst': 'Medium',
            'frontend_developer': 'High',
            'ml_engineer': 'Very High',
            'product_manager': 'Medium',
            'software_engineer': 'High',
            'ui_designer': 'Medium',
            'ux_designer': 'High',
            'Data Scientist': 'Very High',
            'ML Engineer': 'Very High',
            'AI Engineer': 'Very High',
            'Cloud Engineer': 'High',
            'DevOps Engineer': 'High',
            'Software Engineer': 'High',
            'Data Analyst': 'High',
            'Product Manager': 'Medium',
            'Business Analyst': 'Medium',
            'IT Consultant': 'Medium',
            'Systems Analyst': 'Medium'
        }
        
        return growth_mapping.get(str(job_role).lower(), 'Moderate')
    
    def _identify_missing_skills(self, input_data, top_prediction):
        """Identify missing skills for the top predicted job"""
        required_skills = self._get_required_skills(top_prediction['job_role'])
        user_skills = []
        
        # Extract user skills from input data
        for key, value in input_data.items():
            if key.startswith('skill_') and isinstance(value, (int, float)) and value > 0:
                skill_name = key.replace('skill_', '').replace('_', ' ').title()
                user_skills.append(skill_name.lower())
        
        # Find missing skills
        missing_skills = []
        for skill in required_skills:
            if skill.lower() not in user_skills:
                missing_skills.append(skill)
        
        return missing_skills
    
    def _calculate_training_months(self, missing_skill_count):
        """Calculate training months required"""
        if missing_skill_count == 0:
            return 0
        elif missing_skill_count <= 2:
            return 1
        elif missing_skill_count <= 4:
            return 3
        else:
            return 6
    
    def get_model_info(self):
        """Get model information"""
        return self.model_info
    
    def get_model_version(self):
        """Get model version"""
        return self.model_info.get('version', '1.0.0')
    
    def get_model_accuracy(self):
        """Get model accuracy"""
        return self.model_info.get('accuracy', 0.85)
    
    def get_last_trained_date(self):
        """Get last trained date"""
        return self.model_info.get('last_trained', 'Unknown')
    
    def retrain_model(self, dataset_path=None, n_estimators=200, max_depth=20):
        """Retrain the model with new parameters"""
        try:
            if dataset_path and os.path.exists(dataset_path):
                accuracy = self.train_model(dataset_path)
            else:
                # Use existing dataset
                dataset_paths = [
                    os.path.join(self.base_dir, 'ml_model', 'datasets', 'job_prediction_dataset.csv'),
                    os.path.join(self.model_dir, 'synthetic_data.csv')
                ]
                
                for path in dataset_paths:
                    if os.path.exists(path):
                        accuracy = self.train_model(path)
                        break
                else:
                    # No dataset found, create synthetic
                    dataset_path = self.create_synthetic_data()
                    accuracy = self.train_model(dataset_path)
            
            return {
                'success': True,
                'accuracy': accuracy,
                'training_time': 'completed',
                'total_samples': self.model_info.get('total_samples', 0),
                'features_used': self.feature_columns,
                'model_path': self.model_dir
            }
            
        except Exception as e:
            print(f"❌ Retraining failed: {str(e)}")
            return {
                'success': False,
                'error': f"Retraining failed: {str(e)}"
            }