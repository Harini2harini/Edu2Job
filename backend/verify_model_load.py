
import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu2job_backend.settings')
django.setup()

from predictions.ml_service import JobPredictionService

def test_load():
    print("Testing JobPredictionService initialization...")
    try:
        service = JobPredictionService()
        if service.model_loaded:
            print("SUCCESS: Model loaded successfully.")
            print(f"Model Info: {service.get_model_info()}")
        else:
            print("FAILURE: Model failed to load.")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_load()
