import { api } from '../api/api'; // Axios 인스턴스
import { useNavigate } from 'react-router-dom';

function EndConnection({ connectionId }: { connectionId: string }) {
  const navigate = useNavigate();

  const handleEndConnection = async () => {
    const confirm = window.confirm("정말 연결을 종료하시겠습니까?");
    if (!confirm) return;

    try {
      const res = await api.post(`/connections/${connectionId}/end`);
      alert(res.data.message || "연결이 종료되었습니다.");
      navigate('/invite'); // 연결 해제 후 다시 초대 페이지로 이동
    } catch (err: any) {
      alert(err?.response?.data?.message || "오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>💑 연결된 상태입니다!</h2>
      <button onClick={handleEndConnection} style={{ marginTop: '1rem', backgroundColor: 'tomato', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px' }}>
        연결 끊기
      </button>
    </div>
  );
}
