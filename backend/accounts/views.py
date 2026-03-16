# backend/accounts/views.py
import requests
import json  # 👈 추가됨: 데이터를 읽고 쓰기 위한 도구
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt # 👈 추가됨: 프론트엔드 요청 허용 도구
from .models import User

@api_view(['POST'])
def kakao_login(request):
    # 1. 프론트엔드가 보낸 인가 코드 받기
    code = request.data.get('code')
    if not code:
        return JsonResponse({'error': '코드가 없습니다.'}, status=400)

    # 2. 카카오 서버에 Access Token 요청
    REST_API_KEY = "42a1c2fa87e345a29c22c8b3c22722c5"
    REDIRECT_URI = "http://localhost:5173/auth/kakao/callback"

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
        print("카카오가 토큰 발급 실패 원인:", token_json)
        return JsonResponse({'error': '카카오 토큰 발급 실패', 'detail': token_json}, status=400)

    # 3. Access Token으로 카카오 유저 정보(프로필) 가져오기
    profile_req = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    profile_data = profile_req.json()

    kakao_id = profile_data.get("id")
    nickname = profile_data.get("properties", {}).get("nickname", "이름없음")

    # 4. 우리 DB에 유저가 없으면 새로 가입(Create), 있으면 가져오기(Get)
    user, created = User.objects.get_or_create(
        kakao_id=kakao_id,
        defaults={'nickname': nickname}
    )

    # 5. 성공적으로 로그인 처리됨을 프론트엔드에 알림
    return JsonResponse({
        'message': '카카오 로그인 성공!',
        'user_id': user.id,
        'nickname': user.nickname,
        'role': user.role,
        'is_new_user': created # 새로 가입한 유저인지 여부
    })


# 👇 새로 추가된 마이페이지용 조회 및 수정 API
@csrf_exempt
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
            # 👇 GET 요청 시 급수와 연락처도 같이 보내줍니다
            "grade": user.grade,
            "phone_number": user.phone_number or ""
        })
    
    elif request.method == 'PATCH':
        data = json.loads(request.body)
        
        # 👇 보내온 데이터 중에 있으면 각각 업데이트합니다
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

@csrf_exempt
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all().values(
            'id', 'nickname', 'role', 'grade', 'is_taking_lessons', 'phone_number'
        ).order_by('-role', 'nickname')
        
        return JsonResponse(list(users), safe=False)