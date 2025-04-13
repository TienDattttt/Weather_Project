import { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, CloudRain, CloudSun, Sun } from 'lucide-react';

interface HourlyForecastProps {
  location: string;
  className?: string;
}

const HourlyForecast = ({ location, className }: HourlyForecastProps) => {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHourlyForecast = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: location,
        });
        const locationId = response.data.weather.location.id;
        console.log('Location ID:', locationId);

        const forecastResponse = await axios.get(
          `http://localhost:8000/api/forecast/${locationId}/?type=short`
        );
        console.log('Dữ liệu dự báo theo giờ:', forecastResponse.data);
        setForecasts(forecastResponse.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy dự báo theo giờ:', error);
        setError('Không thể lấy dữ liệu dự báo theo giờ.');
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyForecast();
  }, [location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'thunderstorm':
        return <CloudRain className="text-white h-5 w-5" strokeWidth={1.5} />;
      case 'partly cloudy':
      case 'partly_cloudy':
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

  const formatTime = (date: Date, index: number) => {
    if (index === 0) return 'Bây giờ';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };



  if (error) {
    return <div className={className}>{error}</div>;
  }
  return (
    <div className={className}>
      <div className="glass-card rounded-2xl p-4 w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-medium mb-3">DỰ BÁO THEO GIỜ</h2>
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1">
          {forecasts.map((forecast, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-between min-w-[80px] p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="text-xs font-medium mb-1">
                {formatTime(new Date(forecast.forecast_time), index)}
              </div>
              <div className="my-1">
                {getWeatherIcon(forecast.weather_condition || 'cloudy')}
              </div>
              <div className="text-lg font-medium">
                {Math.round(forecast.high_temperature)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;