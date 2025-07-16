import React, { useState } from 'react';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css'; 
import MainPage from './MainPage';

type UserInfoResponse = {
  id: String;
  userConnectionId: String | null;
  userConnectionStatus: 'CONNECTED' | 'PENDING' | 'ENDED' | 'REJECT' | null;
  userId: string;
  partnerId: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
};

interface InvitePageProps {
  userInfo: UserInfoResponse | null;
  accessToken: string | null;
}


const InvitePage: React.FC<InvitePageProps> = ({ userInfo, accessToken }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSender, setIsSender] = useState(false)

  if (userInfo?.userConnectionStatus === 'CONNECTED') {
    return <MainPage />;
  }

  if (userInfo?.userConnectionStatus === 'PENDING') {
    
  }

  const isSendered = userInfo?.userId === userInfo?.id;
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
      const res = await fetch('http://localhost:8080/connections/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ partnerEmail: inviteEmail }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || '초대 실패!');
        return;
      }

      alert(`${inviteEmail}님에게 초대장을 전송했습니다!`);
      setInviteEmail('');
      setIsSender(true);
    } catch (error) {
      console.error(error);
      alert('서버 오류 발생');
    }
  };

  const handleAccept = async () => {
    if (!userInfo?.userConnectionId) return;

    try {
      const res = await fetch(`http://localhost:8080/connections/${userInfo.userConnectionId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || '수락 실패');
        return;
      }

      alert('초대를 수락했습니다!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    }
  };

  const handleDecline = async () => {
    if (!userInfo?.userConnectionId) return;

    try {
      const res = await fetch(`http://localhost:8080/connections/${userInfo.userConnectionId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || '거절 실패');
        return;
      }

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
        <div className="invite-form-wrapper">
          {isPending ? (
            isSendered ? (
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
