# weather/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Location(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    country_code = models.CharField(max_length=10)
    is_auto_detected = models.BooleanField(default=False) # để phân biệt vị trí tự động

    def __str__(self):
        return self.name

class CurrentWeather(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    pressure = models.DecimalField(max_digits=10, decimal_places=2)
    weather_condition = models.CharField(max_length=255)
    icon_url = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Weather at {self.location.name}"

class Forecast(models.Model):
    FORECAST_TYPES = [
        ('short', 'Short-term'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    forecast_type = models.CharField(max_length=20, choices=FORECAST_TYPES)
    forecast_time = models.DateTimeField()
    high_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    low_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    rain_probability = models.DecimalField(max_digits=5, decimal_places=2)
    uv_index = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.forecast_type.capitalize()} Forecast for {self.location.name}"

class WeatherAlert(models.Model):
    ALERT_TYPES = [
        ('storm', 'Storm'),
        ('flood', 'Flood'),
        ('extreme_temperature', 'Extreme Temperature'),
        ('fog', 'Dense Fog'),  # Thêm sương mù dày đặc
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    recommendation = models.TextField(blank=True, null=True)  # Khuyến nghị an toàn
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alert_type.capitalize()} Alert for {self.location.name}"

class UserProfile(AbstractUser):
    favorite_locations = models.ManyToManyField('Location', blank=True)
    notification_settings = models.JSONField(default=dict)
    confirmation_token = models.CharField(max_length=36, null=True, blank=True)  # Token cho reset mật khẩu

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='userprofile_groups',
        blank=True,
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='userprofile_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.username

class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    published_at = models.DateTimeField(default=timezone.now)
    image = models.ImageField(upload_to='news_images/', null=True, blank=True)  # Thêm trường hình ảnh

    def __str__(self):
        return self.title

class UserNewsShare(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    news_article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE)
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shared {self.news_article.title}"

class SupplementaryData(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    air_quality = models.DecimalField(max_digits=5, decimal_places=2)
    sunrise_time = models.TimeField()
    sunset_time = models.TimeField()
    moon_phase = models.CharField(max_length=20)

    def __str__(self):
        return f"Supplementary Data for {self.location.name}"

class OpenWeatherMapAPIUsage(models.Model):
    REQUEST_TYPES = [
        ('current', 'Current Weather'),
        ('forecast', 'Forecast'),
        ('alert', 'Weather Alert'),
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    api_call_time = models.DateTimeField(auto_now_add=True)
    response_status = models.IntegerField()
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)

    def __str__(self):
        return f"API Call for {self.location.name} at {self.api_call_time}"