import React from 'react';
import './MainPage.css';
import type { UserInfoResponse } from '../App';

interface MainPageProps {
  userInfo: UserInfoResponse;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfoResponse | null>>;
  handleLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ userInfo , handleLogout}) => {
  const { partnerName, userName} = userInfo;

  return (
    <div className="main-container">
      <header className="main-header">
        <h1>WithLog 💑</h1>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </header>
      <main className="main-content">
        <h2>안녕하세요, {userName}님!</h2>
        <p>
          당신은 현재 <strong>{partnerName ?? '아직 연결되지 않음'}</strong>님과
          연결되어 있어요 💕
        </p>

        <div className="placeholder-box">
          <p>연인과의 추억을 기록해보세요 📖</p>
        </div>
      </main>
    </div>
  );
};

export default MainPage;

