// frontend/src/pages/MemberManage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MemberManage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);
    if (!canManage) {
      alert("접근 권한이 없습니다.");
      navigate('/');
      return;
    }
    fetchUsers();
  }, [navigate, userRole]);

  const fetchUsers = () => {
    axios.get('http://127.0.0.1:8000/api/accounts/users/')
      .then(res => setUsers(res.data))
      .catch(err => console.error("회원 목록 불러오기 실패:", err));
  };

  const handleRoleChange = (userId, newRole) => {
    axios.patch(`http://127.0.0.1:8000/api/accounts/user/${userId}/`, { role: newRole })
      .then(() => fetchUsers())
      .catch(err => console.error("권한 변경 실패:", err));
  };

  const handleLessonToggle = (userId, currentStatus) => {
    axios.patch(`http://127.0.0.1:8000/api/accounts/user/${userId}/`, { is_taking_lessons: !currentStatus })
      .then(() => fetchUsers())
      .catch(err => console.error("레슨 상태 변경 실패:", err));
  };

  // 👇 1. 회원 삭제(강퇴) 함수 추가! (실수로 누르지 않게 경고창을 띄웁니다)
  const handleDeleteUser = (userId, nickname) => {
    if (window.confirm(`정말 ${nickname} 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 해당 회원의 모든 모임 투표 내역도 함께 삭제됩니다.`)) {
      axios.delete(`http://127.0.0.1:8000/api/accounts/user/${userId}/`)
        .then(() => {
          alert(`${nickname} 회원이 앱에서 삭제되었습니다.`);
          fetchUsers(); // 목록 새로고침
        })
        .catch(err => console.error("회원 삭제 실패:", err));
    }
  };

  const filteredUsers = users.filter(user => 
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mr-3">←</button>
          <h2 className="text-xl font-bold text-gray-800">👥 회원 관리</h2>
        </div>
        <span className="text-sm font-bold text-blue-500">총 {filteredUsers.length}명</span>
      </div>

      <div className="mb-4 relative">
        <input 
          type="text" 
          placeholder="이름을 검색하세요..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">{user.nickname}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-bold tracking-tighter">
                    {user.grade === 'BEGINNER' ? '초심' : `${user.grade}조`}
                  </span>
                </div>
                
                <select 
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className={`text-xs font-semibold px-1 py-1 rounded border outline-none ${
                    ['ADMIN', 'PRESIDENT', 'DEVELOPER'].includes(user.role) 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-transparent border-gray-200 text-gray-500'
                  }`}
                >
                  <option value="MEMBER">일반회원</option>
                  <option value="ADMIN">운영진</option>
                  <option value="PRESIDENT">모임장</option>
                  {user.role === 'DEVELOPER' && <option value="DEVELOPER">개발자</option>}
                </select>
              </div>

              {/* 👇 2. 하단에 레슨 토글과 회원 삭제 버튼 나란히 배치 */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-50 mt-1">
                <span className="text-xs font-medium text-gray-500">레슨자 등록</span>
                <div className="flex items-center gap-3">
                  {/* 삭제 버튼 추가 */}
                  <button 
                    onClick={() => handleDeleteUser(user.id, user.nickname)}
                    className="text-[10px] font-bold text-red-400 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition"
                  >
                    삭제
                  </button>
                  
                  {/* 레슨자 토글 */}
                  <button 
                    onClick={() => handleLessonToggle(user.id, user.is_taking_lessons)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${user.is_taking_lessons ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${user.is_taking_lessons ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}