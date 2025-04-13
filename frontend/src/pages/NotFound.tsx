import { Link } from "react-router-dom";
import { ArrowLeft, CloudOff } from "lucide-react";
import WeatherBackground from "@/components/WeatherBackground";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  return (
    <WeatherBackground type="cloudy">
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-md text-center animate-fade-in backdrop-blur-lg">
            <div className="flex justify-center mb-6">
              <CloudOff className="h-24 w-24 text-white/80" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">404</h1>
            <p className="text-xl text-white/80 mb-6">
              Oops! The forecast for this page isn't looking good.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-3 transition-colors"
            >
              <span>Return to Home</span>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default NotFound;