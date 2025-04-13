// src/components/WeatherDetail.tsx
import { Thermometer, Droplet, Eye, CloudRain } from 'lucide-react';

interface WeatherDetailProps {
  type: 'feels-like' | 'precipitation' | 'visibility' | 'humidity';
  title: string;
  value: string;
  unit?: string;
  description?: string;
  className?: string;
}

const WeatherDetail = ({ type, title, value, unit, description, className }: WeatherDetailProps) => {
  const getIcon = () => {
    switch (type) {
      case 'feels-like':
        return <Thermometer className="h-5 w-5 text-white group-hover:brightness-150 transition-all duration-300" />;
      case 'precipitation':
        return <Droplet className="h-5 w-5 text-white group-hover:brightness-150 transition-all duration-300" />;
      case 'visibility':
        return <Eye className="h-5 w-5 text-white group-hover:brightness-150 transition-all duration-300" />;
      case 'humidity':
        return <CloudRain className="h-5 w-5 text-white group-hover:brightness-150 transition-all duration-300" />;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="glass-card rounded-xl p-4 min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <h3 className="text-sm font-medium text-white/80 group-hover:brightness-125 transition-all duration-300">{title}</h3>
        </div>
        <p className="text-2xl font-medium text-white group-hover:brightness-125 transition-all duration-300">
          {value}
          {unit && <span className="text-lg">{unit}</span>}
        </p>
        {description && (
          <p className="text-sm text-white/70 group-hover:brightness-125 transition-all duration-300">{description}</p>
        )}
      </div>
    </div>
  );
};

export default WeatherDetail;