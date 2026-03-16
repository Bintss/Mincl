# backend/meetups/serializers.py
from rest_framework import serializers
from .models import Meetup, Attendance

class MeetupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meetup
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    # 👇 1. 유저 모델(User)에 있는 nickname 값을 꺼내서 'user_nickname'이라는 이름표를 붙여줍니다!
    user_nickname = serializers.ReadOnlyField(source='user.nickname')
    user_grade = serializers.ReadOnlyField(source='user.grade')
    inviter_nickname = serializers.ReadOnlyField(source='inviter.nickname')

    class Meta:
        model = Attendance
        fields = [
            'id', 'user', 'user_nickname', 'user_grade', 'meetup', 'status', 
            'is_guest', 'guest_name', 'guest_gender', 'guest_grade',
            'inviter', 'inviter_nickname'
        ]