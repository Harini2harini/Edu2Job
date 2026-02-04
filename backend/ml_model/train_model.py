import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings

warnings.filterwarnings('ignore')

# Custom JSON encoder to handle numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
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
        
        # Define base paths
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.dataset_path = os.path.join(self.base_dir, 'ml_model', 'datasets', 'job_prediction_dataset.csv')
        self.model_save_path = os.path.join(self.base_dir, 'ml_model', 'saved_model')

    def load_and_preprocess_data(self, filepath=None):
        """Load and preprocess the dataset"""
        if filepath is None:
            filepath = self.dataset_path
            
        print(f"Loading dataset from: {filepath}")
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset not found at {filepath}")
            
        df = pd.read_csv(filepath)
        print(f"Dataset loaded. Shape: {df.shape}")
        
        # Columns to drop (non-features or derived target info)
        columns_to_drop = [
            'user_id', 'secondary_job_1', 'secondary_job_2', 
            'secondary_job_3', 'secondary_job_4', 'confidence_score', 'secondary_conf_1',
            'secondary_conf_2', 'secondary_conf_3', 'secondary_conf_4', 'salary_min_usd',
            'salary_max_usd', 'salary_midpoint_usd', 'salary_currency', 'salary_local_min',
            'salary_local_max', 'missing_skill_1', 'missing_skill_2', 'missing_skill_3',
            'training_months_required', 'upskill_priority', 'immediate_employability_score',
            'six_month_potential_score', 'market_demand_score', 'job_openings_estimate',
            'competition_level', 'remote_availability_score', 'location_adjusted_salary_multiplier'
        ]
        
        # Only drop columns that exist
        current_drop_cols = [col for col in columns_to_drop if col in df.columns]
        df_features = df.drop(columns=current_drop_cols)
        
        # Extract salary data before dropping simple target columns if needed
        # (Assuming salary is derived or we just want average per role)
        if 'salary_min_usd' in df.columns:
            self.salary_data = df.groupby('predicted_job_role').agg({
                'salary_min_usd': 'mean',
                'salary_max_usd': 'mean'
            }).to_dict('index')
        else:
             self.salary_data = {}

        # Handle missing values
        # Numeric
        numeric_cols = df_features.select_dtypes(include=[np.number]).columns
        df_features[numeric_cols] = df_features[numeric_cols].fillna(df_features[numeric_cols].mean())
        
        # Categorical
        categorical_cols = df_features.select_dtypes(include=['object']).columns
        # Exclude target variable from feature processing
        if 'predicted_job_role' in categorical_cols:
            categorical_cols = categorical_cols.drop('predicted_job_role')

        for col in categorical_cols:
            if df_features[col].isnull().any():
                df_features[col] = df_features[col].fillna(df_features[col].mode()[0])
        
        # Encode categorical features
        for col in categorical_cols:
            le = LabelEncoder()
            df_features[col] = df_features[col].astype(str)
            df_features[col] = le.fit_transform(df_features[col])
            
            # Save mapping
            self.categorical_mappings[col] = {
                'classes': [str(cls) for cls in le.classes_],
                'mapping': {str(cls): int(idx) for idx, cls in enumerate(le.classes_)}
            }
            
        print(f"Preprocessing complete. Features: {len(df_features.columns) - 1}") # -1 for target
        
        # Prepare X and y
        X_df = df_features.drop(columns=['predicted_job_role'])
        self.feature_columns = X_df.columns.tolist()
        X = self.scaler.fit_transform(X_df)
        
        # Encode target
        y_raw = df_features['predicted_job_role']
        self.job_roles = sorted(y_raw.unique())
        self.label_encoder.fit(self.job_roles)
        y = self.label_encoder.transform(y_raw)
        
        return X, y

    def train_model(self, X, y):
        """Train Random Forest model with hyperparameter tuning"""
        print("Training Random Forest model...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")
        
        # Hyperparameter Grid - Optimized for higher accuracy
        # Note: If dataset is large, reduce grid size
        param_grid = {
            'n_estimators': [20, 50],
            'max_depth': [20, None],
            'min_samples_split': [2, 5],
            'min_samples_leaf': [1, 2],
            'bootstrap': [True],
            'class_weight': ['balanced', None] 
        }
        
        rf = RandomForestClassifier(random_state=42, n_jobs=-1)
        
        print("Starting Grid Search...")
        grid_search = GridSearchCV(
            estimator=rf,
            param_grid=param_grid,
            cv=3,
            n_jobs=-1,
            verbose=1,
            scoring='accuracy'
        )
        
        grid_search.fit(X_train, y_train)
        
        print(f"Best parameters: {grid_search.best_params_}")
        self.model = grid_search.best_estimator_
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\nModel Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=self.label_encoder.classes_))
        
        return accuracy

    def save_model(self):
        """Save trained model and all metadata"""
        os.makedirs(self.model_save_path, exist_ok=True)
        
        try:
            # Save artifacts
            joblib.dump(self.model, os.path.join(self.model_save_path, 'random_forest_model.joblib'))
            joblib.dump(self.scaler, os.path.join(self.model_save_path, 'scaler.joblib'))
            joblib.dump(self.label_encoder, os.path.join(self.model_save_path, 'label_encoder.joblib'))
            
            # Save metadata
            metadata = {
                'feature_columns': self.feature_columns,
                'job_roles': self.job_roles,
                'categorical_mappings': self.categorical_mappings,
                'model_accuracy': float(getattr(self, 'model_accuracy', 0.0)),
                'salary_data': self.salary_data
            }
            
            with open(os.path.join(self.model_save_path, 'model_metadata.json'), 'w') as f:
                json.dump(metadata, f, cls=NumpyEncoder, indent=2)
                
            print(f"✅ Model saved to {self.model_save_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False

def main():
    predictor = JobPredictor()
    try:
        X, y = predictor.load_and_preprocess_data()
        accuracy = predictor.train_model(X, y)
        predictor.model_accuracy = accuracy
        
        if accuracy >= 0.92:
            print(f"SUCCESS: Accuracy {accuracy:.2%} meets the >92% threshold.")
        else:
            print(f"WARNING: Accuracy {accuracy:.2%} is below the 92% threshold. Consider more tuning or data.")
            
        predictor.save_model()
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
