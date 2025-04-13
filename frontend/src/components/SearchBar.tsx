import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onSearch?: (location: string) => void;
  placeholder?: string; // Thêm prop placeholder
}

const SearchBar = ({ className, onSearch, placeholder }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };
  
  return (
    <div className={cn('relative z-10 w-full max-w-md mx-auto', className)}>
      <form 
        onSubmit={handleSubmit}
        className={cn(
          'relative flex items-center w-full transition-all duration-300 ease-in-out',
          'rounded-full bg-glass backdrop-blur-lg border border-white/20',
          isFocused ? 'shadow-lg ring-2 ring-white/20' : 'shadow'
        )}
      >
        <MapPin 
          className="absolute left-4 text-white/70" 
          size={18} 
        />
        <input
          type="text"
          placeholder={placeholder || 'Hanoi, Vietnam'} // Sử dụng placeholder từ props, mặc định là "Hanoi, Vietnam"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent pl-12 pr-12 py-3 text-sm font-medium text-white placeholder:text-white/50 focus:outline-none"
        />
        <button 
          type="submit"
          className="absolute right-3 text-white/70 hover:text-white transition-colors duration-200"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;