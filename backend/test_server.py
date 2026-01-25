import os
import sys
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu2job_backend.settings')

try:
    django.setup()
    print("✅ Django setup successful!")
    
    # Try to import your apps
    from django.apps import apps
    for app in ['users', 'profiles', 'predictions', 'admin_panel']:
        try:
            apps.get_app_config(app)
            print(f"✅ App '{app}' found")
        except:
            print(f"❌ App '{app}' NOT FOUND")
            
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    import traceback
    traceback.print_exc()
