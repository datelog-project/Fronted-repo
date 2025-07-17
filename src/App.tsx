import React, { useState, useEffect } from 'react';
import InvitePage from './components/InvitePage';
import AuthPage from './components/AuthPage';
import api from './api/api';

type UserInfoResponse = {
  id: string;
  userConnectionId: string | null;
  userConnectionStatus: 'CONNECTED' | 'PENDING' | 'ENDED' | 'REJECT' | null;
  userId: string;
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
      localStorage.setItem("accessToken", accessToken);
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserInfo(meRes.data);
      setIsSignin(true);
    } catch (error: any) {
      console.error(error);
      alert('로그인 실패: ' + (error.response?.data?.error || '서버 오류'));
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get('/auth/me');
        setUserInfo(res.data);
        setIsSignin(true);
      } catch (err) {
        console.error('자동 로그인 실패:', err);
        localStorage.removeItem("accessToken");
        setIsSignin(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <div>로딩중...</div>;
  if (!isSignin) return <AuthPage onSignin={handleSignin} />;
  return (
    <>
      <InvitePage userInfo={userInfo} setUserInfo={setUserInfo} />
    </>
  );
}

export default App;
