# meetups/admin.py
from django.contrib import admin
from .models import Meetup, Attendance

@admin.register(Meetup)
class MeetupAdmin(admin.ModelAdmin):
    list_display = ('title', 'meetup_date', 'location') # 목록에서 보여줄 컬럼들

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'meetup', 'status', 'updated_at')