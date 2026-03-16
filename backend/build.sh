#!/usr/bin/env bash
set -o errexit

# 패키지 설치
pip install -r requirements.txt

# 정적 파일 모으기 (나중에 관리자 페이지를 위해 필요)
python manage.py collectstatic --no-input

# 👇 [핵심] DB 마이그레이션 실행
python manage.py migrate