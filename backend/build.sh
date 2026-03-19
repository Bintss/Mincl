#!/bin/bash

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input

# ✅ email 기준으로 중복 체크하도록 수정
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
import os
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if password and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
    print(f'✅ Superuser {email} 생성 완료')
else:
    print('✅ Superuser 이미 존재하거나 PASSWORD 미설정 → 건너뜀')
EOF