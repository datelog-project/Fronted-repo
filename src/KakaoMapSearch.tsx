import React, { useEffect, useRef, useState } from 'react';

interface Props {
  selectedPlace: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null;
  onSelectPlace: (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMapSearch({ selectedPlace, onSelectPlace }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!window.kakao?.maps) return;

    const mapContainer = mapRef.current;
    const mapOption = {
      center: selectedPlace
        ? new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng)
        : new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOption);

    if (selectedPlace) {
      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng),
      });
      map.setCenter(marker.getPosition());
    }

    const ps = new window.kakao.maps.services.Places();

    const search = () => {
      if (!keyword.trim()) return;

      ps.keywordSearch(keyword, function (data: any[], status: string) {
        if (status === window.kakao.maps.services.Status.OK) {
          const place = data[0];
          const coords = new window.kakao.maps.LatLng(place.y, place.x);
          map.setCenter(coords);

          new window.kakao.maps.Marker({
            map,
            position: coords,
          });

          onSelectPlace({
            name: place.place_name,
            address: place.address_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
          });
        }
      });
    };

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        search();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [keyword, selectedPlace, onSelectPlace]);

  return (
    <div>
      <input
        placeholder="장소 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div ref={mapRef} style={{ width: '100%', height: '300px', marginTop: '10px' }} />
    </div>
  );
}
