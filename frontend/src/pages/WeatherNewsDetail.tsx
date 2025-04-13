import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import WeatherBackground from '@/components/WeatherBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Article {
  id: number;
  title: string;
  content: string;
  published_at: string;
  image: string | null;
}

const WeatherNewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch bài viết hiện tại
        const articleResponse = await axios.get<Article>(`http://localhost:8000/api/news/${id}/`);
        setArticle(articleResponse.data);

        // Fetch danh sách bài viết khác
        const relatedResponse = await axios.get<Article[]>(`http://localhost:8000/api/news/`);
        // Lọc bỏ bài viết hiện tại khỏi danh sách liên quan
        const filteredArticles = relatedResponse.data.filter(item => item.id !== parseInt(id || '0'));
        setRelatedArticles(filteredArticles.slice(0, 5)); // Lấy 5 bài viết đầu tiên làm ví dụ
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <WeatherBackground type="cloudy">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
            <p className="text-white text-lg">Đang tải...</p>
          </main>
          <Footer />
        </div>
      </WeatherBackground>
    );
  }

  if (error || !article) {
    return (
      <WeatherBackground type="cloudy">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-10">
            <Link to="/weather-news" className="text-white hover:text-blue-300 flex items-center gap-2 mb-6">
              <span>Quay lại</span>
            </Link>
            <div className="glass-card rounded-xl p-6 backdrop-blur-md">
              <p className="text-red-400">{error || 'Bài viết không tồn tại.'}</p>
            </div>
          </main>
          <Footer />
        </div>
      </WeatherBackground>
    );
  }

  return (
    <WeatherBackground type="cloudy">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10">
          <Link to="/weather-news" className="text-white hover:text-blue-300 flex items-center gap-2 mb-6">
            <span>Quay lại</span>
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Nội dung chính */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-6 backdrop-blur-md">
                <img
                  src={article.image || '/placeholder.png'}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
                <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>
                <p className="text-sm text-white/70 mb-4">
                  {new Date(article.published_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-white/90 leading-relaxed">{article.content}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 backdrop-blur-md sticky top-4">
                <h2 className="text-xl font-bold text-white mb-4">Bài viết liên quan</h2>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/weather-news/${related.id}`}
                      className="block hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex gap-3">
                        <img
                          src={related.image || '/placeholder.png'}
                          alt={related.title}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <div>
                          <h3 className="text-white font-semibold line-clamp-2">{related.title}</h3>
                         
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </WeatherBackground>
  );
};

export default WeatherNewsDetail;