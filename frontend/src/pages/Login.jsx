// frontend/src/pages/Login.jsx

export default function Login() {
  // .env 파일에 저장해둔 환경변수 불러오기
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  
  // 카카오 로그인 화면으로 이동하는 공식 URL 만들기
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleLogin = () => {
    // 버튼을 누르면 카카오 로그인 페이지로 완전히 이동시킵니다.
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">민턴클로버 🏸</h1>
      <p className="text-gray-500 mb-8">우리들만의 배드민턴 소모임</p>
      
      {/* onClick 이벤트를 달아줍니다 */}
      <button 
        onClick={handleLogin}
        className="w-full max-w-xs px-6 py-3 bg-[#FEE500] hover:bg-[#E5CD00] text-[#000000] font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
      >
        <span>카카오톡으로 시작하기</span>
      </button>
    </div>
  );
}