import React from 'react';
import { useRoutes, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import InvitePage from './components/InvitePage';
import MainPage from './components/MainPage';

import type { UserInfoResponse } from './App';

type Props = {
  userInfo: UserInfoResponse | null;
  isSignin: boolean;
  isLoading: boolean;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfoResponse | null>>;
  setIsSignin: React.Dispatch<React.SetStateAction<boolean>>;
  onSignin: (email: string, password: string) => Promise<void>;
};

export default function AppRoutes({ userInfo, isSignin, isLoading, setUserInfo, setIsSignin, onSignin }: Props) {
  if (isLoading) {
    return <div>로딩중...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUserInfo(null);
    setIsSignin(false);
  };

  const routes = useRoutes([
    {
      path: '/login',
      element: !isSignin || !userInfo ? (
        <AuthPage onSignin={onSignin} />
      ) : userInfo ? (
        userInfo.userConnectionStatus === 'CONNECTED' ? (
          <Navigate to="/main" replace />
        ) : (
          <Navigate to="/invite" replace />
        )
      ) : (
        <div>로딩중...</div>
      ),
    },
    {
      path: '/invite',
      element:
        isSignin && userInfo ? (
          <InvitePage userInfo={userInfo} setUserInfo={setUserInfo} handleLogout={handleLogout}/>
        ) : (
          <Navigate to="/login" replace />
        ),
    },
    {
      path: '/main',
      element:
        isSignin && userInfo?.userConnectionStatus === 'CONNECTED' ? (
          <MainPage userInfo={userInfo} setUserInfo={setUserInfo} handleLogout={handleLogout} />
        ) : (
          <Navigate to="/invite" replace />
        ),
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ]);

  return routes;
}

