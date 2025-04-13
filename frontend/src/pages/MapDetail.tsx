// src/pages/MapDetail.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import WeatherBackground from '@/components/WeatherBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Map from '../components/ui/Map';
import { useAppContext } from '@/context/AppContext';

const MapDetail = () => {
  const [weatherType, setWeatherType] = useState<'rainy' | 'sunny' | 'cloudy' | 'clear' | 'snowy' | 'stormy'>('cloudy');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const { location } = useAppContext();
  const search = useLocation().search;
  const queryParams = new URLSearchParams(search);
  const lat = parseFloat(queryParams.get('lat') || '10.7769');
  const lon = parseFloat(queryParams.get('lon') || '106.7009');

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: location,
        });
        const weather = response.data.weather;
        setCurrentWeather(weather);

        const condition = weather.weather_condition.toLowerCase();
        if (condition.includes('rain') || condition.includes('thunderstorm')) {
          setWeatherType('rainy');
        } else if (condition.includes('clear') || condition.includes('sunny')) {
          setWeatherType('clear');
        } else if (condition.includes('cloud')) {
          setWeatherType('cloudy');
        } else if (condition.includes('storm')) {
          setWeatherType('stormy');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thời tiết hiện tại:', error);
      }
    };

    fetchCurrentWeather();
  }, [location]);


  if (!currentWeather) return <div>Đang tải...</div>;

  return (
    <WeatherBackground type={weatherType}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Bản đồ thời tiết chi tiết</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bản đồ Windy */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                <Map height="500px" className="rounded-lg" lat={lat} lon={lon} zoom={12} />
               
              </div>
            </div>

            {/* Thông tin thời tiết hiện tại */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card rounded-xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                <h2 className="text-xl font-semibold text-white mb-4">Thời tiết hiện tại tại {location}</h2>
                <div className="space-y-2">
                  <p className="text-white/80">
                    <span className="font-medium">Nhiệt độ:</span> {Math.round(currentWeather.temperature)}°C
                  </p>
                  <p className="text-white/80">
                    <span className="font-medium">Tình trạng:</span> {currentWeather.weather_condition}
                  </p>
                  <p className="text-white/80">
                    <span className="font-medium">Độ ẩm:</span> {currentWeather.humidity}%
                  </p>
                  <p className="text-white/80">
                    <span className="font-medium">Khả năng mưa:</span>{' '}
                    {currentWeather.rain_probability ? currentWeather.rain_probability : '0'}%
                  </p>
                </div>
              </div>

              {/* Nút quay lại */}
              <div className="text-center relative z-10">
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Quay lại
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default MapDetail;