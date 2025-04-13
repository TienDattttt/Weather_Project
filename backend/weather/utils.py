import requests
from django.conf import settings
from django.utils import timezone
from datetime import datetime
from .models import WeatherAlert


def geocode_location(location_name):
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={location_name}&limit=1&appid={settings.OPENWEATHER_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200 and response.json():
        data = response.json()[0]
        return {
            'name': data['name'],
            'latitude': data['lat'],
            'longitude': data['lon'],
            'country_code': data.get('country', '')
        }
    return None

def fetch_current_weather(lat, lon):
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed'],
            'pressure': data['main']['pressure'],
            'weather_condition': data['weather'][0]['description'],
            'icon_url': f"http://openweathermap.org/img/wn/{data['weather'][0]['icon']}.png",
        }
    return None



def fetch_forecast(lat, lon):
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        forecasts = []


        # Short-term (5 ngày, 3 giờ/lần)
        short_term = []
        for item in data['list'][:8]:  # Lấy 24 giờ đầu tiên (8 khoảng 3 giờ)
            short_term.append({
                'forecast_type': 'short',
                'forecast_time': datetime.fromtimestamp(item['dt']),
                'high_temperature': item['main']['temp_max'],
                'low_temperature': item['main']['temp_min'],
                'rain_probability': item.get('pop', 0) * 100,  # Tỷ lệ mưa (%)
                'uv_index': item.get('uvi', 0),  # API miễn phí không có UV, cần API khác nếu muốn chính xác
            })


        # Daily (5 ngày, tổng hợp mỗi ngày)
        daily = {}
        for item in data['list']:
            day = datetime.fromtimestamp(item['dt']).date()
            if day not in daily:
                daily[day] = {
                    'forecast_type': 'daily',
                    'forecast_time': datetime.fromtimestamp(item['dt']),
                    'high_temperature': item['main']['temp_max'],
                    'low_temperature': item['main']['temp_min'],
                    'rain_probability': item.get('pop', 0) * 100,
                    'uv_index': item.get('uvi', 0),
                }
            else:
                daily[day]['high_temperature'] = max(daily[day]['high_temperature'], item['main']['temp_max'])
                daily[day]['low_temperature'] = min(daily[day]['low_temperature'], item['main']['temp_min'])
                daily[day]['rain_probability'] = max(daily[day]['rain_probability'], item.get('pop', 0) * 100)


        forecasts.extend(short_term)
        forecasts.extend(daily.values())


        # Weekly (tổng hợp 5 ngày thành 1 tuần)
        weekly = {
            'forecast_type': 'weekly',
            'forecast_time': timezone.now(),
            'high_temperature': max(item['main']['temp_max'] for item in data['list']),
            'low_temperature': min(item['main']['temp_min'] for item in data['list']),
            'rain_probability': max(item.get('pop', 0) * 100 for item in data['list']),
            'uv_index': max(item.get('uvi', 0) for item in data['list']),
        }
        forecasts.append(weekly)


        return forecasts
    return None

# def check_weather_alerts(location, current_weather_data, forecast_data=None):
#     alerts = []

#     # Dữ liệu thời tiết hiện tại
#     temp = current_weather_data.get('temperature', 0)
#     wind_speed = current_weather_data.get('wind_speed', 0)
#     humidity = current_weather_data.get('humidity', 0)
#     condition = current_weather_data.get('weather_condition', '').lower()

#     # 1. Bão (Storm) 
#     if wind_speed > 20 or 'storm' in condition or 'thunderstorm' in condition:
#         alerts.append({
#             'alert_type': 'storm',
#             'message': f"Storm warning in {location.name}: High winds ({wind_speed} m/s) or stormy conditions detected.",
#             'severity': 'high' if wind_speed > 25 else 'medium',
#             'recommendation': 'Stay indoors, secure outdoor objects, and avoid travel.'
#         })
        

#     # 2. Nhiệt độ khắc nghiệt (Extreme Temperature)
#     if temp > 40:
#         alerts.append({
#             'alert_type': 'extreme_temperature',
#             'message': f"Extreme heat warning in {location.name}: Temperature reached {temp}°C.",
#             'severity': 'high',
#             'recommendation': 'Stay hydrated, avoid outdoor activities during peak heat.'
#         })
#     elif temp < -10:
#         alerts.append({
#             'alert_type': 'extreme_temperature',
#             'message': f"Extreme cold warning in {location.name}: Temperature dropped to {temp}°C.",
#             'severity': 'high',
#             'recommendation': 'Dress warmly, limit outdoor exposure.'
#         })

