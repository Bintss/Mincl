# backend/accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('kakao/login/', views.kakao_login, name='kakao_login'),
    path('user/<int:user_id>/', views.user_profile, name='user-profile'),
    path('users/', views.user_list, name='user-list'),
]