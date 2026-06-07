import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Send,
  BarChart3,
  Cloud,
  ThumbsUp,
  Check,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { post } from '@/utils/request';

interface HallRating {
  id: string;
  name: string;
  rating: number;
}

interface WordCloudItem {
  word: string;
  count: number;
}

const initialRatings: HallRating[] = [
  { id: '1', name: '第一展厅·青铜器', rating: 0 },
  { id: '2', name: '第二展厅·书画', rating: 0 },
  { id: '3', name: '第三展厅·玉器', rating: 0 },
  { id: '4', name: '第四展厅·陶瓷', rating: 0 },
  { id: '5', name: '第五展厅·丝绸之路', rating: 0 },
  { id: '6', name: '第六展厅·明清珍宝', rating: 0 },
];

const satisfactionData = [
  { name: '青铜器', avg: 4.8, count: 2856 },
  { name: '书画', avg: 4.9, count: 3120 },
  { name: '玉器', avg: 4.7, count: 2640 },
  { name: '陶瓷', avg: 4.6, count: 2380 },
  { name: '丝绸之路', avg: 4.9, count: 3560 },
  { name: '明清珍宝', avg: 4.5, count: 2190 },
];

const wordCloudData: WordCloudItem[] = [
  { word: '震撼', count: 1580 },
  { word: '精美', count: 1420 },
  { word: '历史悠久', count: 1280 },
  { word: '值得一看', count: 1150 },
  { word: '文化底蕴', count: 980 },
  { word: '展品丰富', count: 920 },
  { word: '讲解专业', count: 850 },
  { word: '服务好', count: 780 },
  { word: '环境优雅', count: 720 },
  { word: '秩序井然', count: 680 },
  { word: '不虚此行', count: 650 },
  { word: '受益匪浅', count: 620 },
  { word: '古朴典雅', count: 580 },
  { word: '生动有趣', count: 540 },
  { word: '国宝级', count: 520 },
  { word: '博大精深', count: 490 },
  { word: '流连忘返', count: 460 },
  { word: '性价比高', count: 420 },
];

const barColors = ['#8B6341', '#A68154', '#B8860B', '#DCB03C', '#6B4A31', '#543A27'];

