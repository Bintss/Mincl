// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // 브라우저 금고에서 내 정보를 꺼내옵니다.
  const nickname = localStorage.getItem('nickname');
  const userRole = localStorage.getItem('role');
  const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);
  // 로그아웃: 금고를 비우고 홈으로 보냅니다.
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-600 flex items-center gap-2">
          🍀 민턴클로버
        </Link>

        <div className="flex gap-4 text-sm font-semibold text-gray-600 items-center">
          <Link to="/" className="hover:text-green-500 transition-colors">일정</Link>
          
          {/* 닉네임이 있으면 닉네임+로그아웃을, 없으면 로그인 버튼을 보여줍니다 */}
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