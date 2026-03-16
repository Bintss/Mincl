# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('meetups.urls')),
    path('api/accounts/', include('accounts.urls')),
]