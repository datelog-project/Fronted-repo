import React, { useState } from 'react';
import { api } from '../api/api'; // axios 인스턴스
import KakaoMapSearch from '../KakaoMapSearch';
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

const BASE_URL = 'http://localhost:8080';

const CreatePostPage: React.FC<CreatePostPageProps> = ({
  userConnectionId,
  userInfo,
  handleLogout,
}) => {
  const [title, setTitle] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null);
  const [date, setDate] = useState('');
  const [feelingScore, setFeelingScore] = useState(5);
  const [note, setNote] = useState('');
  const [cost, setCost] = useState('');
  const [mediaList, setMediaList] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(''); // 검색 버튼 누를 때 값 전달

  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedMedia: MediaRequest[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const mediaUrl = res.data.url;
        const type = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
        uploadedMedia.push({ mediaUrl, mediaType: type });
      } catch (err) {
        console.error('파일 업로드 실패:', err);
        alert(`"${file.name}" 업로드에 실패했습니다.`);
      }
    }

    setMediaList((prev) => [...prev, ...uploadedMedia]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!selectedPlace) {
      alert('장소를 선택해주세요.');
      return;
    }

    if (!cost || Number(cost) <= 0) {
      alert('비용을 올바르게 입력해주세요.');
      return;
    }

    if (!date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const postData = {
      date,
      placeName: title,
      placeAddress: selectedPlace.address,
      placeLat: selectedPlace.lat,
      placeLng: selectedPlace.lng,
      feelingScore,
      note,
      cost: Number(cost),
      mediaList: mediaList.length > 0 ? mediaList : null,
    };

    try {
      setLoading(true);
      await api.post(`/with-logs/${userConnectionId}`, postData);
      alert('게시글이 등록되었습니다!');
      navigate('/main');
    } catch (err) {
      console.error(err);
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (searchKeyword.trim()) {
      setSelectedPlace(null); // 검색 초기화
      setSearchTrigger(searchKeyword.trim()); // 검색 트리거에 넣어줘서 검색 실행
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

        <label htmlFor="title-input">제목</label>
        <input
          id="title-input"
          type="text"
          placeholder="장소 이름 대신 입력할 제목을 적으세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="date-input">날짜</label>
        <input
          id="date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>장소 검색</label>
        <div className="search-bar">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchClick();
              }
            }}
          />
          <button onClick={handleSearchClick} disabled={!searchKeyword.trim()}>
            검색
          </button>
        </div>

        <div className="map-wrapper">
          <KakaoMapSearch
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            keyword={searchTrigger}
            onSearchDone={() => setSearchTrigger('')} // 검색 끝나면 초기화
          />
        </div>

        {selectedPlace && (
          <div className="selected-place">
            <p>
              <strong>선택된 장소 주소:</strong> {selectedPlace.address}
            </p>
          </div>
        )}

        <label htmlFor="cost-input">비용 (숫자만 입력)</label>
        <input
          id="cost-input"
          type="number"
          min={0}
          step={1}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="예: 10000"
        />

        <label htmlFor="feeling-input">기분 점수 ({feelingScore}점)</label>
        <input
          id="feeling-input"
          type="range"
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

        <label>미디어 첨부 (이미지/영상)</label>
        <div className="file-upload-wrapper">
          <label htmlFor="media-file-input" className="file-upload-button">
            📎 파일 선택하기
          </label>
          <input
            id="media-file-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading && <p className="uploading-text">업로드 중...</p>}
        </div>

        {mediaList.length > 0 && (
          <div className="media-preview-grid">
            {mediaList.map((m, idx) => {
              const fullUrl = m.mediaUrl.startsWith('http') ? m.mediaUrl : BASE_URL + m.mediaUrl;
              const encodedUrl = encodeURI(fullUrl);
              return (
                <div key={idx} className="media-card">
                  {m.mediaType === 'IMAGE' ? (
                    <img src={encodedUrl} alt={`media-${idx}`} />
                  ) : (
                    <video src={encodedUrl} controls />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || uploading}>
          {loading ? '등록 중...' : '게시글 등록하기'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostPage;
