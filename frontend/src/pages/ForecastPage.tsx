import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import WeatherBackground from '@/components/WeatherBackground';
import CurrentWeather from '@/components/CurrentWeather';
import HourlyForecast from '@/components/HourlyForecast';
import DailyForecast from '@/components/DailyForecast';
import WeatherDetail from '@/components/WeatherDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ForecastPage = () => {
  const { province } = useParams<{ province: string }>(); // Lấy tỉnh thành từ URL
  const [weatherType, setWeatherType] = useState<'rainy' | 'sunny' | 'cloudy' | 'clear' | 'snowy' | 'stormy'>('rainy');
  const [currentWeather, setCurrentWeather] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: province,
        });
        const weather = response.data.weather;
        setCurrentWeather(weather);

        // Cập nhật weatherType dựa trên điều kiện thời tiết
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
  }, [province]);

  if (!currentWeather) return <div>Đang tải...</div>;

  return (
    <WeatherBackground type={weatherType}>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 container px-4 py-8 mx-auto">
          {/* Tiêu đề trang */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">
            Thời tiết tại {province}
          </h1>

          {/* Bố cục chính */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột bên trái: Thời tiết hiện tại và chi tiết */}
            <div className="lg:col-span-1 space-y-4">
              <CurrentWeather location={province || ''} className="bg-white/10 backdrop-blur-md rounded-xl p-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                  <WeatherDetail
                    type="feels-like"
                    title="CẢM GIÁC NHƯ"
                    value={Math.round(currentWeather.temperature).toString()}
                    unit="°"
                    description="Độ ẩm làm cảm giác nóng hơn"
                    className="col-span-1 h-full"
                  />
                </div>
                <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                  <WeatherDetail
                    type="precipitation"
                    title="KHẢ NĂNG MƯA"
                    value={currentWeather.rain_probability ? currentWeather.rain_probability.toString() : '0'}
                    unit="%"
                    description="Dự kiến trong 24 giờ tới"
                    className="col-span-1 h-full"
                  />
                </div>
                <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                  <WeatherDetail
                    type="visibility"
                    title="TẦM NHÌN"
                    value="10"
                    unit="km"
                    className="col-span-1 h-full"
                  />
                </div>
                <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                  <WeatherDetail
                    type="humidity"
                    title="ĐỘ ẨM"
                    value={currentWeather.humidity.toString()}
                    unit="%"
                    description={`Điểm sương hiện tại là ${Math.round(currentWeather.temperature - 5)}°`}
                    className="col-span-1 h-full"
                  />
                </div>
              </div>
            </div>

            {/* Cột bên phải: Dự báo theo giờ và ngày */}
            <div className="lg:col-span-2 space-y-4">
              <HourlyForecast location={province || ''} />
              <DailyForecast location={province || ''} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default ForecastPage;