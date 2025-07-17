import React from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  redirectUrl?: string; // 로그아웃 후 이동할 경로, 기본값 '/auth'
}

const LogoutButton: React.FC<LogoutButtonProps> = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
    try {
      await api.post('/auth/signout');
      localStorage.removeItem('accessToken');
      navigate('/auth');
    } catch (error) {
      alert('로그아웃에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
      로그아웃
    </button>
  );
};

export default LogoutButton;