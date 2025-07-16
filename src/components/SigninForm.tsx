import React, { useState } from 'react';

interface SigninFormProps {
  onSigninSeccess: (email: string, password: string) => void;
}

const SigninForm: React.FC<SigninFormProps> = ({ onSigninSeccess }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSigninSeccess(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <label>이메일</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <label>비밀번호</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">로그인</button>
    </form>
  );
};


export default SigninForm;
