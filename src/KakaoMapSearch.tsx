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
  onSearchDone: () => void; // 검색 후 처리 콜백 (optional)
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMapSearch({ selectedPlace, onSelectPlace, keyword, onSearchDone }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!window.kakao?.maps) return;
    if (!mapRef.current) return;

    const mapContainer = mapRef.current;
    const mapOption = {
      center: selectedPlace
        ? new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng)
        : new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 기본 좌표
      level: 3,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOption);

    // 기존 마커 제거 함수
    const clearMarkers = () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };

    // 장소 선택 시 마커 표시
    if (selectedPlace) {
      clearMarkers();
      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng),
      });
      markersRef.current.push(marker);
      map.setCenter(marker.getPosition());
    }

    // 키워드가 있으면 검색
    if (keyword.trim()) {
      const ps = new window.kakao.maps.services.Places();

      ps.keywordSearch(keyword, function (data: any[], status: string) {
        if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
          clearMarkers();

          // 첫 번째 결과만 선택
          const place = data[0];
          const coords = new window.kakao.maps.LatLng(place.y, place.x);

          const marker = new window.kakao.maps.Marker({
            map,
            position: coords,
          });
          markersRef.current.push(marker);
          map.setCenter(coords);

          onSelectPlace({
            name: place.place_name,
            address: place.address_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
          });

          if (onSearchDone) onSearchDone();
        }
      });
    }

    return () => {
      clearMarkers();
    };
  }, [keyword, selectedPlace, onSelectPlace, onSearchDone]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px', borderRadius: '10px', border: '1px solid #ddd' }}
    />
  );
}
