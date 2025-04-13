// src/pages/SettingsProfile.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WeatherBackground from '@/components/WeatherBackground';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SettingsProfile = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      setFormData({
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin cá nhân:', error);
      toast.error('Không thể lấy thông tin cá nhân.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
    }

    if (!formData.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }

    if (!formData.username) {
        newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        try {
            await axios.post(
                'http://localhost:8000/api/user/update_profile/', // Cập nhật URL
                formData,
                { headers: { Authorization: `Token ${token}` } }
            );
            toast.success('Đã cập nhật thông tin cá nhân.');
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
            toast.error('Không thể cập nhật thông tin cá nhân.');
        }
    }
};

  if (!user) {
    return (
      <WeatherBackground type="clear">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up backdrop-blur-xl text-center text-white">
              <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
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
              <h1 className="text-3xl font-bold mb-2 text-white">Thông tin cá nhân</h1>
              <p className="text-white/70">Cập nhật thông tin tài khoản của bạn</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="first_name" className="text-sm font-medium text-white">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      errors.first_name && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="last_name" className="text-sm font-medium text-white">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      errors.last_name && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                    "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                    errors.email && "border-red-400 focus:ring-red-400/30"
                  )}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-medium text-white">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                    "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                    errors.username && "border-red-400 focus:ring-red-400/30"
                  )}
                  placeholder="johndoe"
                />
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-white text-slate-900 font-medium rounded-xl py-3 hover:bg-white/90 transition-colors mt-6"
              >
                Cập nhật
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default SettingsProfile;