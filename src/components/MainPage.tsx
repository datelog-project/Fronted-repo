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
  const [searchText, setSearchText] = useState('');

  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [feelingScore, setFeelingScore] = useState<number | null>(null);
  const [totalCostForMonth, setTotalCostForMonth] = useState(0);
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:8080';

  // 게시글 삭제
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

  // 게시글 상세 페이지 이동
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

  // withLogs 불러오기
  useEffect(() => {
    if (!userConnectionId) return;

    setLoading(true);
    api.get(`/with-logs/${userConnectionId}`)
      .then(res => {
        const previews = res.data.map((log: any) => {
          let thumbUrl = log.thumbnailUrl;

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

  // 선택한 월에 대한 총 비용 계산
  useEffect(() => {
    if (!selectedMonth) {
      setTotalCostForMonth(0);
      return;
    }

    const filteredByMonth = withLogs.filter(log => log.date.startsWith(selectedMonth));
    const sumCost = filteredByMonth.reduce((sum, log) => sum + (log.cost ?? 0), 0);
    setTotalCostForMonth(sumCost);
  }, [selectedMonth, withLogs]);

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

          <div style={{ marginBottom: '20px', fontWeight: '600', color: '#4a90e2' }}>
            {selectedMonth ? (
              <>총 데이트 비용: {totalCostForMonth.toLocaleString()} 원</>
            ) : (
              <>월을 선택하면 총 데이트 비용이 표시됩니다.</>
            )}
          </div>

          <label>
            기분 점수: {feelingScore ?? '선택 안함'}
            <input
              type="range"
              min={1}
              max={10}
              value={feelingScore ?? 5}
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
            <div className="empty-message">조건에 맞는 게시글이 없습니다.</div>
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
                      e.stopPropagation();
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
