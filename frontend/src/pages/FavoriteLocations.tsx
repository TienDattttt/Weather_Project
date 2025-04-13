// src/pages/FavoriteLocations.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WeatherBackground from '@/components/WeatherBackground';

const FavoriteLocations = () => {
  const { user, token } = useAuth();
  const { setLocation } = useAppContext();
  const [favoriteLocations, setFavoriteLocations] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchFavoriteLocations();
    }
  }, [user, token]);

  const fetchFavoriteLocations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      setFavoriteLocations(response.data.favorite_locations);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vị trí yêu thích:', error);
      toast.error('Không thể lấy danh sách vị trí yêu thích.');
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation) {
      toast.error('Vui lòng nhập tên vị trí.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/user/add_favorite_location/',
        { name: newLocation },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(`Đã thêm ${newLocation} vào danh sách yêu thích.`);
      setNewLocation('');
      fetchFavoriteLocations();
    } catch (error) {
      console.error('Lỗi khi thêm vị trí yêu thích:', error);
      toast.error('Không thể thêm vị trí yêu thích.');
    }
  };

  const handleRemoveLocation = async (locationId: number) => {
    try {
      await axios.post(
        'http://localhost:8000/api/user/remove_favorite_location/',
        { location_id: locationId },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success('Đã xóa vị trí khỏi danh sách yêu thích.');
      fetchFavoriteLocations();
    } catch (error) {
      console.error('Lỗi khi xóa vị trí yêu thích:', error);
      toast.error('Không thể xóa vị trí yêu thích.');
    }
  };

  if (!user) {
    return (
      <WeatherBackground type="clear">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up backdrop-blur-xl text-center text-white">
              <p>Vui lòng đăng nhập để quản lý vị trí yêu thích.</p>
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
          <div className="glass-card rounded-3xl p-8 w-full max-w-2xl animate-slide-up backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Danh sách vị trí yêu thích</h1>
              <p className="text-white/70">Quản lý các vị trí bạn thường xuyên theo dõi</p>
            </div>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Thêm vị trí mới</h2>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Nhập tên vị trí (ví dụ: Hà Nội)"
                    className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <button
                    onClick={handleAddLocation}
                    className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Danh sách vị trí yêu thích
                </h2>
                {favoriteLocations.length === 0 ? (
                  <p className="text-white/70">Chưa có vị trí yêu thích nào.</p>
                ) : (
                  <ul className="space-y-3">
                    {favoriteLocations.map((loc) => (
                      <li
                        key={loc.id}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                      >
                        <Link
                          to={`/forecast/${loc.name}`}
                          onClick={() => setLocation(`${loc.name}, ${loc.country_code}`)}
                          className="text-white hover:underline"
                        >
                          {loc.name}, {loc.country_code}
                        </Link>
                        <button
                          onClick={() => handleRemoveLocation(loc.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default FavoriteLocations;