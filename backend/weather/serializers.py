# weather/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Location, CurrentWeather, Forecast, NewsArticle, UserProfile, WeatherAlert



class LocationInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)

    def validate(self, data):
        # Đảm bảo có ít nhất một trong hai: tên hoặc tọa độ
        if not data.get('name') and (not data.get('latitude') or not data.get('longitude')):
            raise serializers.ValidationError("Either 'name' or both 'latitude' and 'longitude' must be provided.")
        return data

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'country_code']


class CurrentWeatherSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)


    class Meta:
        model = CurrentWeather
        fields = ['id', 'location', 'temperature', 'humidity', 'wind_speed', 'pressure',
                  'weather_condition', 'icon_url', 'timestamp', 'updated_at']
       
class ForecastSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)


    class Meta:
        model = Forecast
        fields = ['id', 'location', 'forecast_type', 'forecast_time', 'high_temperature',
                  'low_temperature', 'rain_probability', 'uv_index']
       
class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = ['id', 'title', 'content', 'published_at','image']



class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserProfile
        fields = ['username', 'first_name', 'last_name', 'email', 'password']

    def validate(self, data):
        if UserProfile.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        if UserProfile.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return data

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        login = data.get('login')
        password = data.get('password')

        if not login or not password:
            raise serializers.ValidationError({"non_field_errors": ["Both login and password are required."]})

        # Xác thực bằng username hoặc email
        user = authenticate(request=self.context.get('request'), username=login, password=password)
        if not user and '@' in login:
            try:
                user_obj = UserProfile.objects.get(email=login)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except UserProfile.DoesNotExist:
                user = None

        if user is None:
            raise serializers.ValidationError({"non_field_errors": ["Invalid login credentials."]})
        
        data['user'] = user
        return data
    
class WeatherAlertSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)

    class Meta:
        model = WeatherAlert
        fields = ['id', 'location', 'alert_type', 'message', 'severity', 'recommendation', 'issued_at']

class FavoriteLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude', 'country_code']

# Serializer cho UserProfile (bao gồm vị trí yêu thích và cài đặt thông báo)
class UserProfileSerializer(serializers.ModelSerializer):
    favorite_locations = FavoriteLocationSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'favorite_locations', 'notification_settings']

# Serializer để cập nhật cài đặt thông báo
class NotificationSettingsSerializer(serializers.Serializer):
    rain = serializers.BooleanField(default=False)
    storm = serializers.BooleanField(default=False)
    extreme_temperature = serializers.BooleanField(default=False)
    fog = serializers.BooleanField(default=False)