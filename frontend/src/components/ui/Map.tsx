// src/components/ui/Map.tsx
import React from 'react';

interface MapProps {
  height?: string;
  className?: string;
  lat?: number;
  lon?: number;
  zoom?: number; // Thêm prop zoom
}

const Map: React.FC<MapProps> = ({
  height = '400px',
  className,
  lat = 10.7769,
  lon = 106.7009,
  zoom = 10, // Tăng mức zoom mặc định lên 10
}) => {
  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&zoom=${zoom}&level=surface&overlay=wind&product=ecmwf&lat=${lat}&lon=${lon}`;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={windyUrl}
        width="100%"
        height={height}
        frameBorder="0"
        title="Windy Weather Map"
        className="pointer-events-auto"
        key={`${lat}-${lon}-${zoom}`} // Thêm zoom vào key để làm mới khi zoom thay đổi
      ></iframe>
    </div>
  );
};

export default Map;