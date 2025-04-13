import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, CloudRain, Sun, CloudSun, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentWeatherProps {
  className?: string;
  location: string; // Nhận vị trí từ props
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ className, location }) => {
  const [weather, setWeather] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState<string>('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: location,
        });
        const weatherData = response.data.weather;
        setWeather(weatherData);

        // Tạo thông báo tùy chỉnh dựa trên điều kiện thời tiết
        const condition = weatherData.weather_condition.toLowerCase();
        if (condition.includes('rain') || condition.includes('thunderstorm')) {
          setCustomMessage('Hôm nay trời mưa, hãy mang theo ô và áo mưa!');
        } else if (condition.includes('clear') || condition.includes('sunny')) {
          setCustomMessage('Hôm nay trời nắng đẹp, thích hợp để ra ngoài!');
        } else if (condition.includes('cloud')) {
          setCustomMessage('Hôm nay trời nhiều mây, thời tiết mát mẻ.');
        } else {
          setCustomMessage('Thời tiết hôm nay ổn, bạn có thể ra ngoài thoải mái.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thời tiết hiện tại:', error);
      }
    };
    fetchWeather();
  }, [location]);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="text-white h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />;
    switch (weather.weather_condition.toLowerCase()) {
      case 'rain':
      case 'thunderstorm':
        return <CloudRain className="text-white h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />;
      case 'cloudy':
      case 'clouds':
        return <Cloud className="text-white h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />;
      case 'clear':
      case 'sunny':
        return <Sun className="text-white h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />;
      default:
        return <CloudSun className="text-white h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />;
    }
  };

  if (!weather) return <div>Đang tải...</div>;

  return (
    <div className={cn('text-center animate-fade-in', className)}>
      {/* Hiển thị vị trí */}
      <div className="flex justify-center items-center mb-2">
        <MapPin className="text-white h-6 w-6 mr-2" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold text-white">{location}</h2>
      </div>

      {/* Biểu tượng thời tiết */}
      <div className="flex justify-center items-center mb-2">{getWeatherIcon()}</div>

      {/* Nhiệt độ */}
      <div className="text-white font-light mb-2">
        <span className="text-6xl sm:text-7xl tracking-tighter">{Math.round(weather.temperature)}°</span>
      </div>

      {/* Mô tả thời tiết */}
      <div className="text-white/90 text-xl sm:text-2xl font-medium mb-1">{weather.weather_condition}</div>

      {/* Thông báo tùy chỉnh */}
      <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto leading-tight px-4">
        {customMessage}
      </p>
    </div>
  );
};

export default CurrentWeather;