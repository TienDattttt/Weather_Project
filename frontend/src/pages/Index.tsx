import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import WeatherBackground from '@/components/WeatherBackground';
import CurrentWeather from '@/components/CurrentWeather';
import HourlyForecast from '@/components/HourlyForecast';
import DailyForecast from '@/components/DailyForecast';
import WeatherDetail from '@/components/WeatherDetail';
import { Cloud, CloudRain, Sun, CloudSun } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import Map from '../components/ui/Map';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Index = () => {
  const [weatherType, setWeatherType] = useState<'rainy' | 'sunny' | 'cloudy' | 'clear' | 'snowy' | 'stormy'>('rainy');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [cityWeatherData, setCityWeatherData] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { location } = useAppContext();
  const navigate = useNavigate();

  const provincesData = [
    'Hà Nội', 'Sơn La', 'Vĩnh Phúc', 'Hà Giang', 'Yên Bái', 'Bắc Ninh',
    'Cao Bằng', 'Hoà Bình', 'Hải Dương', 'Bắc Kạn', 'Thái Nguyên', 'Hải Phòng',
    'Tuyên Quang', 'Lạng Sơn', 'Hưng Yên', 'Lào Cai', 'Quảng Ninh', 'Thái Bình',
    'Điện Biên', 'Bắc Giang', 'Hà Nam', 'Lai Châu', 'Phú Thọ', 'Nam Định'
  ];

  const normalizeLocationName = (name: string) => {
    const locationMap: { [key: string]: string } = {
      'Gò Vấp': 'Go Vap District',
      'Hà Nội': 'Hanoi',
      'Hồ Chí Minh': 'Ho Chi Minh City',
    };
    return locationMap[name] || name;
  };

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const normalizedLocation = normalizeLocationName(location);
        console.log('Đang gửi location:', normalizedLocation);
        const response = await axios.post('http://localhost:8000/api/current/by_location/', { name: normalizedLocation });
        const weather = response.data.weather;
        setCurrentWeather(weather);
        setError(null);
        const condition = weather.weather_condition.toLowerCase();
        if (condition.includes('rain') || condition.includes('thunderstorm')) setWeatherType('rainy');
        else if (condition.includes('clear') || condition.includes('sunny')) setWeatherType('clear');
        else if (condition.includes('cloud')) setWeatherType('cloudy');
        else if (condition.includes('storm')) setWeatherType('stormy');
      } catch (error: any) {
        console.error('Lỗi khi lấy dữ liệu:', error.response?.data || error.message);
        setError(error.response?.data?.error || 'Không tìm thấy địa điểm hoặc có lỗi xảy ra.');
        setCurrentWeather(null);
      }
    };

    const fetchCityWeather = async () => {
      const cities = ['Hà Nội', 'Đà Nẵng', 'Quảng Nam', 'Bà Rịa - Vũng Tàu', 'Hồ Chí Minh', 'Bến Tre', 'Thừa Thiên Huế', 'Lào Cai'];
      const promises = cities.map(city =>
        axios.post('http://localhost:8000/api/current/by_location/', { name: normalizeLocationName(city) })
          .then(res => ({
            city,
            condition: res.data.weather.weather_condition,
            temperature: `${Math.round(res.data.weather.temperature)}°`,
            rainfall: res.data.weather.rain_probability ? `${res.data.weather.rain_probability}%` : '0%',
            description: res.data.weather.weather_condition
          }))
          .catch(() => null)
      );
      const results = await Promise.all(promises);
      setCityWeatherData(results.filter(result => result !== null));
    };

    const fetchNewsArticles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/news/');
        setNewsArticles(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
      }
    };

    fetchCurrentWeather();
    fetchCityWeather();
    fetchNewsArticles();
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.body.style.setProperty('--scroll', String(scrollY));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain': case 'thunderstorm': return <CloudRain className="h-12 w-12 text-white" />;
      case 'cloudy': case 'clouds': return <Cloud className="h-12 w-12 text-white" />;
      case 'sunny': case 'clear': return <Sun className="h-12 w-12 text-white" />;
      case 'stormy': return <CloudRain className="h-12 w-12 text-white" />;
      default: return <CloudSun className="h-12 w-12 text-white" />;
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/mapdetail?lat=${latitude}&lon=${longitude}`);
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
          navigate('/mapdetail?lat=10.7769&lon=106.7009');
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ Geolocation');
      navigate('/mapdetail?lat=10.7769&lon=106.7009');
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  };

  if (error) {
    return (
      <WeatherBackground type={weatherType}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-10">
            <p className="text-red-400 text-center">{error}</p>
          </main>
          <Footer />
        </div>
      </WeatherBackground>
    );
  }

  if (!currentWeather) return <div>Đang tải...</div>;

  return (
    <WeatherBackground type={weatherType}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 snap-container">
          {/* Section 1: Thời tiết hiện tại */}
          <section className="snap-section relative min-h-screen">
            <div className="relative z-10 container px-4 py-4 mx-auto h-full flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 flex-1">
                <div className="lg:col-span-5 space-y-2">
                  <CurrentWeather className="flex-1" location={location} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                      <WeatherDetail type="feels-like" title="CẢM GIÁC NHƯ" value={Math.round(currentWeather.temperature).toString()} unit="°" description="Độ ẩm làm cảm giác nóng hơn" className="col-span-1 h-full" />
                    </div>
                    <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                      <WeatherDetail type="precipitation" title="KHẢ NĂNG MƯA" value={currentWeather.rain_probability ? currentWeather.rain_probability.toString() : '0'} unit="%" description="Dự kiến trong 24 giờ tới" className="col-span-1 h-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                      <WeatherDetail type="visibility" title="TẦM NHÌN" value="10" unit="km" className="col-span-1 h-full" />
                    </div>
                    <div className="group hover:bg-white/10 transition-all duration-300 rounded-xl">
                      <WeatherDetail type="humidity" title="ĐỘ ẨM" value={currentWeather.humidity.toString()} unit="%" description={`Điểm sương hiện tại là ${Math.round(currentWeather.temperature - 5)}°`} className="col-span-1 h-full" />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-1">
                  <HourlyForecast location={location} />
                  <DailyForecast location={location} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Bản đồ */}
          <section className="snap-section bg-gradient-to-br from-indigo-900/70 to-purple-900/70 relative">
            <div className="container mx-auto px-4 py-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-white">BẢN ĐỒ THỜI TIẾT</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <Map height="400px" className="rounded-xl shadow-lg mb-6" />
                <div className="relative z-10 flex justify-center">
                  <button onClick={handleGetLocation} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Thời tiết các tỉnh */}
          <section className="snap-section bg-gradient-to-br from-indigo-900/70 to-purple-900/70 relative">
            <div className="container mx-auto px-4 py-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-white">Thời tiết các tỉnh thành</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {provincesData.map((province, index) => (
                    <div key={index} className="border-b border-white/10 py-3 flex items-center space-x-2">
                      <CloudSun className="h-5 w-5 text-blue-300" />
                      <Link to={`/forecast/${province}`} className="text-white hover:text-blue-200 transition">
                        Thời tiết {province}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Tin tức nổi bật với Slider */}
          <section className="snap-section bg-gradient-to-br from-purple-900/70 to-gray-900/70 relative">
            <div className="container mx-auto px-4 py-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-white">Tin tức nổi bật</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                {newsArticles.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {newsArticles.map((article) => (
                      <div key={article.id} className="px-2">
                        <div className="weather-news-card bg-white/5 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                          <img
                            src={article.image || '/placeholder.png'}
                            alt={article.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                            <p className="text-white/80 mb-4 line-clamp-3">{article.content}</p>
                            <Link
                              to={`/weather-news/${article.id}`}
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                            >
                              Xem thêm
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <p className="text-white/70">Đang tải tin tức...</p>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default Index;