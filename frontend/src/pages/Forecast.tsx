import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Cloud, CloudRain, MapPin, Sun, CloudSun } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import WeatherBackground from '@/components/WeatherBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';

const Forecast = () => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const { location } = useAppContext();

  const tabs = [
    { id: 'hourly', label: 'Hourly' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
  ];

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        // Giả sử location là tên thành phố, cần gửi request tới API để lấy dữ liệu
        const response = await axios.post('http://localhost:8000/api/current/by_location/', {
          name: location,
        });
        const locationId = response.data.weather.location.id;

        // Lấy dữ liệu dự báo theo loại (short, daily, weekly)
        const forecastResponse = await axios.get(
          `http://localhost:8000/api/forecast/${locationId}/all_types/`
        );
        setForecastData(forecastResponse.data);
      } catch (error) {
        console.error('Error fetching forecast:', error);
      }
    };
    fetchForecast();
  }, [location]);

  const getWeatherIcon = (condition: string, size = 6) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'thunderstorm':
        return <CloudRain className={`text-white h-${size} w-${size} group-hover:brightness-150 transition-all duration-300`} strokeWidth={1.5} />;
      case 'partly cloudy':
        return <CloudSun className={`text-white h-${size} w-${size} group-hover:brightness-150 transition-all duration-300`} strokeWidth={1.5} />;
      case 'cloudy':
      case 'clouds':
        return <Cloud className={`text-white h-${size} w-${size} group-hover:brightness-150 transition-all duration-300`} strokeWidth={1.5} />;
      case 'clear':
      case 'sunny':
        return <Sun className={`text-white h-${size} w-${size} group-hover:brightness-150 transition-all duration-300`} strokeWidth={1.5} />;
      default:
        return <Cloud className={`text-white h-${size} w-${size} group-hover:brightness-150 transition-all duration-300`} strokeWidth={1.5} />;
    }
  };

  // Lọc dữ liệu theo loại dự báo
  const filteredForecast = forecastData.filter(
    (item) => item.forecast_type === (activeTab === 'hourly' ? 'short' : activeTab)
  );

  return (
    <WeatherBackground type="rainy">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="sticky top-0 z-10 backdrop-blur-sm bg-black/20 border-b border-white/10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-white">
                    <MapPin className="h-4 w-4" />
                    <span className="text-lg font-medium">{location}</span>
                    <ChevronDown className="h-4 w-4 text-white/70" />
                  </div>
                  <span className="text-white/70 text-sm">Updated just now</span>
                </div>
                <div className="w-10"></div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 mt-4">
            <div className="glass-card rounded-full flex justify-between p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    'flex-1 py-2 rounded-full text-white/80 font-medium transition-all',
                    activeTab === tab.id && 'bg-white/20 text-white'
                  )}
                  onClick={() => setActiveTab(tab.id as 'hourly' | 'daily' | 'weekly')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 mt-6 pb-20">
            {activeTab === 'hourly' && (
              <div className="space-y-4 animate-fade-in">
                {filteredForecast.map((hour, index) => (
                  <div
                    key={index}
                    className="group glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-16 text-white font-medium">
                      {new Date(hour.forecast_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(hour.weather_condition || 'cloudy')}
                      <span className="text-xl font-medium text-white">
                        {Math.round(hour.high_temperature)}°
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-white/70">
                      <div>{hour.rain_probability}%</div>
                      <div>{hour.uv_index}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'daily' && (
              <div className="space-y-6 animate-fade-in">
                {filteredForecast.map((day, index) => (
                  <div key={index} className="glass-card rounded-2xl p-4">
                    <div className="group flex items-center justify-between mb-4 hover:bg-white/10 transition-all duration-300 rounded-lg p-2">
                      <span className="text-lg font-medium text-white">
                        {new Date(day.forecast_time).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(day.weather_condition || 'cloudy')}
                        <div className="flex gap-2">
                          <span className="text-xl font-medium text-white">
                            {Math.round(day.high_temperature)}°
                          </span>
                          <span className="text-xl font-light text-white/70">
                            {Math.round(day.low_temperature)}°
                          </span>
                        </div>
                      </div>
                      <div className="text-white/70">{day.rain_probability}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="glass-card rounded-2xl p-4 animate-fade-in">
                <h2 className="text-xl font-medium mb-4 text-white">Weekly Overview</h2>
                <div className="space-y-4">
                  {filteredForecast.map((week, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between py-3 border-b border-white/10 last:border-0 hover:bg-white/10 transition-all duration-300 rounded-lg"
                    >
                      <span className="font-medium text-white">
                        {new Date(week.forecast_time).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        {getWeatherIcon(week.weather_condition || 'cloudy')}
                        <div className="flex gap-4">
                          <span className="text-lg font-medium text-white">
                            {Math.round(week.high_temperature)}°
                          </span>
                          <span className="text-lg font-light text-white/70 w-8">
                            {Math.round(week.low_temperature)}°
                          </span>
                        </div>
                      </div>
                      <div className="text-white/70 text-sm">{week.rain_probability}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default Forecast;