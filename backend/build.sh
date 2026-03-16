#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# DB 마이그레이션 먼저! (이게 성공해야 앱이 돌아갑니다)
python manage.py migrate

# 정적 파일 모으기 (에러 방지를 위해 --no-input 추가)
python manage.py collectstatic --no-input