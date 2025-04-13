// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import WeatherBackground from '@/components/WeatherBackground';
import { useAuth } from '@/context/AuthContext'; // Thêm useAuth
import { toast } from 'sonner'; // Thêm toast từ sonner

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth(); // Lấy hàm register từ AuthContext
  const navigate = useNavigate(); // Thêm useNavigate để điều hướng

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Gọi API register từ AuthContext
        await register({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login'); // Điều hướng về trang đăng nhập sau khi đăng ký thành công
      } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        toast.error('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
              <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
              <p className="text-white/70">Đăng ký để truy cập thông tin thời tiết cá nhân hóa.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-sm font-medium">
                  Tên
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      errors.firstName && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-sm font-medium">
                  Họ 
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      errors.lastName && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
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
                <label htmlFor="username" className="text-sm font-medium">
                  Tên người dùng
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
              
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      "pr-10",
                      errors.password && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Nhập mật khẩu"
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
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-white/30 transition-all",
                      "pr-10",
                      errors.confirmPassword && "border-red-400 focus:ring-red-400/30"
                    )}
                    placeholder="Xác nhận mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-white text-slate-900 font-medium rounded-xl py-3 hover:bg-white/90 transition-colors mt-6"
              >
                Tạo tài khoản
              </button>
              
              <div className="text-center">
                <p className="text-white/70">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-white hover:underline">
                    Đăng nhập ngay
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

export default Register;