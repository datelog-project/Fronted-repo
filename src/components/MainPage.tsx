import React, { useEffect, useState } from 'react';
import './MainPage.css';
import type { UserInfoResponse } from '../App';
import api from '../api/api';
import KakaoMap from '../KakaoMap';
import defaultThumbnail from '../assets/withlog_logo.png';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

interface MainPageProps {
  userInfo: UserInfoResponse;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfoResponse | null>>;
  handleLogout: () => void;
}

interface WithLogPreviewResponse {
  id: string;
  placeName: string;
  placeAddress: string;
  placeLat: number;
  placeLng: number;
  date: string;
  thumbnailUrl: string | null;
  previewNote: string | null;
  cost: number | null;
  feelingScore: number | null;
}

const MainPage: React.FC<MainPageProps> = ({ userInfo, handleLogout }) => {
  const { partnerName, userName, userConnectionId } = userInfo;
  const [withLogs, setWithLogs] = useState<WithLogPreviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:8080';

  // 필터 상태
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [feelingScore, setFeelingScore] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/with-logs/${id}`);
      setWithLogs(prev => prev.filter(log => log.id !== id));
      alert('게시글이 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleClickPost = (withLogId: string) => {
    navigate(`/with-logs/${withLogId}/details`);
  };

  // 필터링된 게시글 리스트
  const filteredLogs = withLogs.filter(log => {
    if (selectedMonth && !log.date.startsWith(selectedMonth)) return false;

    if (searchText) {
      const keyword = searchText.toLowerCase();
      const combined = `${log.placeName} ${log.placeAddress} ${log.previewNote}`.toLowerCase();
      if (!combined.includes(keyword)) return false;
    }

    if (feelingScore !== null && log.feelingScore !== null && log.feelingScore < feelingScore) return false;

    return true;
  });

  useEffect(() => {
    if (!userConnectionId) return;

    setLoading(true);
    api.get(`/with-logs/${userConnectionId}`)
      .then(res => {
        const previews = res.data.map((log: any) => {
          let thumbUrl = log.thumbnailUrl;

          // thumbnailUrl이 있을 때, 절대경로로 변환
          if (thumbUrl && !thumbUrl.startsWith('http')) {
            if (!thumbUrl.startsWith('/')) {
              thumbUrl = '/' + thumbUrl;
            }
            thumbUrl = BASE_URL + thumbUrl;
          }

          return {
            id: log.id,
            placeName: log.placeName,
            placeAddress: log.placeAddress,
            placeLat: log.placeLat,
            placeLng: log.placeLng,
            date: log.date,
            thumbnailUrl: thumbUrl,
            previewNote: log.previewNote ?? log.note ?? '',
            cost: log.cost ?? null,
            feelingScore: log.feelingScore ?? null,
          };
        });
        setWithLogs(previews);
      })
      .catch(err => {
        console.error('게시글 목록 불러오기 실패', err);
        setWithLogs([]);
      })
      .finally(() => setLoading(false));
  }, [userConnectionId]);

  return (
    <div className="main-page">
      <HeaderBar
        userName={userName}
        partnerName={partnerName}
        handleLogout={handleLogout}
        showSearch={true}
        searchText={searchText}
        onSearchChange={e => setSearchText(e.target.value)}
      />

      <div className="main-content">
        <aside className="filter-sidebar">
          <h3>필터</h3>
          <label>
            월별
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </label>

          <label>
            기분 점수: {feelingScore ?? '선택 안함'}
            <input
              type="range"
              min={1}
              max={10}
              value={feelingScore ?? 5} // 기본값 5
              onChange={e => setFeelingScore(Number(e.target.value))}
            />
            <button
              type="button"
              className="reset-feeling-btn"
              onClick={() => setFeelingScore(null)}
            >
              초기화
            </button>
          </label>
        </aside>

        <section className="content-area">
          <button
            className="write-post-btn"
            onClick={() => {
              if (!userConnectionId) {
                alert("아직 연결된 상대가 없습니다.");
                return;
              }
              navigate(`/create-post?connectionId=${userConnectionId}`);
            }}
          >
            게시글 작성
          </button>

          {loading ? (
            <p>게시글 로딩중...</p>
          ) : filteredLogs.length === 0 ? (
            <p>조건에 맞는 게시글이 없습니다.</p>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="with-log-card"
                onClick={() => handleClickPost(log.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="with-log-map" onClick={(e) => e.stopPropagation()}>
                  <KakaoMap lat={log.placeLat} lng={log.placeLng} />
                </div>
                <div className="with-log-content">
                  <img
                    src={log.thumbnailUrl || defaultThumbnail}
                    alt="썸네일"
                    className="with-log-thumbnail"
                  />
                  <div className="with-log-text">
                    <h2>{log.placeName}</h2>
                    <p>{log.date}</p>
                    <p>{log.previewNote}</p>
                    <p>기분 점수: {log.feelingScore ?? '-'}</p>
                    <p>비용: {log.cost !== null ? `${log.cost.toLocaleString()} 원` : '-'}</p>
                  </div>
                  <button
                    className="mainpage__delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // 삭제 버튼 클릭 시 상세 페이지 이동 방지
                      handleDelete(log.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default MainPage;
