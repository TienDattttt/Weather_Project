// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import WeatherBackground from '@/components/WeatherBackground';
import { useAuth } from '@/context/AuthContext'; // Thêm useAuth
import { toast } from 'sonner'; // Thêm toast từ sonner

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const navigate = useNavigate(); // Thêm useNavigate để điều hướng

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Bắt buộc điền email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Bắt buộc điền mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Gọi API login từ AuthContext
        await login({ login: email, password });
        toast.success('Đăng nhập thành công!');
        navigate('/'); // Điều hướng về trang chủ sau khi đăng nhập thành công
      } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    }
  };
  
  return (
    <WeatherBackground type="clear">
      <div className="min-h-screen flex flex-col">
        <header className="pt-4 px-4">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors inline-flex">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
              <p className="text-white/70">Đăng nhập để truy cập các tùy chọn thời tiết của bạn.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      errors.email && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Điền email của bạn"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" className="text-sm text-white/70 hover:text-white">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      "pr-10",
                      errors.password && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Điền mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-white text-slate-900 font-medium rounded-xl py-3 hover:bg-white/90 transition-colors"
              >
                Đăng nhập
              </button>
              
              <div className="text-center">
                <p className="text-white/70">
                  Bạn chưa có tài khoản?{' '}
                  <Link to="/register" className="text-white hover:underline">
                    Tạo tài khoản
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </WeatherBackground>
  );
};

export default Login;