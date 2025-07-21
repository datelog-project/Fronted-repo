import React, { useEffect, useRef } from 'react';

interface KakaoMapProps {
  lat: number;
  lng: number;
}
const KakaoMap: React.FC<KakaoMapProps> = ({ lat, lng }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMap = () => {
      if (!mapContainer.current) return;

      const kakao = (window as any).kakao;

      const map = new kakao.maps.Map(mapContainer.current, {
        center: new kakao.maps.LatLng(lat, lng),
        level: 3,
        scrollwheel: false, 
        draggable: true,
      });
      map.setLevel(map.getLevel(), { animate: false });

      new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng),
        map,
      });
      const zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    };

    if (!(window as any).kakao) {
      const script = document.createElement('script');
      script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).kakao.maps.load(loadMap);
      };
    } else {
      (window as any).kakao.maps.load(loadMap);
    }
  }, [lat, lng]);

  return <div ref={mapContainer} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />;
};

export default KakaoMap
