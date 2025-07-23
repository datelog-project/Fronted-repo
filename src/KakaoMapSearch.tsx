import React, { useEffect, useRef } from 'react';

interface PlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  selectedPlace: PlaceInfo | null;
  onSelectPlace: (place: PlaceInfo) => void;
  keyword: string;
  onSearchDone: () => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMapSearch({
  selectedPlace,
  onSelectPlace,
  keyword,
  onSearchDone,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 🌐 최초 한 번만 지도 생성
  useEffect(() => {
    if (window.kakao?.maps && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });
    }
  }, []);

  // 📍 selectedPlace 바뀌면 마커/중심 이동
  useEffect(() => {
    if (!mapInstance.current || !selectedPlace) return;
    const kakao = window.kakao;

    const coords = new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    mapInstance.current.setCenter(coords);

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new kakao.maps.Marker({
      map: mapInstance.current,
      position: coords,
      title: selectedPlace.name,
    });

    markerRef.current = marker;
  }, [selectedPlace]);

  // 🔍 키워드 검색
  useEffect(() => {
    if (!window.kakao?.maps || !keyword.trim() || !mapInstance.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];

        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);

        onSelectPlace({
          name: place.place_name,
          address: place.address_name,
          lat,
          lng,
        });

        onSearchDone?.();
      }
    });
  }, [keyword]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '10px',
        border: '1px solid #ddd',
      }}
    />
  );
}
