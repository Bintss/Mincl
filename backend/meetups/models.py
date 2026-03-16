# backend/meetups/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Meetup(models.Model):
    TYPE_CHOICES = [
        ('REGULAR', '정기운동'),
        ('LIGHTNING', '번개운동'),
    ]
    meetup_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='REGULAR')
    title = models.CharField(max_length=200)
    meetup_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    max_capacity = models.IntegerField(null=True, blank=True) # 최대 정원 (제한 없으면 빈칸)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_meetup_type_display()} - {self.title} ({self.meetup_date.strftime('%m/%d')})"

    # 🪄 대기자를 승급시키는 마법의 함수
    def promote_waitlist(self):
        if not self.max_capacity:
            return
        
        # 현재 참석자 수 계산
        current_attending = Attendance.objects.filter(meetup=self, status='Attending').count()
        
        # 빈자리가 났다면?
        if current_attending < self.max_capacity:
            # 가장 먼저 대기한 사람(id가 가장 작은 사람) 찾기
            first_waitlisted = Attendance.objects.filter(meetup=self, status='Waitlisted').order_by('id').first()
            if first_waitlisted:
                # 상태를 '참석'으로 확정 짓고 저장!
                first_waitlisted.status = 'Attending'
                first_waitlisted.save()

    # 👇 새로 추가된 마법: 모임이 생성될 때 레슨자 자동 참석 처리
    def save(self, *args, **kwargs):
        is_new = self.pk is None # 새로 생성되는 모임인지 확인
        
        # 일단 DB에 모임을 저장해서 ID(pk)를 발급받습니다.
        super().save(*args, **kwargs)

        # 새 모임이고, 정기운동일 경우에만!
        if is_new and self.meetup_type == 'REGULAR':
            # 전체 유저 중에서 '레슨자(is_taking_lessons=True)'인 사람만 불러옵니다.
            lesson_users = User.objects.filter(is_taking_lessons=True)
            
            for user in lesson_users:
                # 레슨자들을 '참석' 상태로 하나씩 투표 자동 생성!
                # (Attendance 모델의 save가 호출되면서 정원 검사도 알아서 진행됩니다)
                Attendance.objects.create(
                    user=user, 
                    meetup=self, 
                    status='Attending'
                )

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Attending', '참석'),
        ('Waitlisted', '대기'),
        ('Absent', '불참'),
    ]

    # 👇 1. 게스트는 가입된 회원이 아니므로 user를 비워둘 수 있게(null=True) 변경합니다.
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    meetup = models.ForeignKey(Meetup, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # 👇 2. 게스트 전용 필드들 추가
    is_guest = models.BooleanField(default=False)
    guest_name = models.CharField(max_length=50, null=True, blank=True)
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invited_guests', null=True, blank=True)
    guest_gender = models.CharField(max_length=10, null=True, blank=True) # 'Male' or 'Female'
    guest_grade = models.CharField(max_length=10, null=True, blank=True)  # 'S', 'A', 'B' ...

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        name = self.guest_name if self.is_guest else (self.user.nickname if self.user else "알 수 없음")
        return f"[{self.meetup.title}] {name} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None

        if not is_new:
            old_status = Attendance.objects.get(pk=self.pk).status

        # '참석'을 희망하는 경우 얄짤없이 정원 검사 (회원이든 게스트든 동일하게 적용!)
        if self.status == 'Attending' and self.meetup.max_capacity:
            attending_query = Attendance.objects.filter(meetup=self.meetup, status='Attending')
            if not is_new:
                attending_query = attending_query.exclude(pk=self.pk)
            
            if attending_query.count() >= self.meetup.max_capacity:
                self.status = 'Waitlisted'

        super().save(*args, **kwargs)

        if not is_new and old_status == 'Attending' and self.status != 'Attending':
            self.meetup.promote_waitlist()

    def delete(self, *args, **kwargs):
        old_status = self.status
        meetup = self.meetup
        super().delete(*args, **kwargs)
        if old_status == 'Attending':
            meetup.promote_waitlist()