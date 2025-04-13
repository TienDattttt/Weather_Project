# weather/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurrentWeatherViewSet, ForecastViewSet, NewsArticleViewSet, AuthViewSet, WeatherAlertViewSet,UserProfileViewSet

router = DefaultRouter()
router.register(r'current', CurrentWeatherViewSet, basename='current-weather')
router.register(r'forecast', ForecastViewSet, basename='forecast')
router.register(r'news', NewsArticleViewSet, basename='news-article')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'alerts', WeatherAlertViewSet, basename='weather-alert')
router.register(r'user', UserProfileViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]