import React, { useState } from 'react';
import InvitePage from './components/InvitePage';
import AuthPage from './components/AuthPage';

type UserInfoResponse = {
  id: string;
  userConnectionId: string | null;
  userConnectionStatus: 'CONNECTED' | 'PENDING' | 'ENDED' | 'REJECT' | null;
  userId: string;
  partnerId: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
};

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [isSignin, setIsSignin] = useState(false);

  const handleSignin = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:8080/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || '로그인 실패!');
        return;
      }

      const data = await res.json();
      console.log('로그인 성공, 받은 데이터:', data);


      setAccessToken(data.accessToken);
      setUserInfo(data.user);
      setIsSignin(true);
    } catch (error) {
      console.error(error);
      alert('서버 오류 발생');
    }
  };

  if (!isSignin) {
    return <AuthPage onSignin={handleSignin} />;
  }
  
  return <InvitePage userInfo={userInfo} accessToken={accessToken} />;
}

export default App;