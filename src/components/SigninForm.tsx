import React, { useState } from 'react';

interface SigninFormProps {
  onLoginSuccess: () => void;
}

const SigninForm: React.FC<SigninFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 시도:', { email, password });
    onLoginSuccess(); // 성공 처리
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>로그인</h2>
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
      <button type="submit">로그인</button>
    </form>
  );
};

export default SigninForm;