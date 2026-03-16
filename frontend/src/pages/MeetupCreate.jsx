// frontend/src/pages/MeetupCreate.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MeetupCreate() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (!currentUserId) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/login');
    }
  }, [currentUserId, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    meetup_date: '',
    location: '',
    max_capacity: 25,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 백엔드로 모임 생성 데이터 전송
    axios.post('${API_URL}/api/meetups/', formData)
      .then((res) => {
        alert('성공적으로 일정이 생성되었습니다! 🏸');
        navigate(`/meetup/${res.data.id}`); // 생성된 모임 상세 페이지로 바로 이동
      })
      .catch((err) => {
        console.error("일정 생성 오류:", err);
        alert('일정 생성에 실패했습니다. 입력값을 확인해 주세요.');
      });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mr-4">
          ← 뒤로
        </button>
        <h2 className="text-2xl font-bold text-gray-800">새 일정 만들기</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {/* 👇 [핵심] 가장 맨 위로 올라온 모임 종류 선택 버튼 */}
        <div className="mb-6 border-b pb-6">
          <label className="block text-sm font-extrabold text-gray-800 mb-3">어떤 모임인가요?</label>
          <div className="flex gap-4">
            <label className={`flex-1 flex justify-center items-center py-3.5 rounded-xl border-2 cursor-pointer transition-all ${formData.meetup_type === 'REGULAR' ? 'border-green-500 bg-green-50 text-green-700 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" name="meetup_type" value="REGULAR" className="hidden" onChange={handleChange} checked={formData.meetup_type === 'REGULAR'} />
              🏸 정기운동
            </label>
            <label className={`flex-1 flex justify-center items-center py-3.5 rounded-xl border-2 cursor-pointer transition-all ${formData.meetup_type === 'LIGHTNING' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" name="meetup_type" value="LIGHTNING" className="hidden" onChange={handleChange} checked={formData.meetup_type === 'LIGHTNING'} />
              ⚡ 번개운동
            </label>
          </div>
        </div>

        {/* 모임 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">모임 제목</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="예: 수요일 정기 운동" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
        </div>

        {/* 날짜 및 시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">날짜 및 시간</label>
          <input type="datetime-local" name="meetup_date" value={formData.meetup_date} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">장소</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="예: 레스피아 체육관" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
        </div>

        {/* 최대 정원 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">최대 정원 (명)</label>
          <input type="number" name="max_capacity" value={formData.max_capacity} onChange={handleChange} min="1" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition" />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition shadow-sm mt-4">
          일정 생성하기
        </button>
      </form>
    </div>
  );
}