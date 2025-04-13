// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  location: string;
  setLocation: (value: string) => void;
  coordinates: { latitude: number; longitude: number } | null;
  setCoordinates: (value: { latitude: number; longitude: number } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [location, setLocation] = useState('Hà Nội, VN');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Đồng bộ isAuthenticated với trạng thái đăng nhập
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });

          fetchLocationName(latitude, longitude).then((name) => {
            if (name) {
              setLocation(`${name}, VN`);
            }
          });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchLocationName = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].name;
      }
      return null;
    } catch (error) {
      console.error('Error fetching location name:', error);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        location,
        setLocation,
        coordinates,
        setCoordinates,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};