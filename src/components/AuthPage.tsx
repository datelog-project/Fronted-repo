import React from 'react';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import logo from '../assets/withlog_logo.png';
import './AuthPage.css';

interface Props {
  showSignup: boolean;
  onToggle: () => void;
  onLogin: () => void;
}

const AuthPage: React.FC<Props> = ({ showSignup, onToggle, onLogin }) => {
  return (
    <div className="book-container">
      <div className="left-page">
        <img src={logo} alt="logo" className="logo-img" />
      </div>
      <div className="right-page">
        <div className="form-wrapper">
          {showSignup ? (
            <>
              <SignupForm onRegisterSuccess={onLogin} />
              <div className="form-footer">
                이미 회원이신가요? <button className="switch-btn" onClick={onToggle}>로그인</button>
              </div>
            </>
          ) : (
            <>
              <SigninForm onLoginSuccess={onLogin} />
              <div className="form-footer">
                계정이 없으신가요? <button className="switch-btn" onClick={onToggle}>회원가입</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;