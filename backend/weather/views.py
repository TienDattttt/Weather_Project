from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Location, CurrentWeather, Forecast, NewsArticle, UserProfile, WeatherAlert
from .serializers import (
    CurrentWeatherSerializer, ForecastSerializer, NewsArticleSerializer, 
    LocationInputSerializer, UserRegistrationSerializer, UserLoginSerializer, 
    WeatherAlertSerializer, UserProfileSerializer, FavoriteLocationSerializer, 
    NotificationSettingsSerializer
)
from .utils import fetch_current_weather, fetch_forecast, geocode_location, check_weather_alerts
from django.utils import timezone
from datetime import timedelta, datetime
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
import uuid
from django.core.mail import send_mail

import logging
logger = logging.getLogger(__name__)

class CurrentWeatherViewSet(viewsets.ModelViewSet):
    queryset = CurrentWeather.objects.all()
    serializer_class = CurrentWeatherSerializer

    @action(detail=False, methods=['post'], serializer_class=LocationInputSerializer)
    def by_location(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        location_data = None
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        location_name = serializer.validated_data.get('name')

        logger.info(f"Request data: {request.data}")

        if latitude and longitude:
            try:
                location = Location.objects.get(latitude=latitude, longitude=longitude)
                logger.info(f"Found location by coordinates: {location}")
            except Location.DoesNotExist:
                location_data = {'name': 'Custom Location', 'latitude': latitude, 'longitude': longitude, 'country_code': ''}
                location = Location.objects.create(**location_data)
                logger.info(f"Created new location by coordinates: {location_data}")
        elif location_name:
            location_data = geocode_location(location_name)
            logger.info(f"Geocoded location data: {location_data}")
            if not location_data:
                logger.error(f"Could not geocode location: {location_name}")
                return Response({"error": "Could not find location"}, status=404)
            try:
                location = Location.objects.get(latitude=location_data['latitude'], longitude=location_data['longitude'])
                logger.info(f"Found existing location: {location}")
            except Location.DoesNotExist:
                location = Location.objects.create(**location_data)
                logger.info(f"Created new location: {location_data}")

        try:
            current_weather = CurrentWeather.objects.filter(location=location).first()
            if not current_weather:
                weather_data = fetch_current_weather(location.latitude, location.longitude)
                logger.info(f"Fetched new weather data: {weather_data}")
                if weather_data:
                    current_weather = CurrentWeather.objects.create(location=location, **weather_data)
                else:
                    logger.error("Failed to fetch weather data")
                    return Response({"error": "Failed to fetch weather data"}, status=500)
            elif timezone.now() - current_weather.timestamp > timedelta(minutes=5):
                weather_data = fetch_current_weather(location.latitude, location.longitude)
                logger.info(f"Updated weather data: {weather_data}")
                if weather_data:
                    for key, value in weather_data.items():
                        setattr(current_weather, key, value)
                    current_weather.timestamp = timezone.now()
                    current_weather.save()
                else:
                    logger.warning("Using old weather data due to fetch failure")

            forecast_data = fetch_forecast(location.latitude, location.longitude)
            logger.info(f"Forecast data: {forecast_data}")
            alerts = check_weather_alerts(location, {
                'temperature': float(current_weather.temperature),
                'humidity': float(current_weather.humidity),
                'wind_speed': float(current_weather.wind_speed),
                'pressure': float(current_weather.pressure),
                'weather_condition': current_weather.weather_condition,
                'icon_url': current_weather.icon_url
            }, forecast_data)

            serializer = CurrentWeatherSerializer(current_weather)
            return Response({
                'weather': serializer.data,
                'alerts': WeatherAlertSerializer(alerts, many=True).data if alerts else []
            })
        except Exception as e:
            logger.error(f"Error processing weather data: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)

class WeatherAlertViewSet(viewsets.ModelViewSet):
    queryset = WeatherAlert.objects.all()
    serializer_class = WeatherAlertSerializer

    @action(detail=False, methods=['post'], serializer_class=LocationInputSerializer)
    def by_location(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        location_name = serializer.validated_data.get('name')

        # Xác định vị trí
        if latitude and longitude:
            try:
                location = Location.objects.get(latitude=latitude, longitude=longitude)
            except Location.DoesNotExist:
                location_data = {'name': 'Custom Location', 'latitude': latitude, 'longitude': longitude, 'country_code': ''}
                location = Location.objects.create(**location_data)
        elif location_name:
            location_data = geocode_location(location_name)
            if not location_data:
                return Response({"error": "Could not find location"}, status=status.HTTP_404_NOT_FOUND)
            try:
                location = Location.objects.get(latitude=location_data['latitude'], longitude=location_data['longitude'])
            except Location.DoesNotExist:
                location = Location.objects.create(**location_data)
        else:
            return Response({"error": "Invalid location data"}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy dữ liệu thời tiết và kiểm tra cảnh báo
        weather_data = fetch_current_weather(location.latitude, location.longitude)
        if not weather_data:
            return Response({"error": "Failed to fetch weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        forecast_data = fetch_forecast(location.latitude, location.longitude)
        alerts = check_weather_alerts(location, weather_data, forecast_data)

        # Sử dụng serializer để trả về dữ liệu đúng định dạng
        serialized_alerts = WeatherAlertSerializer(alerts, many=True).data
        return Response(serialized_alerts, status=status.HTTP_200_OK)

class ForecastViewSet(viewsets.ModelViewSet):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer

    def retrieve(self, request, *args, **kwargs):
        location_id = kwargs.get('pk')
        forecast_type = request.query_params.get('type', 'daily')  # Mặc định là daily
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return Response({"error": "Location not found"}, status=404)

        # Xóa dữ liệu cũ và cập nhật dự báo mới
        Forecast.objects.filter(location=location).delete()
        forecast_data = fetch_forecast(location.latitude, location.longitude)
        if not forecast_data:
            return Response({"error": "Failed to fetch forecast data"}, status=500)

        forecasts = []
        for item in forecast_data:
            if item['forecast_type'] == forecast_type:
                forecast = Forecast.objects.create(location=location, **item)
                forecasts.append(forecast)

        serializer = self.get_serializer(forecasts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def all_types(self, request, pk=None):
        try:
            location = Location.objects.get(id=pk)
        except Location.DoesNotExist:
            return Response({"error": "Location not found"}, status=404)

        # Xóa dữ liệu cũ và cập nhật dự báo mới
        Forecast.objects.filter(location=location).delete()
        forecast_data = fetch_forecast(location.latitude, location.longitude)
        if not forecast_data:
            return Response({"error": "Failed to fetch forecast data"}, status=500)

        forecasts = [Forecast.objects.create(location=location, **item) for item in forecast_data]
        serializer = self.get_serializer(forecasts, many=True)
        return Response(serializer.data)

class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.all().order_by('-published_at')  # Sắp xếp theo thời gian mới nhất
    serializer_class = NewsArticleSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Registration successful.',
                'user': {
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        print("Request data:", request.data)
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Login successful',
                'token': token.key,
                'user': {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        email = request.data.get('email')
        user = get_object_or_404(UserProfile, email=email)
        token = str(uuid.uuid4())
        user.confirmation_token = token
        user.save()

        reset_link = f"http://localhost:8000/api/auth/reset-password/{token}/"
        send_mail(
            'Reset Your Password',
            f'Click this link to reset your password: {reset_link}',
            'from@example.com',
            [user.email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset link sent to your email.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='reset-password/(?P<token>[^/.]+)')
    def reset_password(self, request, token=None):
        user = get_object_or_404(UserProfile, confirmation_token=token)
        new_password = request.data.get('password')
        if not new_password or len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.confirmation_token = None
        user.save()
        return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]  # Yêu cầu đăng nhập cho tất cả action

    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_profile(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def add_favorite_location(self, request):
        serializer = LocationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        location_data = None
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        location_name = serializer.validated_data.get('name')

        if latitude and longitude:
            try:
                location = Location.objects.get(latitude=latitude, longitude=longitude)
            except Location.DoesNotExist:
                location_data = {'name': 'Custom Location', 'latitude': latitude, 'longitude': longitude, 'country_code': ''}
                location = Location.objects.create(**location_data)
        elif location_name:
            location_data = geocode_location(location_name)
            if not location_data:
                return Response({"error": "Could not find location"}, status=status.HTTP_404_NOT_FOUND)
            try:
                location = Location.objects.get(latitude=location_data['latitude'], longitude=location_data['longitude'])
            except Location.DoesNotExist:
                location = Location.objects.create(**location_data)
        else:
            return Response({"error": "Invalid location data"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.favorite_locations.add(location)
        return Response({"message": f"Added {location.name} to favorite locations"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def remove_favorite_location(self, request):
        location_id = request.data.get('location_id')
        if not location_id:
            return Response({"error": "Location ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        try:
            location = Location.objects.get(id=location_id)
            user.favorite_locations.remove(location)
            return Response({"message": f"Removed {location.name} from favorite locations"}, status=status.HTTP_200_OK)
        except Location.DoesNotExist:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def update_notification_settings(self, request):
        serializer = NotificationSettingsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.notification_settings = serializer.validated_data
        user.save()
        return Response({"message": "Notification settings updated"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def check_notifications(self, request):
        serializer = LocationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        location_name = serializer.validated_data.get('name')

        # Xác định vị trí
        if latitude and longitude:
            try:
                location = Location.objects.get(latitude=latitude, longitude=longitude)
            except Location.DoesNotExist:
                location_data = {'name': 'Custom Location', 'latitude': latitude, 'longitude': longitude, 'country_code': ''}
                location = Location.objects.create(**location_data)
        elif location_name:
            location_data = geocode_location(location_name)
            if not location_data:
                return Response({"error": "Could not find location"}, status=status.HTTP_404_NOT_FOUND)
            try:
                location = Location.objects.get(latitude=location_data['latitude'], longitude=location_data['longitude'])
            except Location.DoesNotExist:
                location = Location.objects.create(**location_data)
        else:
            return Response({"error": "Invalid location data"}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy dữ liệu thời tiết và dự báo
        weather_data = fetch_current_weather(location.latitude, location.longitude)
        if not weather_data:
            return Response({"error": "Failed to fetch weather data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        forecast_data = fetch_forecast(location.latitude, location.longitude)
        if not forecast_data:
            return Response({"error": "Failed to fetch forecast data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Kiểm tra cảnh báo
        alerts = check_weather_alerts(location, weather_data, forecast_data)

        # Lọc cảnh báo dựa trên cài đặt thông báo của người dùng
        user = request.user
        notification_settings = user.notification_settings
        filtered_alerts = [
            alert for alert in alerts
            if notification_settings.get(alert.alert_type, False)  # Sửa từ alert['alert_type'] thành alert.alert_type
        ]

        # Gửi email thông báo (nếu có)
        for alert in filtered_alerts:
            send_mail(
                f"Weather Alert: {alert.alert_type.capitalize()}",
                f"{alert.message}\nRecommendation: {alert.recommendation or 'No recommendation'}",
                'from@example.com',
                [user.email],
                fail_silently=True,
            )

        # Serialize dữ liệu để trả về dưới dạng JSON
        serialized_alerts = WeatherAlertSerializer(filtered_alerts, many=True).data
        return Response(serialized_alerts, status=status.HTTP_200_OK)