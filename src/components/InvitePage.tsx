import React, { useState } from 'react';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css'; 
import MainPage from './MainPage';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import type { UserInfoResponse } from '../App';

interface InvitePageProps {
  userInfo: UserInfoResponse | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfoResponse | null>>;
  handleLogout: () => void;
}


const InvitePage: React.FC<InvitePageProps> = ({ userInfo ,setUserInfo, handleLogout}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const navigate = useNavigate();

  if (userInfo?.userConnectionStatus === 'CONNECTED') {
    return <MainPage userInfo={userInfo} setUserInfo={setUserInfo} handleLogout={handleLogout}/>;
  }


  const isSender = userInfo?.isSender;
  const isPending = userInfo?.userConnectionStatus === 'PENDING';
  const showInviteForm =
    userInfo?.userConnectionStatus === null ||
    userInfo?.userConnectionStatus === 'REJECT' ||
    userInfo?.userConnectionStatus === 'ENDED';

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('이메일을 입력해주세요!');
      return;
    }

    try {
      await api.post('/connections/invite', { partnerEmail: inviteEmail });

      alert(`${inviteEmail}님에게 초대장을 전송했습니다!`);
      setInviteEmail('');
      const res = await api.get('/auth/me');
      setUserInfo(res.data);
    } catch (error:any) {
      const errMsg =
      error.response?.data?.error ||
      error.message ||
      '알 수 없는 서버 오류';
      alert(errMsg);
    }
  };

  const handleAccept = async () => {
    if (!userInfo?.userConnectionId) return;
    try {
      await api.post(`/connections/${userInfo.userConnectionId}/accept`, {
      });

      const res = await api.get('/auth/me');
      setUserInfo(res.data);

      navigate('/main');
    } catch (error) {
      alert('초대 수락 실패');
    }
  };

  const handleDecline = async () => {
    if (!userInfo?.userConnectionId) return;

    try {
      await api.post(`/connections/${userInfo.userConnectionId}/reject`)

      alert('초대를 거절했습니다');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    }
  };

  

  return (
    <div className="book-container">
      <div className="left-page">
        <img src={logo} alt="WithLog 로고" className="logo-img" />
      </div>
      <div className="right-page">
        <div className="logout-wrapper">
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
        <div className="invite-form-wrapper">
          {isPending ? (
            isSender ? (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2 style={{fontSize: '24px'}}>⏳ 상대방의 수락을 기다리고 있어요!</h2>
                <p style={{ fontSize: '14px', color: '#888' }}>
                  초대한 상대: {userInfo.partnerEmail || '알 수 없음'}
                </p>
              </div>
            ) : (
              <>
                <h2>{userInfo.partnerName || '상대방'}님이 초대했어요 💌</h2>
                <p>이메일: {userInfo.partnerEmail || '알 수 없음'}</p>
                <p>수락하시겠어요?</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                  <button className="accept-btn" onClick={handleAccept}>수락</button>
                  <button className="decline-btn" onClick={handleDecline}>거절</button>
                </div>
              </>
            )
          ) : showInviteForm ? (
            <>
              <h2>연인을 초대해보세요 💌</h2>
              <label htmlFor="inviteEmail">이메일 주소</label>
              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="partner@example.com"
                required
              />
              <button onClick={handleInvite}>초대하기</button>
            </>
          ) : (
            <p>⚠️ 처리할 수 없는 상태입니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
