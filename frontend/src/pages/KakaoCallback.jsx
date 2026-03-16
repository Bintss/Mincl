// frontend/src/pages/KakaoCallback.jsx
import { useEffect, useRef } from 'react'; // useRef 추가!
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  
  // 🚩 중복 호출 방지를 위한 깃발입니다.
  const isCalled = useRef(false); 

  useEffect(() => {
    // 코드가 있고, 아직 깃발이 안 꽂혀 있을 때만 실행!
    if (code && !isCalled.current) {
      isCalled.current = true; // 실행하자마자 바로 깃발을 꽂아버립니다.

      axios.post('http://127.0.0.1:8000/api/accounts/kakao/login/', { code: code })
        .then((res) => {
          // 브라우저 금고(localStorage)에 유저 정보와 '역할'을 함께 저장!
          localStorage.setItem('userId', res.data.user_id);
          localStorage.setItem('nickname', res.data.nickname);
          localStorage.setItem('role', res.data.role);
          
          alert(`환영합니다, ${res.data.nickname}님! 🏸`);
          navigate('/'); 
        })
        .catch((err) => {
          console.error("로그인 중 서버 에러 발생:", err);
          alert("로그인에 실패했습니다.");
          navigate('/login');
        });
    }
  }, [code, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-xl font-bold mb-4">카카오 로그인 처리 중입니다... 🔄</h2>
      <p className="text-gray-500">잠시만 기다려 주세요.</p>
    </div>
  );
}