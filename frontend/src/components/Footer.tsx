// src/components/Footer.tsx
import { Link } from 'react-router-dom';
import { Sun } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900/70 to-black/70 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold">tibiki</span>
          </div>
          
          {/* <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <Link to="/about" className="hover:text-blue-300 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-blue-300 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</Link>
          </div> */}
          
          <div className="text-sm text-white/70">
            © {new Date().getFullYear()} tibiki. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;