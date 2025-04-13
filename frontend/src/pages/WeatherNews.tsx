import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WeatherBackground from '@/components/WeatherBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WeatherNews = () => {
  const [newsArticles, setNewsArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/news/');
        setNewsArticles(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  return (
    <WeatherBackground type="cloudy">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Tin tức thời tiết</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article) => (
              <div
                key={article.id}
                className="glass-card rounded-xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <img
                  src={article.image || '/placeholder.png'} // Cần thêm trường image trong NewsArticle nếu muốn hiển thị
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white line-clamp-2">{article.title}</h2>
                  <p className="text-sm text-white/70">
                    {new Date(article.published_at).toLocaleDateString()}
                  </p>
                  <p className="text-white/80 line-clamp-3">{article.content.substring(0, 100)}...</p>
                  <Link
                    to={`/weather-news/${article.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Đọc thêm
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default WeatherNews;