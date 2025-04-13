import { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, CloudRain, CloudSun, Sun } from 'lucide-react';

interface DailyForecastProps {
  location: string; // Thêm prop location
}

const DailyForecast = ({ location }: DailyForecastProps) => {
  const [forecasts, setForecasts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDailyForecast = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: location,
        });
        const locationId = response.data.weather.location.id;
        const forecastResponse = await axios.get(
          `http://localhost:8000/api/forecast/${locationId}/?type=daily`
        );
        setForecasts(forecastResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dự báo theo ngày:', error);
      }
    };
    fetchDailyForecast();
  }, [location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'thunderstorm':
        return <CloudRain className="text-white h-5 w-5" strokeWidth={1.5} />;
      case 'partly cloudy':
        return <CloudSun className="text-white h-5 w-5" strokeWidth={1.5} />;
      case 'cloudy':
      case 'clouds':
        return <Cloud className="text-white h-5 w-5" strokeWidth={1.5} />;
      case 'clear':
      case 'sunny':
        return <Sun className="text-white h-5 w-5" strokeWidth={1.5} />;
      default:
        return <Cloud className="text-white h-5 w-5" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-lg font-medium mb-3">DỰ BÁO THEO NGÀY</h2>
      <div className="flex flex-col gap-1">
        {forecasts.map((forecast, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1 border-b border-white/10 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium">
                {new Date(forecast.forecast_time).toLocaleDateString([], { weekday: 'short' })}
                <div className="text-xs text-white/60">
                  {new Date(forecast.forecast_time).toLocaleDateString()}
                </div>
              </div>
              <div>{getWeatherIcon(forecast.weather_condition || 'cloudy')}</div>
            </div>
            <div className="text-lg font-medium">{Math.round(forecast.high_temperature)}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;