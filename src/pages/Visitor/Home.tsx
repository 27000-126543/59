import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  Flame,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Bell,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
}

interface Exhibition {
  id: string;
  title: string;
  date: string;
  heat: number;
  bookings: number;
  location: string;
  image: string;
}

interface Exhibit {
  id: string;
  name: string;
  dynasty: string;
  heat: number;
  image: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: '1',
    title: '商周青铜器特展',
    subtitle: '穿越千年，触摸青铜文明的辉煌',
    image: '',
    gradient: 'from-amber-900 via-amber-800 to-yellow-700',
  },
  {
    id: '2',
    title: '唐宋书画珍品展',
    subtitle: '翰墨丹青，领略古人的艺术境界',
    image: '',
    gradient: 'from-stone-800 via-stone-700 to-amber-900',
  },
  {
    id: '3',
    title: '明清玉器精粹',
    subtitle: '温润如玉，感受东方美学的极致',
    image: '',
    gradient: 'from-emerald-900 via-stone-800 to-amber-900',
  },
];

const exhibitions: Exhibition[] = [
  {
    id: '1',
    title: '商周青铜器特展',
    date: '2024.01.15 - 2024.06.30',
    heat: 98,
    bookings: 12580,
    location: '第一展厅',
    image: '',
  },
  {
    id: '2',
    title: '唐宋书画珍品展',
    date: '2024.02.01 - 2024.08.15',
    heat: 92,
    bookings: 9870,
    location: '第二展厅',
    image: '',
  },
  {
    id: '3',
    title: '明清玉器精粹',
    date: '2024.03.10 - 2024.09.20',
    heat: 88,
    bookings: 7650,
    location: '第三展厅',
    image: '',
  },
  {
    id: '4',
    title: '陶瓷艺术千年展',
    date: '2024.01.01 - 2024.12.31',
    heat: 85,
    bookings: 6420,
    location: '第四展厅',
    image: '',
  },
];

const exhibits: Exhibit[] = [
  { id: '1', name: '后母戊鼎', dynasty: '商代晚期', heat: 99, image: '' },
  { id: '2', name: '清明上河图', dynasty: '北宋', heat: 97, image: '' },
  { id: '3', name: '翠玉白菜', dynasty: '清代', heat: 95, image: '' },
  { id: '4', name: '四羊方尊', dynasty: '商代', heat: 93, image: '' },
  { id: '5', name: '兰亭集序', dynasty: '东晋', heat: 91, image: '' },
  { id: '6', name: '汝窑天青釉洗', dynasty: '北宋', heat: 89, image: '' },
];

const announcements: Announcement[] = [
  {
    id: '1',
    title: '关于端午节期间开放时间调整的通知',
    date: '2024-06-05',
    content: '端午节期间（6月10日）正常开放，欢迎参观',
  },
  {
    id: '2',
    title: '新展开幕：丝绸之路文物特展',
    date: '2024-06-01',
    content: '汇集全国15家博物馆精品文物，不容错过',
  },
  {
    id: '3',
    title: '智能导览系统全面升级',
    date: '2024-05-28',
    content: '新增AR互动功能，参观体验更加丰富',
  },
];

