# backend/accounts/views.py
import requests
import json
import os  # ✅ 추가: 환경변수 읽기
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .models import User

@api_view(['POST'])
def kakao_login(request):
    code = request.data.get('code')
    if not code:
        return JsonResponse({'error': '코드가 없습니다.'}, status=400)

    # ✅ 환경변수로 교체 (하드코딩 제거)
    REST_API_KEY = os.environ.get('KAKAO_REST_API_KEY')
    REDIRECT_URI = os.environ.get('KAKAO_REDIRECT_URI')

    # ✅ 환경변수 누락 방어 처리
    if not REST_API_KEY or not REDIRECT_URI:
        return JsonResponse({'error': '서버 환경변수 설정 오류'}, status=500)

    token_req = requests.post(
        "https://kauth.kakao.com/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "authorization_code",
            "client_id": REST_API_KEY,
            "redirect_uri": REDIRECT_URI,
            "code": code,
        }
    )
    token_json = token_req.json()
    access_token = token_json.get("access_token")

    if not access_token:
        print("카카오 토큰 발급 실패:", token_json)
        return JsonResponse({'error': '카카오 토큰 발급 실패', 'detail': token_json}, status=400)

    # 카카오 유저 정보 가져오기
    profile_req = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    profile_data = profile_req.json()

    kakao_id = profile_data.get("id")
    nickname = profile_data.get("properties", {}).get("nickname", "이름없음")

    if not kakao_id:
        return JsonResponse({'error': '카카오 프로필 조회 실패'}, status=400)

    user, created = User.objects.get_or_create(
        kakao_id=kakao_id,
        defaults={'nickname': nickname}
    )

    return JsonResponse({
        'message': '카카오 로그인 성공!',
        'user_id': user.id,
        'nickname': user.nickname,
        'role': user.role,
        'is_new_user': created
    })


@api_view(['GET', 'PATCH', 'DELETE'])  # ✅ csrf_exempt 대신 DRF api_view 사용
def user_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "유저를 찾을 수 없습니다."}, status=404)

    if request.method == 'GET':
        return JsonResponse({
            "id": user.id,
            "nickname": user.nickname,
            "role": user.role,
            "is_taking_lessons": user.is_taking_lessons,
            "grade": user.grade,
            "phone_number": user.phone_number or ""
        })

    elif request.method == 'PATCH':
        data = request.data  # ✅ DRF의 request.data 사용 (json.loads 불필요)
        if 'is_taking_lessons' in data:
            user.is_taking_lessons = data['is_taking_lessons']
        if 'grade' in data:
            user.grade = data['grade']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'role' in data:
            user.role = data['role']
        user.save()
        return JsonResponse({
            "message": "수정 완료",
            "is_taking_lessons": user.is_taking_lessons,
            "grade": user.grade,
            "phone_number": user.phone_number,
            "role": user.role
        })

    elif request.method == 'DELETE':
        user.delete()
        return JsonResponse({"message": "회원이 성공적으로 삭제되었습니다."})


@api_view(['GET'])  # ✅ DRF api_view 적용
def user_list(request):
    users = User.objects.all().values(
        'id', 'nickname', 'role', 'grade', 'is_taking_lessons', 'phone_number'
    ).order_by('-role', 'nickname')
    return JsonResponse(list(users), safe=False)