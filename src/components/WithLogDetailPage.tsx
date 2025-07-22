import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import KakaoMap from '../KakaoMap';
import type { UserInfoResponse } from '../App';
import './WithLogDetailPage.css'

interface WithLogDetailPageProps {
  userInfo: UserInfoResponse;
  handleLogout: () => Promise<void>;
}

export default function WithLogDetailPage({ userInfo, handleLogout }: WithLogDetailPageProps) {
  const { withLogId } = useParams<{ withLogId: string }>();
  const [log, setLog] = useState<null | {
    date: string;
    placeName: string;
    placeAddress: string;
    feelingScore: number;
    note: string;
    cost: number;    
    placeLat: number | null;
    placeLng: number | null;
  }>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!withLogId) return;

    api.get(`/with-logs/${withLogId}/details`).then((res) => setLog(res.data));
  }, [withLogId]);

  if (!log) return <div>Loading...</div>;

  return (
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

      {log.placeLat && log.placeLng && (
        <div className="map-wrapper">
          <KakaoMap lat={log.placeLat} lng={log.placeLng} />
        </div>
      )}

      <div className="buttons">
        <button
          onClick={() => navigate(`/with-logs/${withLogId}/edit`)}
          className="button"
        >
          수정하기
        </button>
        <button onClick={handleLogout} className="button logout">
          로그아웃
        </button>
      </div>
    </div>
  );
}
