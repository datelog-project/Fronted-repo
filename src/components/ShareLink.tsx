import React, { useState } from 'react';
import { api } from '../api/api'; // axios 인스턴스 예시
import './ShareLink.css';

interface ShareLinkProps {
  withLogId: string;  // 게시글 UUID
}

const ShareLink: React.FC<ShareLinkProps> = ({ withLogId }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShareLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/with-logs/${withLogId}/share`);
      setShareUrl(response.data.shareUrl || response.data.message || response.data);
    } catch (e: any) {
      setError(e.response?.data?.message || '공유 링크 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    alert('공유 링크가 복사되었습니다!');
  };

  return (
    <div className="share-link-container">
      {shareUrl ? (
        <>
          <p>공유 링크가 생성되었습니다:</p>
          <input type="text" readOnly value={shareUrl} className="share-link-input" />
          <button onClick={copyToClipboard}>복사하기</button>
        </>
      ) : (
        <>
          <button onClick={createShareLink} disabled={loading}>
            {loading ? '생성 중...' : '공유 링크 생성'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </>
      )}
    </div>
  );
};

export default ShareLink;
