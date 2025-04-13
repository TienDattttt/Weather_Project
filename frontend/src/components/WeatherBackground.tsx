
import React, { useEffect, useRef } from 'react';

type WeatherType = 'rainy' | 'sunny' | 'cloudy' | 'clear' | 'snowy' | 'stormy';

interface WeatherBackgroundProps {
  type: WeatherType;
  children: React.ReactNode;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ type, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (type !== 'rainy' || !containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Clear existing drops
    const existingDrops = container.querySelectorAll('.rain-drop');
    existingDrops.forEach(drop => drop.remove());
    
    // Create raindrops
    const createRaindrops = () => {
      const dropCount = Math.floor(width * height / 10000);
      
      for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        
        // Random positioning
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * 100}%`;
        drop.style.opacity = `${0.2 + Math.random() * 0.5}`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${1 + Math.random() * 0.5}s`;
        
        container.appendChild(drop);
      }
    };
    
    createRaindrops();
    
    return () => {
      const rainDrops = container.querySelectorAll('.rain-drop');
      rainDrops.forEach(drop => drop.remove());
    };
  }, [type]);
  
  const getBgImage = () => {
    // Use the provided image URL for all weather types
    return 'bg-[url("https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80")]';
  };
  
  const getOverlay = () => {
    switch (type) {
      case 'rainy':
      case 'stormy':
        return 'bg-black/20';
      default:
        return 'bg-black/10';
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${getBgImage()} bg-cover bg-center bg-no-repeat bg-fixed`}
    >
      <div className={`fixed inset-0 ${getOverlay()}`}></div>
      {children}
    </div>
  );
};

export default WeatherBackground;
