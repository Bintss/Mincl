// frontend/src/pages/MeetupEdit.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function MeetupEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [formData, setFormData] = useState({
    title: '',
    meetup_type: 'REGULAR',
    meetup_date: '',
    location: '',
    max_capacity: 16,
  });

  useEffect(() => {
    // 운영진이 아니면 쫓아냅니다!
    const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);
    if (!canManage) {
      alert("접근 권한이 없습니다.");
      navigate(-1);
      return;
    }

    // 기존 모임 데이터 불러오기
    axios.get(`${API_URL}/api/meetups/${id}/`)
      .then(res => {
        const data = res.data;
        // HTML datetime-local 포맷(YYYY-MM-DDThh:mm)에 맞게 시간 문자열 자르기
        const formattedDate = data.meetup_date ? data.meetup_date.slice(0, 16) : '';
        
        setFormData({
          title: data.title,
          meetup_type: data.meetup_type || 'REGULAR',
          meetup_date: formattedDate,
          location: data.location,
          max_capacity: data.max_capacity,
        });
      })
      .catch(err => {
        console.error("일정 불러오기 실패:", err);
        alert("일정 정보를 불러올 수 없습니다.");
        navigate(-1);
      });
  }, [id, navigate, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // PUT 또는 PATCH 요청으로 수정된 데이터 보내기
    axios.patch(`${API_URL}/api/meetups/${id}/`, formData)
      .then(() => {
        alert('일정이 성공적으로 수정되었습니다! ✨');
        navigate(`/meetup/${id}`); // 수정 완료 후 상세 페이지로 복귀
      })
      .catch((err) => {
        console.error("일정 수정 오류:", err);
        alert('일정 수정에 실패했습니다.');
      });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mr-4">← 취소</button>
        <h2 className="text-2xl font-bold text-gray-800">일정 수정하기</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {/* 모임 종류 */}
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">모임 제목</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:blue-400" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">날짜 및 시간</label>
          <input type="datetime-local" name="meetup_date" value={formData.meetup_date} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:blue-400" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">장소</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:blue-400" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">최대 정원 (명)</label>
          <input type="number" name="max_capacity" value={formData.max_capacity} onChange={handleChange} min="1" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:blue-400" />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition shadow-sm mt-4">
          수정 완료
        </button>
      </form>
    </div>
  );
}