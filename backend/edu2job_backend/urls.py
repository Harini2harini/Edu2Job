

# edu2job_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

urlpatterns = [
     path('', lambda request: JsonResponse({'status': 'ok', 'service': 'Edu2Job Backend'})),
    path('admin/', admin.site.urls),
    # API URLs path('api/auth/', include('users.urls')),path('api/profile/', include('profiles.urls')),path('api/admin/', include('admin_panel.urls')),path('api/predictions/', include('predictions.urls')),
    # Health check
     path('health/', lambda request: JsonResponse({'status': 'healthy'})),
    path('api/test/', lambda request: JsonResponse({'status': 'healthy', 'message': 'Edu2Job API is running'})),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
