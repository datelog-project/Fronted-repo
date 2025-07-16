import React, { useState } from 'react';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css';

interface AuthPageProps {
  onSignin: (email: string, password: string) => void; 
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignin }) => {
  const [showSignup, setShowSignup] = useState(false);

  const toggleForm = () => setShowSignup(prev => !prev);

  return (
    <div className="book-container">
      <div className="left-page">
        <img src={logo} alt="WithLog 로고" className="logo-img" />
      </div>
      <div className="right-page">
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
              <SigninForm onSigninSeccess={onSignin} />
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
