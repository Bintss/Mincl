from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeetupViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'meetups', MeetupViewSet)
router.register(r'attendances', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]