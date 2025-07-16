import React, { useState } from 'react';

interface SignupFormProps {
  onRegisterSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    console.log('회원가입 시도:', { email, password });
    onRegisterSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <div>
        <label>이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
        />
      </div>
      <button type="submit">회원가입</button>
    </form>
  );
};

export default SignupForm;