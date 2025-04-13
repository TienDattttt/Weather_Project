// src/components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, CloudIcon, MapPinIcon, LogIn, Sun, Settings, LogOut, MapPin, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner'; // Import toast từ sonner
import { useAuth } from '@/context/AuthContext'; // Thêm useAuth
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const provincesByRegion = {
  'Đông Bắc Bộ': [
    'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Hà Giang', 'Lạng Sơn',
    'Phú Thọ', 'Quảng Ninh', 'Thái Nguyên', 'Tuyên Quang',
  ],
  'Tây Bắc Bộ': [
    'Điện Biên', 'Hòa Bình', 'Lai Châu', 'Lào Cai', 'Sơn La', 'Yên Bái',
  ],
  'Đồng bằng sông Hồng': [
    'Bắc Ninh', 'Hà Nam', 'Hà Nội', 'Hải Dương', 'Hải Phòng',
    'Hưng Yên', 'Nam Định', 'Ninh Bình', 'Thái Bình', 'Vĩnh Phúc',
  ],
  'Bắc Trung Bộ': [
    'Hà Tĩnh', 'Nghệ An', 'Quảng Bình', 'Quảng Trị', 'Thanh Hóa', 'Thừa Thiên Huế',
  ],
  'Nam Trung Bộ': [
    'Bình Định', 'Bình Thuận', 'Đà Nẵng', 'Khánh Hòa', 'Ninh Thuận',
    'Phú Yên', 'Quảng Nam', 'Quảng Ngãi',
  ],
  'Tây Nguyên': [
    'Đắk Lắk', 'Đắk Nông', 'Gia Lai', 'Kon Tum', 'Lâm Đồng',
  ],
  'Đông Nam Bộ': [
    'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Bình Phước', 'Đồng Nai',
    'Hồ Chí Minh', 'Tây Ninh',
  ],
  'Đồng bằng sông Cửu Long': [
    'An Giang', 'Bạc Liêu', 'Bến Tre', 'Cà Mau', 'Cần Thơ',
    'Đồng Tháp', 'Hậu Giang', 'Kiên Giang', 'Long An',
    'Sóc Trăng', 'Tiền Giang', 'Trà Vinh', 'Vĩnh Long',
  ],
};

const Header = () => {
  const { location, setLocation } = useAppContext();
  const { user, logout } = useAuth(); // Sử dụng AuthContext để kiểm tra trạng thái đăng nhập
  const navigate = useNavigate();

  const handleSearch = async (searchQuery: string) => {
    try {
      const apiName = `${searchQuery}, VN`;
      const response = await fetch('http://localhost:8000/api/current/by_location/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: apiName }),
      });
      if (!response.ok) throw new Error('Location not found');
      setLocation(apiName);
      navigate(`/forecast/${searchQuery}`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Không tìm thấy vị trí. Vui lòng thử lại!'); // Thay alert bằng toast
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-sm bg-black/20 border-b border-white/10">
      <div className="container px-4 py-4 mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sun className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">tibiki</span>
          </Link>

          <div className="flex-1 w-full sm:w-auto">
            <SearchBar className="w-full" onSearch={handleSearch} placeholder="Tìm kiếm vị trí (VD: Hà Nội)" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  <CalendarIcon className="h-5 w-5" />
                  <span>Tỉnh/Thành phố</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[90vw] max-w-[1200px] bg-black/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Object.entries(provincesByRegion).map(([region, provinces], index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                        {region}
                      </h3>
                      <div className="space-y-1">
                        {provinces.map((province, idx) => (
                          <DropdownMenuItem key={idx} asChild>
                            <Link
                              to={`/forecast/${province}`}
                              onClick={() => {
                                const apiName = `${province}, VN`;
                                setLocation(apiName);
                              }}
                              className="text-white/80 hover:bg-white/10 hover:text-white transition-colors px-2 py-1 rounded-md block text-sm"
                            >
                              {province}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <Link to="/weather-news">
                <CloudIcon className="h-5 w-5" />
                <span>Tin thời tiết</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <MapPinIcon className="h-5 w-5" />
              <span>{location.split(',')[0]}</span>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Cài đặt</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings/profile"
                      className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Thông tin cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings/favorite-locations"
                      className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>Địa điểm yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings/notifications"
                      className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                      <span>Cài đặt thông báo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-white hover:bg-white/10 flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Link to="/login">
                  <LogIn className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;