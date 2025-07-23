import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import KakaoMapSearch from '../KakaoMapSearch';
import HeaderBar from './HeaderBar';
import type { UserInfoResponse } from '../App';
import './EditWithLogPage.css';

interface EditWithLogPageProps {
  userInfo: UserInfoResponse;
  handleLogout: () => Promise<void>;
}

export default function EditWithLogPage({ userInfo, handleLogout }: EditWithLogPageProps) {
  const { withLogId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: '',
    feelingScore: 5,
    note: '',
    placeName: '',
    placeAddress: '',
    placeLat: null as number | null,
    placeLng: null as number | null,
    cost: 0,
  });

  const [keyword, setKeyword] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [originalMediaUrls, setOriginalMediaUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (!withLogId) return;
    api.get(`/with-logs/${withLogId}/details`).then((res) => {
      const data = res.data;

      setFormData({
        date: data.date,
        feelingScore: data.feelingScore,
        note: data.note,
        placeName: data.placeName,
        placeAddress: data.placeAddress,
        placeLat: data.placeLat,
        placeLng: data.placeLng,
        cost: data.cost ?? 0,
      });

      setKeyword(data.placeName || '');

      // mediaList -> mediaUrls 형태로 변환
      const fixedUrls = (data.mediaList || []).map((media: { mediaUrl: string }) => {
        if (media.mediaUrl.startsWith('http')) return media.mediaUrl;
        return 'http://localhost:8080' + media.mediaUrl; // 필요시 환경변수로 대체 가능
      });

      setExistingImages(fixedUrls);
      setOriginalMediaUrls(fixedUrls);
    });
  }, [withLogId]);

  // keyword가 빈 문자열일 때 장소 정보 초기화
  useEffect(() => {
    if (keyword.trim() === '') {
      setFormData((prev) => ({
        ...prev,
        placeName: '',
        placeAddress: '',
        placeLat: null,
        placeLng: null,
      }));
    }
  }, [keyword]);

  const handlePlaceSelect = useCallback(
    (place: { name: string; address: string; lat: number; lng: number }) => {
      setFormData((prev) => ({
        ...prev,
        placeName: place.name,
        placeAddress: place.address,
        placeLat: place.lat,
        placeLng: place.lng,
      }));
      // setKeyword(place.name); // 불필요한 재검색 방지 위해 주석
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'feelingScore' || name === 'cost' ? Number(value) : value,
    }));
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setNewImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleImageDelete = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExistingImageDelete = (urlToDelete: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToDelete));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!withLogId) return;

    const requestData = {
      date: formData.date,
      note: formData.note,
      feelingScore: formData.feelingScore,
      cost: formData.cost,
      placeName: formData.placeName,
      placeAddress: formData.placeAddress,
      placeLat: formData.placeLat,
      placeLng: formData.placeLng,
      // 기존 이미지들(mediaList) 서버가 요구하는 형태에 맞게 변환
      mediaList: existingImages.map((url) => ({
        mediaUrl: url,
        mediaType: "IMAGE", // 필요시 실제 타입 맞게 조정
      })),
    };

    const form = new FormData();

    // JSON 객체를 Blob으로 감싸서 'request' key에 넣기 (중요)
    form.append('request', new Blob([JSON.stringify(requestData)], { type: "application/json" }));

    // 새로 추가한 이미지 파일들 (멀티파트 파일)
    newImages.forEach((file) => form.append('images', file));

    api.put(`/with-logs/${withLogId}`, form)
      .then(() => {
        navigate(`/with-logs/${withLogId}/details`);
      });
  };

  const selectedPlace = useMemo(() => {
    if (formData.placeLat && formData.placeLng) {
      return {
        name: formData.placeName,
        address: formData.placeAddress,
        lat: formData.placeLat,
        lng: formData.placeLng,
      };
    }
    return null;
  }, [formData.placeName, formData.placeAddress, formData.placeLat, formData.placeLng]);

  return (
    <div className="edit-withlog-page">
      <HeaderBar
        userName={userInfo.userName}
        partnerName={userInfo.partnerName}
        handleLogout={handleLogout}
        showSearch={false}
      />

      <div className="container" style={{ paddingTop: '80px' }}>
        <form onSubmit={handleSubmit} className="edit-form">
          <label>
            제목:
            <input type="text" name="placeName" value={formData.placeName} onChange={handleChange} required />
          </label>

          <label>
            날짜:
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>

          <label>
            기분 점수:
            <input
              type="number"
              name="feelingScore"
              value={formData.feelingScore}
              onChange={handleChange}
              min={1}
              max={10}
              required
            />
          </label>

          <label>
            메모:
            <textarea name="note" value={formData.note} onChange={handleChange} />
          </label>

          <label>
            비용:
            <input type="number" name="cost" value={formData.cost} onChange={handleChange} min={0} step={1} />
          </label>

          <label>
            장소 검색어:
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="장소를 검색하세요"
            />
          </label>

          <KakaoMapSearch
            selectedPlace={selectedPlace}
            onSelectPlace={handlePlaceSelect}
            keyword={keyword}
            onSearchDone={() => {}}
          />

          {/* 기존 사진 목록 */}
          <div className="existing-media-list">
            <label>기존 사진</label>
            <div className="media-thumbnails">
              {existingImages.length === 0 && <p>사진이 없습니다.</p>}
              {existingImages.map((url) => (
                <div className="media-thumb" key={url}>
                  <img
                    src={url}
                    alt="uploaded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                  />
                  <button type="button" className="editpage__delete-btn" onClick={() => handleExistingImageDelete(url)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 새 사진 추가 및 미리보기 */}
          <div className="new-media-list">
            <label>새 사진 추가</label>
            <div className="media-thumbnails">
              {newImages.map((file, idx) => (
                <div className="media-thumb" key={idx}>
                  <img src={URL.createObjectURL(file)} alt="preview" />
                  <button type="button" className="delete-btn" onClick={() => handleImageDelete(idx)}>
                    ×
                  </button>
                </div>
              ))}
              <label className="add-media-btn">
                +
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAdd} />
              </label>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              수정 완료
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
