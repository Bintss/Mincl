# backend/meetups/views.py
from rest_framework import viewsets
from .models import Meetup, Attendance
from .serializers import MeetupSerializer, AttendanceSerializer

class MeetupViewSet(viewsets.ModelViewSet):
    queryset = Meetup.objects.all().order_by('-meetup_date')
    serializer_class = MeetupSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all()
        meetup_id = self.request.query_params.get('meetup', None)
        if meetup_id is not None:
            queryset = queryset.filter(meetup_id=meetup_id)
        return queryset
