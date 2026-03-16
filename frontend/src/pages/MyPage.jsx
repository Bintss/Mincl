// frontend/src/pages/MyPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MyPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [profile, setProfile] = useState(null);
  
  // 수정 모드인지 확인하는 상태값
  const [isEditing, setIsEditing] = useState(false);
  // 수정 중인 데이터를 담아두는 임시 저장소
  const [editData, setEditData] = useState({
    grade: '',
    phone_number: ''
  });

  useEffect(() => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    axios.get(`${API_URL}/api/accounts/user/${userId}/`)
      .then(res => {
        setProfile(res.data);
        setEditData({
          grade: res.data.grade,
          phone_number: res.data.phone_number
        });
      })
      .catch(err => console.error("프로필 정보 불러오기 실패:", err));
  }, [userId, navigate]);

  // 1. 레슨 여부 토글 버튼 (기존과 동일, 누르는 즉시 저장됨)
  const handleToggleLesson = () => {
    const newStatus = !profile.is_taking_lessons;
    axios.patch(`${API_URL}/api/accounts/user/${userId}/`, {
      is_taking_lessons: newStatus
    })
    .then(res => {
      setProfile({ ...profile, is_taking_lessons: res.data.is_taking_lessons });
    })
    .catch(err => console.error("상태 변경 실패:", err));
  };

  // 2. 수정 모드에서 텍스트 입력할 때 작동
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // 3. '저장하기' 버튼 눌렀을 때 작동
  const handleSave = () => {
    axios.patch(`${API_URL}/api/accounts/user/${userId}/`, editData)
      .then(res => {
        setProfile({ 
          ...profile, 
          grade: res.data.grade, 
          phone_number: res.data.phone_number 
        });
        setIsEditing(false); // 수정 모드 종료
        alert('내 정보가 성공적으로 수정되었습니다! ✨');
      })
      .catch(err => console.error("정보 수정 실패:", err));
  };

  // 급수를 예쁘게 보여주기 위한 변환기
  const gradeDisplay = {
    'S': 'S조', 'A': 'A조', 'B': 'B조', 
    'C': 'C조', 'D': 'D조', 'BEGINNER': '초심'
  };

  if (!profile) return <div className="p-6 text-center text-gray-500">정보를 불러오는 중...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mr-4">← 뒤로</button>
          <h2 className="text-2xl font-bold text-gray-800">👤 마이페이지</h2>
        </div>
        
        {/* 수정 모드 켜고 끄는 버튼 */}
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-blue-500 hover:text-blue-700">
            정보 수정
          </button>
        ) : (
          <button onClick={() => setIsEditing(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
            취소
          </button>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-1">닉네임</p>
          <p className="font-bold text-lg text-gray-800">{profile.nickname}</p>
        </div>
        
        <div className="mb-5 border-b pb-5">
          <p className="text-sm text-gray-500 mb-1">나의 권한</p>
          <p className="font-semibold text-blue-600">
            {profile.role === 'MEMBER' ? '일반회원' : 
             profile.role === 'ADMIN' ? '운영진' : 
             profile.role === 'PRESIDENT' ? '모임장' : '개발자'}
          </p>
        </div>

        {/* 내 정보 (급수 & 연락처) 표시 영역 */}
        <div className="mb-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">배드민턴 급수</p>
            {isEditing ? (
              <select name="grade" value={editData.grade} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="BEGINNER">초심</option>
                <option value="D">D조</option>
                <option value="C">C조</option>
                <option value="B">B조</option>
                <option value="A">A조</option>
                <option value="S">S조</option>
              </select>
            ) : (
              <p className="font-medium text-gray-800">{gradeDisplay[profile.grade] || '미설정'}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">연락처</p>
            {isEditing ? (
              <input type="tel" name="phone_number" value={editData.phone_number} onChange={handleChange} placeholder="010-0000-0000" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
            ) : (
              <p className="font-medium text-gray-800">{profile.phone_number || '등록된 연락처가 없습니다.'}</p>
            )}
          </div>
        </div>

        {/* 저장 버튼 (수정 모드일 때만 보임) */}
        {isEditing && (
          <button onClick={handleSave} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition mb-6 shadow-sm">
            변경 사항 저장하기
          </button>
        )}

        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">레슨 수강 여부</h3>
              <p className="text-xs text-gray-500 mt-1">정기운동 생성 시 자동으로 참석 처리됩니다.</p>
            </div>
            
            <button 
              onClick={handleToggleLesson}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${profile.is_taking_lessons ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${profile.is_taking_lessons ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}