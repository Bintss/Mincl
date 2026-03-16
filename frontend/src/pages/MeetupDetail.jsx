// frontend/src/pages/MeetupDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MeetupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [meetup, setMeetup] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  // 게스트 모달 관련 상태
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    gender: '남성',
    grade: 'BEGINNER'
  });

  const currentUserId = localStorage.getItem('userId'); 
  const userRole = localStorage.getItem('role'); 
  const canManage = ['DEVELOPER', 'PRESIDENT', 'ADMIN'].includes(userRole);

  const gradeStyles = {
    'S': 'bg-black text-white',
    'A': 'bg-red-100 text-red-600',
    'B': 'bg-orange-100 text-orange-600',
    'C': 'bg-yellow-100 text-yellow-600',
    'D': 'bg-green-100 text-green-600',
    'BEGINNER': 'bg-gray-100 text-gray-500'
  };

  const gradeNames = {
    'S': 'S조', 'A': 'A조', 'B': 'B조', 'C': 'C조', 'D': 'D조', 'BEGINNER': '초심'
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const meetupRes = await axios.get(`${API_URL}/api/meetups/${id}/`);
      const attendanceRes = await axios.get(`${API_URL}/api/attendances/?meetup=${id}`);
      setMeetup(meetupRes.data);
      setAttendances(attendanceRes.data);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const myAttendance = attendances.find(att => !att.is_guest && String(att.user) === String(currentUserId));

  const handleVote = (status) => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    if (myAttendance) {
      axios.patch(`${API_URL}/api/attendances/${myAttendance.id}/`, { status })
        .then(res => {
          if (status === 'Attending' && res.data.status === 'Waitlisted') {
            alert('정원이 초과되어 대기 명단으로 변경되었습니다! ⏳');
          }
          fetchData();
        })
        .catch(err => console.error(err));
    } else {
      axios.post('${API_URL}/api/attendances/', {
        meetup: id,
        user: currentUserId,
        status: status
      })
      .then(res => {
        if (status === 'Attending' && res.data.status === 'Waitlisted') {
          alert('정원이 초과되어 대기 명단으로 등록되었습니다! ⏳');
        }
        fetchData();
      })
      .catch(err => console.error(err));
    }
  };

  // 게스트 등록 제출
  const handleGuestSubmit = () => {
    if (!guestInfo.name.trim()) {
      alert("게스트 이름을 입력해주세요.");
      return;
    }

    axios.post('${API_URL}/api/attendances/', {
      meetup: id,
      status: 'Attending',
      is_guest: true,
      guest_name: guestInfo.name,
      guest_gender: guestInfo.gender,
      guest_grade: guestInfo.grade,
      inviter: currentUserId
    })
    .then(res => {
      alert(res.data.status === 'Waitlisted' ? '대기로 등록되었습니다.' : '게스트가 등록되었습니다!');
      setShowGuestModal(false);
      setGuestInfo({ name: '', gender: '남성', grade: 'BEGINNER' });
      fetchData();
    })
    .catch(err => console.error(err));
  };

  const handleDeleteAttendance = (attendanceId, name) => {
    if(window.confirm(`${name}님의 내역을 삭제하시겠습니까?`)) {
      axios.delete(`${API_URL}/api/attendances/${attendanceId}/`)
      .then(() => fetchData())
      .catch(err => console.error(err));
    }
  };

  if (loading) return <div className="p-10 text-center">정보를 불러오는 중...</div>;
  if (!meetup) return <div className="p-10 text-center">일정을 찾을 수 없습니다.</div>;

  const attendingList = attendances.filter(a => a.status === 'Attending');
  const waitlistedList = attendances.filter(a => a.status === 'Waitlisted');
  const absentList = attendances.filter(a => a.status === 'Absent');

  return (
    <div className="max-w-md mx-auto p-6 pb-20 relative">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 text-sm font-semibold">← 뒤로</button>
        {canManage && <button onClick={() => navigate(`/edit/${id}`)} className="text-blue-500 text-xs font-bold">일정 수정</button>}
      </div>

      {/* 일정 카드 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 text-center">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black mb-3 inline-block uppercase">
          {meetup.meetup_type === 'REGULAR' ? '정기운동' : '번개운동'}
        </span>
        <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tight">{meetup.title}</h2>
        <div className="space-y-1 text-gray-500 text-sm mb-8">
          <p>📅 {new Date(meetup.meetup_date).toLocaleString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' })}</p>
          <p>📍 {meetup.location}</p>
          <p>👥 정원: {attendingList.length} / {meetup.max_capacity || '무제한'}</p>
        </div>

        {/* 내 투표 및 게스트 버튼 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button onClick={() => handleVote('Attending')} className={`py-3.5 rounded-2xl font-black transition-all ${myAttendance?.status === 'Attending' ? 'bg-green-500 text-white' : myAttendance?.status === 'Waitlisted' ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {myAttendance?.status === 'Waitlisted' ? '대기 중' : '참석하기'}
          </button>
          <button onClick={() => handleVote('Absent')} className={`py-3.5 rounded-2xl font-black transition-all ${myAttendance?.status === 'Absent' ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-400'}`}>불참</button>
        </div>
        <button onClick={() => setShowGuestModal(true)} className="w-full py-3 rounded-2xl font-bold text-purple-600 bg-purple-50 border border-purple-100 hover:bg-purple-100 transition shadow-sm text-sm">
          + 👤 지인(게스트) 추가하기
        </button>
      </div>

      {/* 참여 현황 목록 */}
      <div className="bg-white p-5 border rounded-3xl shadow-sm">
        <h3 className="font-black text-gray-800 mb-5 pb-3 border-b">📊 참여 현황 ({attendances.length})</h3>

        {/* 참석 */}
        <div className="mb-6">
          <h4 className="text-[10px] font-black text-green-500 mb-3 uppercase tracking-widest">참석 확정 ({attendingList.length})</h4>
          <div className="grid grid-cols-2 gap-2">
            {attendingList.map(att => (
              <div key={att.id} className="flex items-center gap-1.5 p-2.5 bg-green-50 rounded-xl border border-green-100">
                <span className="text-[10px] font-bold text-gray-400">
                  {att.is_guest ? (att.guest_gender === '남성' ? '남' : '여') : ''}
                </span>
                <span className="text-sm font-bold text-gray-800 truncate">
                  {att.is_guest ? att.guest_name : att.user_nickname}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${gradeStyles[att.is_guest ? att.guest_grade : att.user_grade]}`}>
                  {gradeNames[att.is_guest ? att.guest_grade : att.user_grade]}
                </span>
                {(att.is_guest && (String(att.inviter) === String(currentUserId) || canManage)) && (
                  <button onClick={() => handleDeleteAttendance(att.id, att.guest_name)} className="ml-auto text-red-300 font-bold text-xs p-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 대기 */}
        {waitlistedList.length > 0 && (
          <div className="mb-6 pt-4 border-t border-dashed">
            <h4 className="text-[10px] font-black text-yellow-600 mb-3 uppercase tracking-widest">대기 중 ({waitlistedList.length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {waitlistedList.map((att, idx) => (
                <div key={att.id} className="flex items-center gap-1.5 p-2.5 bg-yellow-50 rounded-xl border border-yellow-100">
                  <span className="text-[9px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded-full">{idx + 1}</span>
                  <span className="text-sm font-bold text-gray-800 truncate">{att.is_guest ? att.guest_name : att.user_nickname}</span>
                  {(att.is_guest && (String(att.inviter) === String(currentUserId) || canManage)) && (
                    <button onClick={() => handleDeleteAttendance(att.id, att.guest_name)} className="ml-auto text-red-300 font-bold text-xs p-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 게스트 등록 모달 */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-800 mb-4">👤 게스트 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1 block uppercase">이름</label>
                <input 
                  type="text" 
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  placeholder="게스트 이름 입력"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1 block uppercase">성별</label>
                <div className="flex gap-2">
                  {['남성', '여성'].map(g => (
                    <button key={g} onClick={() => setGuestInfo({...guestInfo, gender: g})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${guestInfo.gender === g ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-400 border-gray-100'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 mb-1 block uppercase">급수</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['S', 'A', 'B', 'C', 'D', 'BEGINNER'].map(gr => (
                    <button key={gr} onClick={() => setGuestInfo({...guestInfo, grade: gr})} className={`py-1.5 rounded-lg text-[10px] font-black border transition ${guestInfo.grade === gr ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-100'}`}>
                      {gradeNames[gr]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowGuestModal(false)} className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600">취소</button>
              <button onClick={handleGuestSubmit} className="flex-2 py-3 bg-purple-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-200">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}