import React, { useState } from 'react';
import api from '../api/api'; // axios 등 API 모듈 임포트

interface SignupFormProps {
  onRegisterSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        password,
      });
      alert('회원가입 성공!');
      onRegisterSuccess();
    } catch (error: any) {
      alert('회원가입 실패: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <div>
        <label>이름</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>비밀번호 확인</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
};

export default SignupForm;
