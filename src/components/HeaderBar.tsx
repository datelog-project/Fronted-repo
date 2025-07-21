import React from 'react';
import './HeaderBar.css';
import { Link } from 'react-router-dom';

interface HeaderBarProps {
  userName: string;
  partnerName: string | null;
  handleLogout: () => void;
  showSearch?: boolean;
  searchText?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  userName,
  partnerName,
  handleLogout,
  showSearch = true,
  searchText,
  onSearchChange,
}) => {
  return (
    <header className="header-bar">
      {showSearch && (
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchText}
          onChange={onSearchChange}
        />
      )}
      <Link to="/main" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>{userName} 💕 {partnerName ?? '아직 연결되지 않음'} 의 WithLog</h1>
      </Link>
      <button onClick={handleLogout}>로그아웃</button>
    </header>
  );
};

export default HeaderBar;
