// frontend/src/pages/Login.jsx
export default function Login() {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">

      {/* ✅ 텍스트 대신 로고 이미지 */}
      <img src="/logo.png" alt="민턴클로버 로고" className="w-32 h-auto mb-4" />
      <h1 className="text-2xl font-bold mb-1 text-gray-800">민턴클로버</h1>
      <p className="text-gray-500 mb-8">우리들만의 배드민턴 소모임</p>

      <button
        onClick={handleLogin}
        className="w-full max-w-xs px-6 py-3 bg-[#FEE500] hover:bg-[#E5CD00] text-[#000000] font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
      >
        <span>카카오톡으로 시작하기</span>
      </button>
    </div>
  );
}