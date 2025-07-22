import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import KakaoMapSearch from '../KakaoMapSearch';
import type { UserInfoResponse } from '../App';

interface EditWithLogPageProps {
  userInfo: UserInfoResponse;
  handleLogout: () => Promise<void>;
}

export default function EditWithLogPage({ handleLogout }: EditWithLogPageProps) {
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
    });
  }, [withLogId]);

  const handlePlaceSelect = (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      placeName: place.name,
      placeAddress: place.address,
      placeLat: place.lat,
      placeLng: place.lng,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'feelingScore' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!withLogId) return;

    api.put(`/with-logs/${withLogId}`, formData).then(() => {
      navigate(`/with-logs/${withLogId}/details`);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        제목:
        <input
          type="text"
          name="placeName"
          value={formData.placeName}
          onChange={handleChange}
          placeholder="장소 제목을 입력하세요"
          required
        />
      </label>

      <label>
        날짜:
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
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
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
        />
      </label>

      <label>
        비용:
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          min={0}
          step={1}
        />
      </label>

      <KakaoMapSearch
        selectedPlace={
          formData.placeLat && formData.placeLng
            ? {
                name: formData.placeName,
                address: formData.placeAddress,
                lat: formData.placeLat,
                lng: formData.placeLng,
              }
            : null
        }
        onSelectPlace={handlePlaceSelect}
      />

      <button type="submit">수정 완료</button>
      <button type="button" onClick={() => navigate(-1)}>취소</button>
      <button type="button" onClick={handleLogout}>로그아웃</button>
    </form>
  );
}
