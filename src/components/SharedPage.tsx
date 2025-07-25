import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import KakaoMap from '../KakaoMap';
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

export default function SharedPage() {
  const { sharedLinkId } = useParams<{ sharedLinkId: string }>();
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState('');

  useEffect(() => {
    if (!sharedLinkId) return;
    setLoading(true);
    api.get(`/share/${sharedLinkId}`)
      .then(res => setLog(res.data))
      .catch(() => alert('공유 게시글 정보를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [sharedLinkId]);

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

        {log.mediaList && log.mediaList.length > 0 && (
          <div className="media-list-vertical">
            {log.mediaList.map((media, idx) => {
              const baseUrl = 'http://localhost:8080';
              const fullUrl = media.mediaUrl.startsWith('http') ? media.mediaUrl : baseUrl + media.mediaUrl;
              const encodedUrl = encodeURI(fullUrl);

              return (
                <div key={idx} className="media-item">
                  {media.mediaType === 'IMAGE' ? (
                    <img src={encodedUrl} alt={`media-${idx}`} onClick={() => handleImageClick(encodedUrl)} />
                  ) : (
                    <video src={encodedUrl} controls />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {log.placeLat && log.placeLng && (
          <div className="map-wrapper">
            <KakaoMap lat={log.placeLat} lng={log.placeLng} />
          </div>
        )}

        {/* 공유 페이지는 수정, 로그아웃 버튼 없음 */}

      </div>

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
