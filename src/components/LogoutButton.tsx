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
    } catch (error:any) {
      const errMsg =
      error.response?.data?.error ||
      error.message ||
      '알 수 없는 서버 오류';
      alert(errMsg);
    }
  };

  return (
    <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
      로그아웃
    </button>
  );
};

export default LogoutButton;