#     # 3. Sương mù dày đặc (Dense Fog)
#     if 'fog' in condition and humidity > 90:
#         alerts.append({
#             'alert_type': 'fog',
#             'message': f"Dense fog warning in {location.name}: Low visibility due to high humidity ({humidity}%).",
#             'severity': 'medium',
#             'recommendation': 'Drive slowly, use fog lights, and avoid unnecessary travel.'
#         })

#     # 4. Nguy cơ lũ (Flood) - Dựa trên dự báo
#     if forecast_data:
#         max_rain_prob = max(item.get('rain_probability', 0) for item in forecast_data)
#         if max_rain_prob > 80:
#             alerts.append({
#                 'alert_type': 'flood',
#                 'message': f"Flood risk in {location.name}: High rain probability ({max_rain_prob}%) expected.",
#                 'severity': 'high',
#                 'recommendation': 'Avoid low-lying areas, prepare emergency supplies.'
#             })

#     # Lưu hoặc cập nhật cảnh báo vào DB
#     existing_alerts = WeatherAlert.objects.filter(location=location)
#     for alert in alerts:
#         # Kiểm tra xem cảnh báo đã tồn tại chưa, nếu có thì cập nhật
#         existing = existing_alerts.filter(alert_type=alert['alert_type']).first()
#         if existing:
#             existing.message = alert['message']
#             existing.severity = alert['severity']
#             existing.recommendation = alert['recommendation']
#             existing.save()
#         else:
#             WeatherAlert.objects.create(
#                 location=location,
#                 alert_type=alert['alert_type'],
#                 message=alert['message'],
#                 severity=alert['severity'],
#                 recommendation=alert['recommendation']
#             )
    
#     # Trả về danh sách cảnh báo hiện tại
#     return existing_alerts

def check_weather_alerts(location, current_weather_data, forecast_data=None):
    alerts = []
    temp = current_weather_data.get('temperature', 0)
    wind_speed = current_weather_data.get('wind_speed', 0)
    humidity = current_weather_data.get('humidity', 0)
    condition = current_weather_data.get('weather_condition', '').lower()

    def add_alert(alert_type, message, severity=None, recommendation=None):
        WeatherAlert.objects.create(
            location=location,
            alert_type=alert_type,
            message=message,
            severity=severity or 'low',
            recommendation=recommendation or ''
        )

    WeatherAlert.objects.filter(location=location).delete()

    is_dangerous = False
    if wind_speed > 20 or 'storm' in condition or 'thunderstorm' in condition:
        is_dangerous = True
        add_alert('storm', f"Storm warning in {location.name}: High winds ({wind_speed} m/s) or stormy conditions detected.",
                 'high' if wind_speed > 25 else 'medium', 'Stay indoors, secure outdoor objects.')
    if temp > 40:
        is_dangerous = True
        add_alert('extreme_temperature', f"Extreme heat warning in {location.name}: Temperature reached {temp}°C.",
                 'high', 'Stay hydrated, avoid outdoor activities.')
    elif temp < -10:
        is_dangerous = True
        add_alert('extreme_temperature', f"Extreme cold warning in {location.name}: Temperature dropped to {temp}°C.",
                 'high', 'Dress warmly, limit outdoor exposure.')
    if 'fog' in condition and humidity > 90:
        is_dangerous = True
        add_alert('fog', f"Dense fog warning in {location.name}: Low visibility due to high humidity ({humidity}%).",
                 'medium', 'Drive slowly, use fog lights.')
    if forecast_data:
        max_rain_prob = max(item.get('rain_probability', 0) for item in forecast_data)
        if max_rain_prob > 80:
            is_dangerous = True
            add_alert('flood', f"Flood risk in {location.name}: High rain probability ({max_rain_prob}%) expected.",
                     'high', 'Avoid low-lying areas, prepare emergency supplies.')
    if not is_dangerous:
        add_alert('good_weather', f"Great weather in {location.name}: Temperature at {temp}°C, {condition}.",
                 'low', 'Perfect day for outdoor activities!')

    return WeatherAlert.objects.filter(location=location)
