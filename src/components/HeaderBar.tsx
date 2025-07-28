import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderBar.css';

interface HeaderBarProps {
  userName: string;
  partnerName: string | null;
  handleLogout: () => void;
  handleEndConnection?: () => void;
  showSearch?: boolean;
  searchText?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  userName,
  partnerName,
  handleLogout,
  handleEndConnection,
  showSearch = true,
  searchText,
  onSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-bar">
      <div className="left-section">
        {showSearch && (
          <input
            type="text"
            className="search-input"
            placeholder="장소, 내용으로 검색..."
            value={searchText}
            onChange={onSearchChange}
          />
        )}
      </div>

      <Link to="/main" className="title-link">
        {userName} & {partnerName ?? '...'}의 WithLog
      </Link>


      <div className="user-dropdown" ref={dropdownRef}>
        <button className="user-button" onClick={() => setDropdownOpen(prev => !prev)}>
          {userName}
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            <button
              onClick={() => {
                if (window.confirm('정말 로그아웃 하시겠습니까?')) {
                  handleLogout();
                }
              }}
            >
              로그아웃
            </button>
            {partnerName && handleEndConnection && (
              <button onClick={handleEndConnection}>연결 끊기</button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;