export default function VisitorHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen bg-museum-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div
          className={`mb-6 flex items-center justify-between transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div>
            <h1 className="font-serif text-2xl font-bold text-museum-brown-900">
              欢迎，{user?.name || user?.realName || user?.username || '尊敬的观众'}
            </h1>
            <p className="mt-1 text-sm text-museum-brown-500">今天是美好的一天，来探索千年文明吧</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-museum hover:shadow-museum-hover transition-all">
              <Bell className="h-5 w-5 text-museum-brown-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-museum-crimson" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-museum-gold-400 to-museum-gold-600 shadow-gold">
              <User className="h-5 w-5 text-museum-brown-900" />
            </div>
          </div>
        </div>

        <div
          className={`mb-8 transition-all duration-700 delay-100 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl shadow-museum-hover">
            <div
              className="relative h-64 md:h-80 transition-all duration-700"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="flex h-full">
                {bannerSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`relative flex h-full w-full flex-shrink-0 items-center bg-gradient-to-r ${slide.gradient}`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 px-8 md:px-16">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-museum-gold-300" />
                        <span className="text-sm text-museum-gold-100">热门推荐</span>
                      </div>
                      <h2 className="mb-3 font-serif text-3xl md:text-5xl font-bold text-white">
                        {slide.title}
                      </h2>
                      <p className="mb-6 text-lg text-white/80">{slide.subtitle}</p>
                      <button
                        onClick={() => navigate('/visitor/booking')}
                        className="btn-gold inline-flex items-center gap-2"
                      >
                        <Ticket className="h-5 w-5" />
                        <span>立即预约</span>
                      </button>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-black/30 to-transparent" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm hover:bg-white/50 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm hover:bg-white/50 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-museum-gold-400' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`mb-8 transition-all duration-700 delay-200 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="museum-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-museum-brown-900">
                <Calendar className="h-5 w-5 text-museum-gold-600" />
                快捷预约
              </h3>
              <button
                onClick={() => navigate('/visitor/booking')}
                className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700 transition-colors"
              >
                更多选择 <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {dates.map((d, idx) => {
                const month = d.getMonth() + 1;
                const day = d.getDate();
                const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                const weekday = `周${weekdays[d.getDay()]}`;
                const full = `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === full;
                const isToday = idx === 0;
                const spotsLeft = Math.floor(Math.random() * 200) + 50;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(full)}
                    className={`flex min-w-[80px] flex-col items-center rounded-xl border-2 px-4 py-3 transition-all ${
                      isSelected
                        ? 'border-museum-gold-500 bg-gradient-to-b from-museum-gold-100 to-museum-gold-200 shadow-gold'
                        : 'border-museum-brown-200 bg-white hover:border-museum-gold-400'
                    }`}
                  >
                    {isToday && (
                      <span className="mb-1 rounded-full bg-museum-crimson px-2 py-0.5 text-xs text-white">
                        今天
                      </span>
                    )}
                    <span className={`text-sm ${isSelected ? 'text-museum-gold-700' : 'text-museum-brown-500'}`}>
                      {month}月
                    </span>
                    <span className={`text-2xl font-bold ${isSelected ? 'text-museum-brown-900' : 'text-museum-brown-800'}`}>
                      {day}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-museum-gold-700' : 'text-museum-brown-400'}`}>
                      {weekday}
                    </span>
                    <span className="mt-1 text-xs text-museum-brown-400">余{spotsLeft}张</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/visitor/booking')}
              disabled={!selectedDate}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Ticket className="h-5 w-5" />
              <span>{selectedDate ? '快速预约参观' : '请先选择日期'}</span>
            </button>
          </div>
        </div>

        <div
          className={`mb-8 transition-all duration-700 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-museum-brown-900">
              <MapPin className="h-5 w-5 text-museum-gold-600" />
              当前展览
            </h3>
            <button className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700 transition-colors">
              查看全部 <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {exhibitions.map((ex, idx) => (
              <div
                key={ex.id}
                style={{ transitionDelay: `${idx * 80}ms` }}
                className="museum-card group cursor-pointer overflow-hidden"
              >
                <div className="relative h-40 bg-gradient-to-br from-museum-brown-700 via-museum-brown-800 to-museum-brown-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-museum-gold-400/30" />
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-museum-crimson/90 px-2.5 py-1">
                    <Flame className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white">{ex.heat}°</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="mb-2 font-serif text-base font-semibold text-museum-brown-900 group-hover:text-museum-gold-700 transition-colors">
                    {ex.title}
                  </h4>
                  <div className="mb-3 flex items-center gap-1 text-xs text-museum-brown-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{ex.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-museum-brown-600">
                      <MapPin className="h-4 w-4 text-museum-gold-600" />
                      <span>{ex.location}</span>
                    </div>
                    <span className="text-museum-gold-600 font-medium">
                      {ex.bookings.toLocaleString()}人已预约
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mb-8 transition-all duration-700 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-museum-brown-900">
              <Star className="h-5 w-5 text-museum-gold-600" />
              热门展品推荐
            </h3>
            <button className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700 transition-colors">
              查看全部 <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {exhibits.map((item, idx) => (
              <div
                key={item.id}
                style={{ transitionDelay: `${idx * 60}ms` }}
                className="museum-card group cursor-pointer overflow-hidden"
              >
                <div className="relative aspect-square bg-gradient-to-br from-museum-brown-100 to-museum-brown-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-museum-gold-500/40" />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 shadow-sm">
                    <Flame className="h-3 w-3 text-museum-crimson" />
                    <span className="text-xs font-medium text-museum-brown-700">{item.heat}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="mb-1 truncate font-medium text-sm text-museum-brown-900 group-hover:text-museum-gold-700 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-museum-brown-500">{item.dynasty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-700 delay-500 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="museum-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-museum-brown-900">
              <Bell className="h-5 w-5 text-museum-gold-600" />
              博物馆公告
            </h3>
            <div className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-lg border border-museum-brown-100 p-4 hover:bg-museum-brown-50 transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-museum-gold-100">
                    <Bell className="h-5 w-5 text-museum-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="truncate font-medium text-museum-brown-900">{item.title}</h4>
                      <span className="flex-shrink-0 text-xs text-museum-brown-400">{item.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-museum-brown-500 line-clamp-1">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