export default function VisitorFeedback() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [ratings, setRatings] = useState<HallRating[]>(initialRatings);
  const [comment, setComment] = useState('');
  const [hoveredStars, setHoveredStars] = useState<{ hallId: string; rating: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRating = (hallId: string, rating: number) => {
    setRatings((prev) =>
      prev.map((h) => (h.id === hallId ? { ...h, rating } : h))
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await post('/feedback', {
        userId: user?.id,
        ratings: ratings.map((r) => ({ hallId: r.id, rating: r.rating })),
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = ratings.some((r) => r.rating > 0)
    ? (
        ratings.reduce((sum, r) => sum + r.rating, 0) /
        ratings.filter((r) => r.rating > 0).length
      ).toFixed(1)
    : '0.0';

  const getWordStyle = (count: number) => {
    const maxCount = Math.max(...wordCloudData.map((w) => w.count));
    const minCount = Math.min(...wordCloudData.map((w) => w.count));
    const ratio = (count - minCount) / (maxCount - minCount);
    const size = 14 + ratio * 28;
    const isGold = ratio > 0.6;
    return {
      fontSize: `${size}px`,
      color: isGold ? '#B8860B' : ratio > 0.3 ? '#8B6341' : '#A68154',
      fontWeight: isGold ? 700 : ratio > 0.3 ? 600 : 500,
    };
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-museum-cream flex items-center justify-center p-4">
        <div
          className={`text-center transition-all duration-700 ${
            mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-museum-gold-400 to-museum-gold-600 shadow-gold-hover animate-pulse-gold">
            <Check className="h-12 w-12 text-museum-brown-900" />
          </div>
          <h1 className="mb-3 font-serif text-3xl font-bold text-museum-brown-900">
            感谢您的反馈！
          </h1>
          <p className="mb-8 text-museum-brown-500 max-w-md mx-auto">
            您的每一条评价都是我们前进的动力，期待您的再次光临
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/visitor/home')} className="btn-brown">
              返回首页
            </button>
            <button onClick={() => navigate('/visitor/booking')} className="btn-gold">
              再次预约
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-museum-cream">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
        <div
          className={`mb-8 text-center transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2">
            <Heart className="h-6 w-6 text-museum-crimson" />
            <span className="text-museum-brown-500 text-sm tracking-wider">VISITOR FEEDBACK</span>
            <Heart className="h-6 w-6 text-museum-crimson" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-museum-brown-900 mb-2">
            感谢您的参观
          </h1>
          <p className="text-museum-brown-500">请为本次体验评分，您的反馈对我们很重要</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`space-y-6 transition-all duration-700 delay-100 ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
          >
            <div className="museum-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                  <Star className="h-5 w-5 text-museum-gold-600" />
                  展区评分
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-museum-gold-500 text-museum-gold-500" />
                  <span className="text-xl font-bold gold-text">{averageRating}</span>
                </div>
              </div>

              <div className="space-y-4">
                {ratings.map((hall, idx) => (
                  <div
                    key={hall.id}
                    style={{ transitionDelay: `${idx * 80}ms` }}
                    className="flex items-center justify-between gap-4 rounded-xl border border-museum-brown-100 p-3 hover:bg-museum-brown-50 transition-colors"
                  >
                    <span className="flex-shrink-0 text-sm font-medium text-museum-brown-700 w-28">
                      {hall.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeRating =
                          hoveredStars?.hallId === hall.id
                            ? hoveredStars.rating
                            : hall.rating;
                        const isActive = star <= activeRating;

                        return (
                          <button
                            key={star}
                            onMouseEnter={() => setHoveredStars({ hallId: hall.id, rating: star })}
                            onMouseLeave={() => setHoveredStars(null)}
                            onClick={() => handleRating(hall.id, star)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                isActive
                                  ? 'fill-museum-gold-500 text-museum-gold-500'
                                  : 'text-museum-brown-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-10 text-right text-sm font-medium text-museum-gold-600">
                      {hall.rating > 0 ? `${hall.rating}.0` : '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="museum-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                <MessageSquare className="h-5 w-5 text-museum-gold-600" />
                文字评论
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请分享您的参观感受、建议或想要说的话..."
                rows={6}
                className="w-full resize-none rounded-xl border border-museum-brown-200 bg-museum-brown-50/50 p-4 text-museum-brown-800 placeholder-museum-brown-400 transition-all focus:border-museum-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-museum-gold-500/30"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {['展品精美', '服务周到', '环境优雅', '值得再来'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setComment((prev) => (prev ? `${prev} ${tag}` : tag))
                      }
                      className="rounded-full border border-museum-brown-200 bg-museum-brown-50 px-3 py-1 text-xs text-museum-brown-600 hover:border-museum-gold-400 hover:bg-museum-gold-50 transition-all"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-museum-brown-400">{comment.length}/500</span>
              </div>
            </div>
          </div>

          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="museum-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                <BarChart3 className="h-5 w-5 text-museum-gold-600" />
                满意度排行榜
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={satisfactionData.sort((a, b) => b.avg - a.avg)}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B4A31', fontSize: 12 }}
                      axisLine={{ stroke: '#D4BF9E' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fill: '#6B4A31', fontSize: 12 }}
                      axisLine={{ stroke: '#D4BF9E' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF5',
                        border: '1px solid #D4BF9E',
                        borderRadius: '8px',
                        boxShadow: '0 4px 15px rgba(62, 39, 35, 0.1)',
                      }}
                      labelStyle={{ color: '#3E2723', fontWeight: 600 }}
                      formatter={(value: number) => [`${value} 分`, '平均评分']}
                    />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={36}>
                      {satisfactionData
                        .sort((a, b) => b.avg - a.avg)
                        .map((_, idx) => (
                          <Cell key={idx} fill={barColors[idx % barColors.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-museum-brown-500">
                <ThumbsUp className="h-3.5 w-3.5 text-museum-gold-600" />
                <span>基于近30天 16,746 条真实评价</span>
              </div>
            </div>

            <div className="museum-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                <Cloud className="h-5 w-5 text-museum-gold-600" />
                热门评价词云
              </h3>
              <div className="rounded-xl bg-gradient-to-br from-museum-brown-50 to-museum-gold-50/50 p-5 min-h-[220px]">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 py-2">
                  {wordCloudData.map((item, idx) => {
                    const style = getWordStyle(item.count);
                    return (
                      <span
                        key={item.word}
                        style={{
                          ...style,
                          transitionDelay: `${idx * 30}ms`,
                        }}
                        className={`cursor-pointer transition-all hover:scale-110 ${
                          mounted ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {item.word}
                      </span>
                    );
                  })}
                </div>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-museum-brown-500">
                <Sparkles className="h-3.5 w-3.5 text-museum-gold-600" />
                关键词字号越大表示出现频次越高
              </p>
            </div>
          </div>
        </div>

        <div
          className={`mt-8 transition-all duration-700 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold mx-auto flex items-center justify-center gap-2 px-12 py-4 text-lg"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>提交反馈</span>
              </>
            )}
          </button>
        </div>

        <div
          className={`mt-10 text-center text-xs text-museum-brown-400 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          您的反馈将在审核后展示，感谢您对华夏博物馆的支持
        </div>
      </div>
    </div>
  );
}
