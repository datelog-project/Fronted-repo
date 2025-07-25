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
  const geocoder = useRef<any>(null);

  // 지도 생성 (selectedPlace 좌표가 있으면 그 좌표 기준, 없으면 서울 기준)
  useEffect(() => {
    if (window.kakao?.maps && mapRef.current && !mapInstance.current) {
      const centerLatLng = selectedPlace
        ? new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng)
        : new window.kakao.maps.LatLng(37.5665, 126.978);

      mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
        center: centerLatLng,
        level: 3,
      });
      geocoder.current = new window.kakao.maps.services.Geocoder();
    }
  }, [selectedPlace]);

  // selectedPlace 변경 시 마커 및 지도 센터 이동
  useEffect(() => {
    if (!mapInstance.current) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    if (selectedPlace) {
      const coords = new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
      mapInstance.current.setCenter(coords);

      const marker = new window.kakao.maps.Marker({
        map: mapInstance.current,
        position: coords,
        title: selectedPlace.name || '선택된 위치',
      });

      markerRef.current = marker;
    }
  }, [selectedPlace]);

  // 주소 변환 헬퍼
  const getAccurateAddress = (result: any[]) => {
    for (let i = 0; i < result.length; i++) {
      if (result[i].road_address?.address_name) return result[i].road_address.address_name;
      if (result[i].address?.address_name) return result[i].address.address_name;
    }
    return '';
  };

  // 좌표 → 주소 변환 함수
  const fetchAccurateAddress = (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!geocoder.current) return reject('지오코더 없음');

      geocoder.current.coord2Address(lng, lat, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const address = getAccurateAddress(result);
          resolve(address);
        } else {
          reject('주소 변환 실패');
        }
      });
    });
  };

  // 키워드 검색 → 좌표 → 정확한 주소 → onSelectPlace 호출
  useEffect(() => {
    if (!window.kakao?.maps || !keyword.trim() || !mapInstance.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, async (data: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);

        try {
          const accurateAddress = await fetchAccurateAddress(lat, lng);

          onSelectPlace({
            name: place.place_name,
            address: accurateAddress,
            lat,
            lng,
          });

          onSearchDone?.();
        } catch {
          onSelectPlace({
            name: place.place_name,
            address: place.road_address_name || place.address_name || '',
            lat,
            lng,
          });
          onSearchDone?.();
        }
      }
    });
  }, [keyword]);

  // 지도 클릭 시 좌표 → 주소 변환 후 onSelectPlace 호출
  useEffect(() => {
    if (!mapInstance.current || !geocoder.current) return;

    const clickListener = window.kakao.maps.event.addListener(
      mapInstance.current,
      'click',
      (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        fetchAccurateAddress(lat, lng)
          .then((address) => {
            onSelectPlace({
              name: '',
              address,
              lat,
              lng,
            });
          })
          .catch(() => {
            onSelectPlace({
              name: '',
              address: '',
              lat,
              lng,
            });
          });
      }
    );

    return () => {
      if (clickListener && typeof clickListener.remove === 'function') {
        clickListener.remove();
      }
    };
  }, [onSelectPlace]);

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
