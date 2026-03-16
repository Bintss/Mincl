# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    # 일반 유저 생성 로직 (카카오 로그인 시 사용)
    def create_user(self, kakao_id, nickname, **extra_fields):
        if not kakao_id:
            raise ValueError('카카오 ID는 필수입니다.')
        user = self.model(kakao_id=kakao_id, nickname=nickname, **extra_fields)
        user.set_unusable_password() # 비밀번호를 사용하지 않음
        user.save(using=self._db)
        return user

    # 관리자(Superuser) 생성 로직
    def create_superuser(self, kakao_id, nickname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        user = self.model(kakao_id=kakao_id, nickname=nickname, **extra_fields)
        user.set_password(password) # 관리자는 예외적으로 비밀번호 사용
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('DEVELOPER', '개발자'),
        ('PRESIDENT', '모임장'),
        ('ADMIN', '운영진'),
        ('MEMBER', '일반회원'),
    ]

    GRADE_CHOICES = [
        ('S', 'S조'),
        ('A', 'A조'),
        ('B', 'B조'),
        ('C', 'C조'),
        ('D', 'D조'),
        ('Beginner', '초심'),
    ]
    
    kakao_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    nickname = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEMBER')
    # 관리자 권한 및 활성화 상태 필드 (Django 필수)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, default='BEGINNER')
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'kakao_id' # 로그인 시 식별자로 사용할 필드
    REQUIRED_FIELDS = ['nickname'] # 슈퍼유저 생성 시 반드시 입력받을 필드
    is_taking_lessons = models.BooleanField(default=False)
    def __str__(self):
        return self.nickname