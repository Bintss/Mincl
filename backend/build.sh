#!/bin/bash

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input

# ✅ 커스텀 User 모델 필드(kakao_id, nickname)에 맞게 직접 생성
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
import os
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if password and not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(
        email=email,
        password=password,
        kakao_id='admin_superuser',
        nickname=os.environ.get('DJANGO_SUPERUSER_NICKNAME', 'admin')
    )
    print(f'✅ Superuser {email} 생성 완료')
else:
    print('✅ Superuser 이미 존재하거나 PASSWORD 미설정 → 건너뜀')
EOF