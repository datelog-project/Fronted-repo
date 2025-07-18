import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import api from './api/api';
import AppRoutes from './AppRoutes';

export type UserInfoResponse = {
  id: string;
  userConnectionId: string | null;
  userConnectionStatus: 'CONNECTED' | 'PENDING' | 'ENDED' | 'REJECT' | null;
  userName: string;
  partnerId: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
  isSender: boolean;
};

function App() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [isSignin, setIsSignin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignin = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/signin', { email, password });
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);

      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserInfo(meRes.data);
      setIsSignin(true);
    } catch (error: any) {
      alert('로그인 실패: ' + (error.response?.data?.error || '서버 오류'));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUserInfo(null);
      setIsSignin(false);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get('/auth/me');
        setUserInfo(res.data);
        setIsSignin(true);
      } catch (err) {
        localStorage.removeItem('accessToken');
        setUserInfo(null);
        setIsSignin(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <div>로딩중...</div>;

  return (
    <Router>
      <AppRoutes
        userInfo={userInfo}
        isSignin={isSignin}
        isLoading={isLoading}
        setUserInfo={setUserInfo}
        setIsSignin={setIsSignin}
        onSignin={handleSignin}
      />
    </Router>
  );
}

export default App;

