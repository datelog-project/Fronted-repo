import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import KakaoMap from '../KakaoMap';
import HeaderBar from './HeaderBar';
import type { UserInfoResponse } from '../App';
import './WithLogDetailPage.css';

interface Media {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
}

interface LogDetail {
  date: string;
  placeName: string;
  placeAddress: string;
  feelingScore: number;
  note: string;
  cost: number;
  placeLat: number | null;
  placeLng: number | null;
  mediaList?: Media[];
}

interface WithLogDetailPageProps {
  userInfo: UserInfoResponse;
  handleLogout: () => Promise<void>;
}

export default function WithLogDetailPage({ userInfo, handleLogout }: WithLogDetailPageProps) {
  const { withLogId } = useParams<{ withLogId: string }>();
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState('');
  
  // 공유하기 상태 추가
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!withLogId) return;
    setLoading(true);
    api.get(`/with-logs/${withLogId}/details`)
      .then((res) => setLog(res.data))
      .catch(() => alert('게시글 정보를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [withLogId]);

  const handleImageClick = (src: string) => {
    setModalImgSrc(src);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImgSrc('');
  };

  // 공유 링크 생성 함수
  const createShareLink = async () => {
    if (!withLogId) return;
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await api.post(`/with-logs/${withLogId}/share`);
      // 백엔드에서 { message: "...", shareUrl: "http://localhost:8080/share/..." } 형식 반환 가정
      setShareUrl(res.data.shareUrl || '');
    } catch (error: any) {
      setShareError(error.response?.data?.message || '공유 링크 생성에 실패했습니다.');
    } finally {
      setShareLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    alert('공유 링크가 복사되었습니다!');
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!log) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="withlog-detail-page">
      <HeaderBar
        userName={userInfo.userName}
        partnerName={userInfo.partnerName}
        handleLogout={handleLogout}
        showSearch={false}
      />

      <div className="container">
        <h2 className="title">{log.date}</h2>
        <p className="text">
          <strong>제목:</strong> {log.placeName || '(제목 없음)'} ({log.placeAddress})
        </p>
        <p className="text">
          <strong>데이트 비용:</strong> {log.cost?.toLocaleString()} 원
        </p>
        <p className="text">
          <div className="score-bar-wrapper"> 
            <strong>만족도 :</strong>
            <div className="score-bar-bg">
              <div
                className="score-bar-fill"
                style={{ width: `${(log.feelingScore / 10) * 100}%` }}
              ></div>
            </div>
            <span className="score-label">{log.feelingScore}점</span>
          </div>
        </p>
        <p className="text memo">
          <strong>내용:</strong> {log.note}
        </p>

        {/* 미디어 한 장씩 세로로, 클릭 시 확대 */}
        {log.mediaList && log.mediaList.length > 0 && (
          <div className="media-list-vertical">
            {log.mediaList.map((media, idx) => {
              const baseUrl = 'http://localhost:8080'; // 필요시 수정
              const fullUrl = media.mediaUrl.startsWith('http')
                ? media.mediaUrl
                : baseUrl + media.mediaUrl;
              const encodedUrl = encodeURI(fullUrl);

              return (
                <div key={idx} className="media-item">
                  {media.mediaType === 'IMAGE' ? (
                    <img
                      src={encodedUrl}
                      alt={`media-${idx}`}
                      onClick={() => handleImageClick(encodedUrl)}
                    />
                  ) : (
                    <video src={encodedUrl} controls />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 지도 */}
        {log.placeLat && log.placeLng && (
          <div className="map-wrapper">
            <KakaoMap lat={log.placeLat} lng={log.placeLng} />
          </div>
        )}

        {/* 공유하기 섹션 */}
        <div className="share-section">
          {shareUrl ? (
            <>
              <p>공유 링크가 생성되었습니다:</p>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="share-link-input"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                title="클릭하여 복사"
              />
              <button onClick={copyToClipboard} className="button">
                복사하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={createShareLink}
                disabled={shareLoading}
                className="button"
              >
                {shareLoading ? '생성 중...' : '공유 링크 생성'}
              </button>
              {shareError && <p className="error-message">{shareError}</p>}
            </>
          )}
        </div>

        <div className="buttons">
        <button onClick={() => navigate(`/with-logs/${withLogId}/edit`)} className="button">
          수정하기
        </button>
        <button onClick={() => navigate('/')} className="button">
          메인페이지로 가기
        </button>
</div>
      </div>

      {/* 이미지 확대 모달 */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImgSrc} alt="확대 이미지" />
            <button className="modal-close-btn" onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
