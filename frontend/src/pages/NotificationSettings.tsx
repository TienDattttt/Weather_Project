import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WeatherBackground from '@/components/WeatherBackground';
import { Link } from 'react-router-dom';

const NotificationSettings = () => {
  const { user, token } = useAuth();
  const { coordinates } = useAppContext();
  const [settings, setSettings] = useState({
    rain: false,
    storm: false,
    extreme_temperature: false,
    fog: false,
  });

  useEffect(() => {
    if (user && token) {
      fetchSettings();
      // Chỉ gọi checkNotifications nếu coordinates có giá trị hợp lệ
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        checkNotifications();
      } else {
        // Sử dụng tọa độ mặc định nếu coordinates không có
        checkNotificationsWithDefault();
      }
    }
  }, [user, token, coordinates]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      setSettings(response.data.notification_settings || settings);
    } catch (error) {
      console.error('Lỗi khi lấy cài đặt thông báo:', error);
      toast.error('Không thể lấy cài đặt thông báo.');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/user/update_notification_settings/',
        settings,
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success('Đã cập nhật cài đặt thông báo.');
    } catch (error) {
      console.error('Lỗi khi cập nhật cài đặt thông báo:', error);
      toast.error('Không thể cập nhật cài đặt thông báo.');
    }
  };

  const checkNotifications = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/user/check_notifications/',
        { latitude: coordinates.latitude, longitude: coordinates.longitude },
        { headers: { Authorization: `Token ${token}` } }
      );
      if (response.data.length > 0) {
        response.data.forEach((alert: any) => {
          toast.warning(`${alert.message}\nRecommendation: ${alert.recommendation || 'No recommendation'}`);
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra thông báo:', error);
      toast.error('Không thể kiểm tra thông báo thời tiết.');
    }
  };

  const checkNotificationsWithDefault = async () => {
    // Sử dụng tọa độ mặc định (ví dụ: TP.HCM)
    const defaultCoordinates = {
      latitude: 10.7769,
      longitude: 106.7009,
    };

    try {
      const response = await axios.post(
        'http://localhost:8000/api/user/check_notifications/',
        { latitude: defaultCoordinates.latitude, longitude: defaultCoordinates.longitude },
        { headers: { Authorization: `Token ${token}` } }
      );
      if (response.data.length > 0) {
        response.data.forEach((alert: any) => {
          toast.warning(`${alert.message}\nRecommendation: ${alert.recommendation || 'No recommendation'}`);
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra thông báo với tọa độ mặc định:', error);
      toast.error('Không thể kiểm tra thông báo thời tiết với tọa độ mặc định.');
    }
  };

  if (!user) {
    return (
      <WeatherBackground type="clear">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up backdrop-blur-xl text-center text-white">
              <p>Vui lòng đăng nhập để cài đặt thông báo.</p>
              <Link to="/login" className="text-blue-200 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </WeatherBackground>
    );
  }

  return (
    <WeatherBackground type="clear">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Cài đặt thông báo</h1>
              <p className="text-white/70">Tùy chỉnh thông báo thời tiết theo ý muốn</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.rain}
                    onChange={(e) => setSettings({ ...settings, rain: e.target.checked })}
                    className="h-5 w-5 text-white border-white/20 bg-white/10 rounded focus:ring-white/30"
                  />
                  <span className="text-white">Thông báo nếu có mưa</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.storm}
                    onChange={(e) => setSettings({ ...settings, storm: e.target.checked })}
                    className="h-5 w-5 text-white border-white/20 bg-white/10 rounded focus:ring-white/30"
                  />
                  <span className="text-white">Thông báo nếu có bão</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.extreme_temperature}
                    onChange={(e) => setSettings({ ...settings, extreme_temperature: e.target.checked })}
                    className="h-5 w-5 text-white border-white/20 bg-white/10 rounded focus:ring-white/30"
                  />
                  <span className="text-white">Thông báo nếu nhiệt độ khắc nghiệt</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.fog}
                    onChange={(e) => setSettings({ ...settings, fog: e.target.checked })}
                    className="h-5 w-5 text-white border-white/20 bg-white/10 rounded focus:ring-white/30"
                  />
                  <span className="text-white">Thông báo nếu có sương mù</span>
                </label>
              </div>
              <button
                onClick={handleUpdateSettings}
                className="w-full bg-white text-slate-900 font-medium rounded-xl py-3 hover:bg-white/90 transition-colors mt-6"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default NotificationSettings;