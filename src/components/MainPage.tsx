import React from 'react';
import './MainPage.css';

interface MainPageProps {
  userName?: string;
  partnerName?: string;
  onLogout?: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ userName , partnerName , onLogout }) => {
  return (
    <div className="main-container">
      <header className="main-header">
        <h1>WithLog 💑</h1>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        )}
      </header>
      <main className="main-content">
        <h2>안녕하세요, {userName}님!</h2>
        <p>당신은 현재 <strong>{partnerName}</strong>님과 연결되어 있어요 💕</p>

        <div className="placeholder-box">
          {/* 여기에 게시글, 다이어리, 사진 등의 콘텐츠 들어갈 수 있어요 */}
          <p>연인과의 추억을 기록해보세요 📖</p>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
