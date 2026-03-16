// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [meetups, setMeetups] = useState([]);

  const userRole = localStorage.getItem('role');
  const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);

  useEffect(() => {
    // 🚩 로컬 주소 대신 환경 변수를 사용하도록 수정!
    const API_URL = import.meta.env.VITE_API_URL;

    axios.get(`${API_URL}/api/meetups/`)
      .then(res => setMeetups(res.data))
      .catch(err => console.error("일정 목록 불러오기 실패:", err));
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 relative min-h-[80vh]">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏸 예정된 운동</h2>
      </div>

      <div className="space-y-4">
        {meetups.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            아직 등록된 일정이 없습니다.<br/>
            {canManage && "오른쪽 아래 ➕ 버튼을 눌러 새 일정을 만들어보세요!"}
          </div>
        ) : (
          meetups.map(meetup => (
            <Link 
              to={`/meetup/${meetup.id}`} 
              key={meetup.id}
              className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-1">{meetup.title}</h3>
              <p className="text-gray-600 text-sm mb-1">
                📅 {new Date(meetup.meetup_date).toLocaleString('ko-KR', { 
                  month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' 
                })}
              </p>
              <p className="text-gray-500 text-sm">📍 {meetup.location}</p>
            </Link>
          ))
        )}
      </div>

      {canManage && (
        <Link 
        to="/meetup/create" 
        className="fixed bottom-8 right-8 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
        >
        +
        </Link>
      )}

    </div>
  );
}