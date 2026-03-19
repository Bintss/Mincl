// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname');
  const userRole = localStorage.getItem('role');
  const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('role');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-6 py-3 flex justify-between items-center">

        {/* ✅ 텍스트 대신 로고 이미지 */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="민턴클로버 로고" className="h-9 w-auto" />
          <span className="text-lg font-bold text-green-600">민턴클로버</span>
        </Link>

        <div className="flex gap-4 text-sm font-semibold text-gray-600 items-center">
          <Link to="/" className="hover:text-green-500 transition-colors">일정</Link>

          {nickname ? (
            <div className="flex gap-3 items-center ml-2 border-l pl-4">
              {canManage && (
                <Link to="/members" className="text-gray-500 hover:text-blue-500 transition-colors" title="회원 관리">
                  ⚙️
                </Link>
              )}
              <Link to="/mypage" className="text-gray-800 font-bold hover:text-green-500 transition-colors">
                {nickname}님
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-green-500 transition-colors ml-2 border-l pl-4">
              로그인
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}