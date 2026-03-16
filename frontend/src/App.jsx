// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import MeetupDetail from './pages/MeetupDetail';
import MeetupCreate from './pages/MeetupCreate';
import KakaoCallback from './pages/KakaoCallback';
import MyPage from './pages/MyPage';
import MeetupEdit from './pages/MeetupEdit';
import MemberManage from './pages/MemberManage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/meetup/:id" element={<MeetupDetail />} />
          <Route path="/meetup/create" element={<MeetupCreate />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/edit/:id" element={<MeetupEdit />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/members" element={<MemberManage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;