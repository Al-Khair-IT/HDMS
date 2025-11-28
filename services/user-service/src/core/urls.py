"""
URL configuration for User Service.
"""
from django.contrib import admin
from django.urls import path
from .routers import api
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for Docker health checks."""
    return JsonResponse({"status": "healthy", "service": "user-service"})
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
    path('health/', health_check, name='health'),

]

