import React, { useState } from 'react';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css'; 


const InvitePage: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (!inviteEmail) {
      alert('이메일을 입력해주세요!');
      return;
    }
    // TODO: API 연동
    alert(`초대장을 ${inviteEmail}님에게 전송했습니다!`);
    setInviteEmail('');
  };

  return (
    <div className="book-container">
      <div className="left-page">
        <img src={logo} alt="WithLog 로고" className="logo-img" />
      </div>
      <div className="right-page">
        <div className="invite-form-wrapper">
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
        </div>
      </div>
    </div>
  );

};

export default InvitePage;
