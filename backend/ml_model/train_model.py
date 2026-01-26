import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')
import os

# Custom JSON encoder to handle numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, pd.Series):
            return obj.tolist()
        elif isinstance(obj, pd.DataFrame):
            return obj.to_dict()
        elif hasattr(obj, 'tolist'):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

class JobPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = None
        self.job_roles = None
        self.salary_data = None
        self.categorical_mappings = {}
        
    def load_and_preprocess_data(self, filepath='backend/ml_model/datasets/job_prediction_dataset.csv'):
        """Load and preprocess the dataset"""
        print("Loading dataset from:", filepath)
        df = pd.read_csv(filepath)
        
        print(f"Dataset loaded. Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Drop user_id and other non-feature columns
        columns_to_drop = ['user_id', 'predicted_job_role', 'secondary_job_1', 'secondary_job_2', 
                          'secondary_job_3', 'secondary_job_4', 'confidence_score', 'secondary_conf_1',
                          'secondary_conf_2', 'secondary_conf_3', 'secondary_conf_4', 'salary_min_usd',
                          'salary_max_usd', 'salary_midpoint_usd', 'salary_currency', 'salary_local_min',
                          'salary_local_max', 'missing_skill_1', 'missing_skill_2', 'missing_skill_3',
                          'training_months_required', 'upskill_priority', 'immediate_employability_score',
                          'six_month_potential_score', 'market_demand_score', 'job_openings_estimate',
                          'competition_level', 'remote_availability_score', 'location_adjusted_salary_multiplier']
        
        # Only drop columns that exist
        columns_to_drop = [col for col in columns_to_drop if col in df.columns]
        print(f"Dropping columns: {columns_to_drop}")
        
        df_features = df.drop(columns=columns_to_drop)
        
        # Handle missing values
        numeric_cols = df_features.select_dtypes(include=[np.number]).columns
        df_features[numeric_cols] = df_features[numeric_cols].fillna(df_features[numeric_cols].mean())
        
        # Fill non-numeric columns with mode or empty string
        categorical_cols = df_features.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if df_features[col].isnull().any():
                df_features[col] = df_features[col].fillna(df_features[col].mode()[0] if not df_features[col].mode().empty else '')
        
        # Save salary data for predictions
        if 'salary_min_usd' in df.columns and 'salary_max_usd' in df.columns:
            self.salary_data = df.groupby('predicted_job_role').agg({
                'salary_min_usd': 'mean',
                'salary_max_usd': 'mean'
            }).to_dict('index')
        else:
            # Create default salary data
            self.salary_data = {}
        
        # Encode categorical variables
        categorical_cols = df_features.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            le = LabelEncoder()
            # Convert to string and handle NaN
            df_features[col] = df_features[col].astype(str)
            df_features[col] = le.fit_transform(df_features[col])
            
            # Save mapping
            self.categorical_mappings[col] = {
                'classes': [str(cls) for cls in le.classes_],
                'mapping': {str(cls): int(idx) for idx, cls in enumerate(le.classes_)}
            }
        
        print(f"Preprocessing complete. Features: {len(df_features.columns)}, Samples: {len(df_features)}")
        
        # Encode target variable
        self.job_roles = df['predicted_job_role'].unique()
        self.label_encoder.fit(self.job_roles)
        y = self.label_encoder.transform(df['predicted_job_role'])
        
        # Save feature columns
        self.feature_columns = df_features.columns.tolist()
        
        # Scale features
        X = self.scaler.fit_transform(df_features)
        
        return X, y, df_features
    
    def train_model(self, X, y):
        """Train Random Forest model"""
        print("Training Random Forest model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
        
        # Initialize and train model
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
        
        print(f"\nModel Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, 
                                   target_names=self.label_encoder.classes_))
        
        # Print feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        })
        feature_importance = feature_importance.sort_values('importance', ascending=False)
        
        print("\nTop 10 Important Features:")
        print(feature_importance.head(10))
        
        return accuracy
    
    def predict_jobs(self, input_features):
        """Predict job roles for given features"""
        if self.model is None:
            raise ValueError("Model not trained. Please train model first.")
        
        try:
            # Convert input to DataFrame
            input_df = pd.DataFrame([input_features])
            
            # Ensure all required features are present
            for col in self.feature_columns:
                if col not in input_df.columns:
                    # Set default value based on column type
                    if 'skill_' in col:
                        input_df[col] = 0.0  # Default skill level
                    elif 'cert_' in col:
                        input_df[col] = 0  # Default certification (no)
                    elif col in ['age', 'total_experience_years', 'gpa_score']:
                        # Set reasonable defaults for key features
                        if col == 'age':
                            input_df[col] = 25
                        elif col == 'total_experience_years':
                            input_df[col] = 3
                        elif col == 'gpa_score':
                            input_df[col] = 7.5
                    else:
                        input_df[col] = 0  # Default for other features
            
            # Encode categorical features if present in input
            for col in self.categorical_mappings:
                if col in input_df.columns:
                    mapping = self.categorical_mappings[col]['mapping']
                    # Convert input value to string and map
                    input_value = str(input_df[col].iloc[0])
                    if input_value in mapping:
                        input_df[col] = mapping[input_value]
                    else:
                        # Use default mapping (first category)
                        input_df[col] = list(mapping.values())[0]
            
            # Reorder columns to match training
            input_df = input_df[self.feature_columns]
            
            # Scale features
            scaled_features = self.scaler.transform(input_df)
            
            # Get predictions with probabilities
            probabilities = self.model.predict_proba(scaled_features)[0]
            
            # Get top 5 predictions
            top_indices = np.argsort(probabilities)[-5:][::-1]
            top_jobs = self.label_encoder.inverse_transform(top_indices)
            top_confidences = probabilities[top_indices] * 100  # Convert to percentage
            
            results = {
                'top_predictions': [],
                'model_accuracy': getattr(self, 'model_accuracy', 0.9790),
                'total_features': len(self.feature_columns)
            }
            
            for i, (job, confidence) in enumerate(zip(top_jobs, top_confidences)):
                # Get salary data if available
                if job in self.salary_data:
                    salary_info = self.salary_data[job]
                    salary_min = float(salary_info.get('salary_min_usd', 40000))
                    salary_max = float(salary_info.get('salary_max_usd', 120000))
                else:
                    # Default salary ranges based on job type
                    if 'data' in job.lower() or 'analyst' in job.lower():
                        salary_min, salary_max = 60000, 120000
                    elif 'engineer' in job.lower() or 'developer' in job.lower():
                        salary_min, salary_max = 70000, 150000
                    elif 'manager' in job.lower():
                        salary_min, salary_max = 80000, 160000
                    else:
                        salary_min, salary_max = 50000, 100000
                
                job_data = {
                    'rank': i + 1,
                    'job_role': str(job),
                    'confidence_score': float(confidence),
                    'salary_range': {
                        'min': round(salary_min),
                        'max': round(salary_max),
                        'currency': 'USD'
                    },
                    'market_demand': 'High' if confidence > 80 else 'Medium' if confidence > 60 else 'Low'
                }
                results['top_predictions'].append(job_data)
            
            return results
            
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            raise
    
    def save_model(self, path='backend/ml_model/saved_model/'):
        """Save trained model and preprocessing objects"""
        os.makedirs(path, exist_ok=True)
        
        try:
            # Save model and preprocessing objects
            joblib.dump(self.model, os.path.join(path, 'random_forest_model.joblib'))
            joblib.dump(self.scaler, os.path.join(path, 'scaler.joblib'))
            joblib.dump(self.label_encoder, os.path.join(path, 'label_encoder.joblib'))
            
            # Prepare metadata with serializable types
            metadata = {
                'feature_columns': [str(col) for col in self.feature_columns],
                'job_roles': [str(role) for role in self.job_roles],
                'categorical_mappings': self.categorical_mappings,
                'model_accuracy': float(getattr(self, 'model_accuracy', 0.9790)),
                'total_samples': int(getattr(self, 'total_samples', 30000)),
                'salary_data': {str(k): {str(kk): float(vv) for kk, vv in v.items()} 
                              for k, v in self.salary_data.items()} if self.salary_data else {}
            }
            
            # Convert numpy arrays to lists
            for key, value in metadata.items():
                if isinstance(value, np.ndarray):
                    metadata[key] = value.tolist()
                elif isinstance(value, pd.Series):
                    metadata[key] = value.tolist()
                elif isinstance(value, pd.DataFrame):
                    metadata[key] = value.to_dict()
            
            # Save metadata with custom encoder
            with open(os.path.join(path, 'model_metadata.json'), 'w') as f:
                json.dump(metadata, f, cls=NumpyEncoder, indent=2)
            
            print(f"✅ Model saved successfully to {path}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving model: {str(e)}")
            return False
    
    def load_model(self, path='backend/ml_model/saved_model/'):
        """Load trained model and preprocessing objects"""
        try:
            model_path = os.path.join(path, 'random_forest_model.joblib')
            scaler_path = os.path.join(path, 'scaler.joblib')
            encoder_path = os.path.join(path, 'label_encoder.joblib')
            metadata_path = os.path.join(path, 'model_metadata.json')
            
            print(f"Looking for model files at: {path}")
            print(f"Model path exists: {os.path.exists(model_path)}")
            print(f"Scaler path exists: {os.path.exists(scaler_path)}")
            print(f"Encoder path exists: {os.path.exists(encoder_path)}")
            print(f"Metadata path exists: {os.path.exists(metadata_path)}")
            
            if not all(os.path.exists(p) for p in [model_path, scaler_path, encoder_path, metadata_path]):
                print("❌ Model files not found. Training new model...")
                return False
            
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.label_encoder = joblib.load(encoder_path)
            
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            self.feature_columns = metadata['feature_columns']
            self.job_roles = np.array(metadata['job_roles'])
            self.salary_data = metadata.get('salary_data', {})
            self.categorical_mappings = metadata.get('categorical_mappings', {})
            self.model_accuracy = metadata.get('model_accuracy', 0.9790)
            
            print("✅ Model loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False
    
    def retrain_model(self, new_data_path=None):
        """Retrain model with new data"""
        try:
            if new_data_path and os.path.exists(new_data_path):
                X, y, _ = self.load_and_preprocess_data(new_data_path)
            else:
                X, y, _ = self.load_and_preprocess_data()
            
            accuracy = self.train_model(X, y)
            self.model_accuracy = accuracy
            self.total_samples = len(X)
            
            if self.save_model():
                return {
                    'success': True,
                    'accuracy': accuracy,
                    'total_samples': len(X)
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to save model'
                }
                
        except Exception as e:
            print(f"❌ Model training failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

def train_initial_model():
    """Initial model training function"""
    print("=" * 60)
    print("JOB PREDICTION MODEL TRAINING")
    print("=" * 60)
    
    try:
        predictor = JobPredictor()
        X, y, _ = predictor.load_and_preprocess_data()
        accuracy = predictor.train_model(X, y)
        predictor.model_accuracy = accuracy
        predictor.total_samples = len(X)
        
        if predictor.save_model():
            print("\n✅ Model training completed successfully!")
            print(f"📊 Accuracy: {accuracy:.2%}")
            print(f"📈 Total samples: {len(X)}")
            print(f"🔧 Features used: {len(predictor.feature_columns)}")
            print(f"🎯 Job roles: {len(predictor.job_roles)}")
            return predictor, accuracy
        else:
            print("\n❌ Model training failed during save")
            return None, 0
            
    except Exception as e:
        print(f"\n❌ ERROR during model training: {str(e)}")
        return None, 0

if __name__ == "__main__":
    predictor, accuracy = train_initial_model()
    if predictor:
        print(f"\n🎉 Model ready with accuracy: {accuracy:.2%}")
    else:
        print("\n❌ Failed to create model")