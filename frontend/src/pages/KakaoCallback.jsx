// frontend/src/pages/KakaoCallback.jsx
import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const isCalled = useRef(false); 
  
  useEffect(() => {
    if (code && !isCalled.current) {
      isCalled.current = true;

      // 🚩 로컬 주소(127.0.0.1) 대신 환경 변수를 사용하도록 수정!
      // VITE_API_URL은 Vercel에 등록한 https://mintonclover.onrender.com 주소입니다.
      const API_URL = import.meta.env.VITE_API_URL;

      axios.post(`${API_URL}/api/accounts/kakao/login/`, { code: code })
        .then((res) => {
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