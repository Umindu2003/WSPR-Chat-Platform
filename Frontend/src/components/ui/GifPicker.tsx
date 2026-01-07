import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface GiphyGif {
  id: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_GIPHY_API_KEY;

  const fetchGifs = async (query: string = '') => {
    setLoading(true);
    try {
      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load trending GIFs on mount
    fetchGifs();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchGifs(searchQuery);
      } else {
        fetchGifs(); // Show trending if search is cleared
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleGifSelect = (gif: GiphyGif) => {
    onSelect(gif.images.fixed_height.url);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="fixed bottom-20 left-2 right-2 sm:absolute sm:bottom-full sm:left-0 sm:right-auto mb-2 bg-dark-elevated rounded-2xl shadow-2xl border border-dark-border w-auto sm:w-80 md:w-96 max-h-[60vh] sm:max-h-96 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <h3 className="font-semibold text-dark-text">Choose a GIF</h3>
        <button
          onClick={onClose}
          className="text-dark-text-muted hover:text-dark-text transition-colors p-1 rounded-lg hover:bg-dark-border"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-dark-border">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-xl text-sm text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all"
          />
        </div>
      </div>

      {/* GIF Grid */}
      <div className="p-3 overflow-y-auto max-h-72 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></span>
              <span
                className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></span>
              <span
                className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></span>
            </div>
          </div>
        ) : gifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifSelect(gif)}
                className="relative overflow-hidden rounded-xl hover:ring-2 hover:ring-accent-primary transition-all group cursor-pointer aspect-square"
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt="GIF"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-dark-text-muted text-sm">
            No GIFs found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-dark-border text-center">
        <p className="text-[10px] text-dark-text-muted">Powered by GIPHY</p>
      </div>
    </motion.div>
  );
}
