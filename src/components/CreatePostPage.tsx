import React, { useState } from 'react';
import { api } from '../api/api'; // axios 인스턴스
import KakaoMapSearch from '../KakaoMapSearch'; // 장소 선택 컴포넌트
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import './CreatePostPage.css';

interface PlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MediaRequest {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
}

interface CreatePostPageProps {
  userConnectionId: string;
  userInfo: {
    userName: string;
    partnerName: string | null;
  };
  handleLogout: () => void;
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({
  userConnectionId,
  userInfo,
  handleLogout,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null);
  const [date, setDate] = useState('');
  const [feelingScore, setFeelingScore] = useState(5);
  const [note, setNote] = useState('');
  const [mediaList, setMediaList] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedPlace) {
      alert('장소를 선택해주세요.');
      return;
    }

    const postData = {
      date,
      placeName: selectedPlace.name,
      placeAddress: selectedPlace.address,
      placeLat: selectedPlace.lat,
      placeLng: selectedPlace.lng,
      feelingScore,
      note,
      mediaList: mediaList.length > 0 ? mediaList : null,
    };

    try {
      setLoading(true);
      await api.post(`/with-logs/${userConnectionId}`, postData);
      alert('게시글이 등록되었습니다!');
      navigate('/main'); // 성공 후 메인으로 이동
    } catch (err) {
      console.error(err);
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page create-post-wrapper">
      <HeaderBar
        userName={userInfo.userName}
        partnerName={userInfo.partnerName}
        handleLogout={handleLogout}
        showSearch={false}
      />

      <div className="create-post-container">
        <h2>📌 게시글 작성</h2>

        {/* 이하 폼 요소 동일 */}
        <label htmlFor="date-input">날짜</label>
        <input
          id="date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>장소 검색</label>
        <div className="map-wrapper">
          <KakaoMapSearch onSelectPlace={setSelectedPlace} />
        </div>

        {selectedPlace && (
          <div className="selected-place">
            <p><strong>선택된 장소:</strong> {selectedPlace.name}</p>
            <p><strong>주소:</strong> {selectedPlace.address}</p>
          </div>
        )}

        <label htmlFor="feeling-input">기분 점수 (1~10)</label>
        <input
          id="feeling-input"
          type="number"
          min={1}
          max={10}
          value={feelingScore}
          onChange={(e) => setFeelingScore(Number(e.target.value))}
        />

        <label htmlFor="note-input">내용</label>
        <textarea
          id="note-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="오늘의 데이트를 기록하세요 :)"
        />

        <label htmlFor="media-input">미디어 URL 추가</label>
        <input
          id="media-input"
          type="text"
          placeholder="https://example.com/image.jpg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const url = e.currentTarget.value.trim();
              if (!url) return;
              const type = url.endsWith('.mp4') ? 'VIDEO' : 'IMAGE';
              setMediaList((prev) => [...prev, { mediaUrl: url, mediaType: type }]);
              e.currentTarget.value = '';
            }
          }}
        />

        {mediaList.length > 0 && (
          <ul className="media-list">
            {mediaList.map((m, idx) => (
              <li key={idx}>
                {m.mediaType} - {m.mediaUrl}
              </li>
            ))}
          </ul>
        )}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? '등록 중...' : '게시글 등록하기'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostPage;
