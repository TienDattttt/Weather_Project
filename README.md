# 🌤️ Website Dự Báo Thời Tiết

Ứng dụng web hiển thị dự báo thời tiết, sử dụng **Django Rest Framework 🐍🔧** cho backend, **React + Vite ⚛️🚀** cho frontend và **PostgreSQL 🐘💾** làm cơ sở dữ liệu. Frontend sử dụng **Axios 📡** để gọi API từ backend. Dữ liệu thời tiết được lấy từ **OpenWeatherMap API 🌦️📊**.

## ✨ Tính năng

- **📝 Đăng ký**: Người dùng tạo tài khoản mới với tên người dùng, họ, tên, email và mật khẩu. Hệ thống kiểm tra tính duy nhất của tên người dùng và email, cho phép đăng nhập và sử dụng các tính năng cá nhân hóa như lưu vị trí yêu thích, tùy chỉnh thông báo.
- **🔑 Đăng nhập**: Đăng nhập bằng tên người dùng hoặc email và mật khẩu. Hỗ trợ khôi phục mật khẩu qua email nếu quên. Thông báo lỗi nếu nhập sai thông tin.
- **⏰ Cập nhật thời tiết theo thời gian thực**: Hiển thị thông tin thời tiết hiện tại (nhiệt độ, độ ẩm, tốc độ gió, áp suất, v.v.) từ trạm khí tượng/vệ tinh, tự động làm mới mỗi 5-10 phút.
- **📅 Dự báo ngắn hạn và dài hạn**: Cung cấp dự báo vài giờ tới, 7-10 ngày hoặc hàng tuần (nhiệt độ, khả năng mưa, chỉ số UV, v.v.) theo khu vực.
- **🗺️ Bản đồ thời tiết tương tác**: Xem bản đồ radar, vệ tinh, nhiệt độ, theo dõi mây, mưa, bão theo thời gian thực, hỗ trợ phóng to/thu nhỏ.
- **📍 Thông tin chi tiết theo địa điểm**: Hỗ trợ nhập vị trí hoặc dùng GPS để xem thời tiết chi tiết cho khu vực cụ thể.
- **⚠️ Cảnh báo thời tiết**: Gửi thông báo về thời tiết nguy hiểm (bão, lũ, nhiệt độ khắc nghiệt) kèm khuyến nghị an toàn, hoặc gợi ý hoạt động nếu thời tiết đẹp.
- **📊 Dữ liệu bổ sung**: Cung cấp thông tin phụ như chất lượng không khí, thời gian mặt trời mọc/lặn, pha mặt trăng, chỉ số cảm nhận nhiệt.
- **👤 Quản lý cá nhân hóa người dùng**: Lưu vị trí yêu thích, đặt thông báo tùy chỉnh (ví dụ: thông báo nếu mưa, bão) dựa trên vị trí hiện tại hoặc vị trí đã lưu.
- **📰 Đọc tin tức thời tiết**: Xem bài viết, tin tức về thời tiết, khí hậu, biến đổi khí hậu và hiện tượng thiên nhiên.

## 🛠️ Công nghệ sử dụng

- **Backend**: Django Rest Framework, Python 3.13.2
- **Frontend**: React 18.3.1, Vite 5.4.14, Node.js 20.18.0, Axios 1.8.4
- **Cơ sở dữ liệu**: PostgreSQL 17

## 📋 Yêu cầu hệ thống

- Python 3.13.2
- Node.js 20.18.0
- PostgreSQL 17
- Git
- Tài khoản OpenWeatherMap để lấy API key (miễn phí tại [openweathermap.org](https://openweathermap.org)).

## 🖥️ Hướng dẫn cài đặt

1. **📥 Clone repository**:

   ```bash
   git clone https://github.com/TienDattttt/Weather_Project.git
   cd Weather_Project
2. **💾 Thiết lập cơ sở dữ liệu**:

   ****2.1 Đăng nhập vào Postgresql và nhập mật khẩu****:
      
       psql -U postgres

   ****2.2 Tạo cơ sở dữ liệu****:
     
       CREATE DATABASE  weather_db ENCODING 'UTF8'; 

   ****2.3 Nhập dữ liệu từ file database.sql****:
       
       \c weather_db
       \i 'database.sql'

4. **⚙️ Thiết lập backend**:

   ****3.1 Chuyển đến thư mục backend, tạo và kích hoạt môi trường ảo, cài đặt các thư viện****:

       cd backend
       python -m venv venv
       source venv/bin/activate
       pip install django djangorestframework django-cors-headers psycopg2-binary

   ****3.2 Vào `weather_api/settings.py`, đổi mật khẩu user PostgreSQL****:
       
       DATABASES = {
        'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'weather_db',
           'USER': 'postgres',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
    }
}

5. **🌐 Thiết lập frontend**:

   ```bash
   cd ../frontend
   npm install
6. **🚀 Chạy dự án**:
   ****Mở terminal trong thư mục backend và chạy****:

       cd backend
       python manage.py runserver

   ****Mở terminal trong thư mục frontend và chạy****:

       cd frontend
       npm run dev





