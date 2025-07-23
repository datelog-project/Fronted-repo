import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css';

interface AuthPageProps {
  onSignin: (email: string, password: string) => void; 
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignin }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setShowSignup(prev => !prev);

  // 로그인 성공 시 호출할 함수
  const handleSigninSuccess = (email: string, password: string) => {
    onSignin(email, password);
    setIsFlipping(true);  // 애니메이션 시작
  };

  // 애니메이션 끝난 후 페이지 이동
  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => {
        navigate('/invite');  // 예: 초대 페이지 경로
      }, 1600); // CSS transition duration과 맞춤

      return () => clearTimeout(timer);
    }
  }, [isFlipping, navigate]);

  return (
    <div className={`book-container ${isFlipping ? 'flipping' : ''}`}>
      <div className={`left-page`}>
        <img src={logo} alt="WithLog 로고" className="logo-img" />
      </div>
      <div className={`right-page ${isFlipping ? 'flipping' : ''}`}>
        <div className="form-wrapper">
          {showSignup ? (
            <>
              <SignupForm onRegisterSuccess={() => setShowSignup(false)} />
              <div className="form-footer">
                이미 회원이신가요?{' '}
                <button className="switch-btn" onClick={toggleForm}>
                  로그인
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 로그인 폼에 성공 콜백 전달 */}
              <SigninForm onSigninSeccess={handleSigninSuccess} />
              <div className="form-footer">
                계정이 없으신가요?{' '}
                <button className="switch-btn" onClick={toggleForm}>
                  회원가입
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
