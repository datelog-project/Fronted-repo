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
          <strong>비용:</strong> {log.cost?.toLocaleString()} 원
        </p>
        <p className="text">
          <strong>기분 점수:</strong> {log.feelingScore}
        </p>
        <p className="text memo">
          <strong>메모:</strong> {log.note}
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

        <div className="buttons">
          <button onClick={() => navigate(`/with-logs/${withLogId}/edit`)} className="button">
            수정하기
          </button>
          <button onClick={handleLogout} className="button logout">
            로그아웃
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

