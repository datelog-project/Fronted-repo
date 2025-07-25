import React from 'react';
import { useRoutes, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import InvitePage from './components/InvitePage';
import MainPage from './components/MainPage';
import CreatePostPage from './components/CreatePostPage';
import WithLogDetailPage from './components/WithLogDetailPage';
import EditWithLogPage from './components/EditWithLogPage';
import SharedPage from './components/SharedPage';


import type { UserInfoResponse } from './App';
import api from './api/api';

interface Props {
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('서버 로그아웃 실패', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUserInfo(null);
      setIsSignin(false);
    }
  };

  const routes = useRoutes([
    {
      path: '/signin',
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
          <Navigate to="/signin" replace />
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
      path: '/create-post',
      element:
        isSignin && userInfo?.userConnectionStatus === 'CONNECTED' && userInfo.userConnectionId ? (
          <CreatePostPage
            userInfo={userInfo}
            userConnectionId={userInfo.userConnectionId}
            handleLogout={handleLogout}
          />
        ) : (
          <Navigate to="/invite" replace />
        ),
    },
    {
      path: '/with-logs/:withLogId/details',
      element:
        isSignin && userInfo?.userConnectionStatus === 'CONNECTED' ? (
          <WithLogDetailPage userInfo={userInfo} handleLogout={handleLogout} />
        ) : (
          <Navigate to="/signin" replace />
        ),
    },
    {
      path: '/with-logs/:withLogId/edit',
      element:
        isSignin && userInfo?.userConnectionStatus === 'CONNECTED' ? (
          <EditWithLogPage userInfo={userInfo} handleLogout={handleLogout} />
        ) : (
          <Navigate to="/signin" replace />
        ),
    },
    {
      path: '/share/:sharedLinkId',
      element: <SharedPage />,
    },
    {
      path: '*',
      element: <Navigate to="/signin" replace />,
    },
  ]);

  return routes;
}

