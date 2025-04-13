// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext'; // Thêm AuthProvider
import Index from "./pages/Index";
import Forecast from "./pages/Forecast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import WeatherNews from "./pages/WeatherNews";
import WeatherNewsDetail from "./pages/WeatherNewsDetail";
import ForecastPage from '@/pages/ForecastPage';
import MapDetail from './pages/MapDetail';
import SettingsProfile from './pages/SettingsProfile'; 
import FavoriteLocations from './pages/FavoriteLocations';
import NotificationSettings from './pages/NotificationSettings';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider> {/* Bọc trong AuthProvider */}
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/mapdetail" element={<MapDetail />} />
              <Route path="/weather-news" element={<WeatherNews />} />
              <Route path="/weather-news/:id" element={<WeatherNewsDetail />} />
              <Route path="/forecast/:province" element={<ForecastPage />} />
              <Route path="/settings/profile" element={<SettingsProfile />} /> {/* Thêm route */}
              <Route path="/settings/favorite-locations" element={<FavoriteLocations />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;