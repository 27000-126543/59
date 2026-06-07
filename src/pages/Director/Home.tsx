import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  GalleryHorizontalEnd,
  Star,
  Calendar,
  ChevronRight,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as ReBarChart,
} from 'recharts';
import DataCard from '@/components/Common/DataCard';
import Badge from '@/components/Common/Badge';
import { get } from '@/utils/request';
import { cn } from '@/lib/utils';

type DateRange = 'today' | 'week' | 'month' | 'year';

interface RevenueData {
  today: { revenue: number; ticketCount: number };
  week: { revenue: number; ticketCount: number; changePercent: number };
  month: { revenue: number; ticketCount: number; changePercent: number };
  dailyTrend: Array<{ date: string; revenue: number; ticketCount: number }>;
}

interface VisitorsData {
  today: { total: number; current: number; changePercent: number; hourly: Array<{ hour: string; count: number }> };
  yesterday: { total: number; hourly: Array<{ hour: string; count: number }> };
  week: { thisWeekTotal: number; lastWeekTotal: number; changePercent: number; trend: Array<{ date: string; count: number; week: string }> };
}

interface ConversionData {
  overall: Array<{ stage: string; value: number; rate: number }>;
}

interface SatisfactionData {
  overallScore: number;
  totalRatings: number;
  hallRanking: Array<{ hallId: string; hallName: string; score: number; ratingCount: number }>;
}

const dateRangeOptions: { key: DateRange; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
];

function formatCurrency(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

function generateVisitorCompareData() {
  const data = [];
  for (let h = 9; h <= 20; h++) {
    const hour = `${h.toString().padStart(2, '0')}:00`;
    data.push({
      time: hour,
      今日: Math.round(25 + 40 * Math.sin((h - 9) / 4) + Math.random() * 15),
      昨日: Math.round(22 + 35 * Math.sin((h - 9) / 4) + Math.random() * 12),
    });
  }
  return data;
}

function generateRevenueBarData() {
  const data = [];
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  days.forEach((day, i) => {
    data.push({
      day,
      收入: 3000 + Math.round(Math.sin(i) * 1000) + Math.floor(Math.random() * 800),
    });
  });
  return data;
}

function generateFunnelData() {
  return [
    { name: '预约', value: 2680, rate: 100 },
    { name: '到馆', value: 2350, rate: 87.7 },
    { name: '参观', value: 2180, rate: 81.3 },
    { name: '评分', value: 1420, rate: 52.9 },
  ];
}

export default function DirectorHome() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [visitorsData, setVisitorsData] = useState<VisitorsData | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionData | null>(null);
  const [loading, setLoading] = useState(true);

  const visitorCompareData = generateVisitorCompareData();
  const revenueBarData = generateRevenueBarData();
  const funnelData = generateFunnelData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, visitors, conversion, satisfaction] = await Promise.all([
          get<RevenueData>('/analytics/revenue'),
          get<VisitorsData>('/analytics/visitors'),
          get<ConversionData>('/analytics/exhibition-conversion'),
          get<SatisfactionData>('/analytics/satisfaction'),
        ]);
        setRevenueData(revenue);
        setVisitorsData(visitors);
        setConversionData(conversion);
        setSatisfactionData(satisfaction);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalf = score % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < fullStars
                ? 'fill-museum-gold-500 text-museum-gold-500'
                : i === fullStars && hasHalf
                ? 'fill-museum-gold-300 text-museum-gold-300'
                : 'text-museum-brown-200'
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-museum-brown-500">加载中...</div>
      </div>
    );
  }

  const ongoingExhibitions = 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
            馆长数据看板
          </h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            全馆运营数据总览，实时掌握博物馆运行状态
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-museum-brown-200 bg-white p-1 shadow-museum">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateRange(opt.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition-all',
                dateRange === opt.key
                  ? 'bg-museum-gold-500 text-white shadow-gold'
                  : 'text-museum-brown-600 hover:bg-museum-cream'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="今日票务收入"
          value={formatCurrency(revenueData?.today.revenue ?? 0)}
          trend={revenueData?.week.changePercent ?? 0}
          subtitle="较上周同期"
          icon={<DollarSign className="h-6 w-6" />}
          color="gold"
        />
        <DataCard
          title="今日客流"
          value={visitorsData?.today.total ?? 0}
          trend={visitorsData?.today.changePercent ?? 0}
          subtitle={`当前在馆 ${visitorsData?.today.current ?? 0} 人`}
          icon={<Users className="h-6 w-6" />}
          color="brown"
        />
        <DataCard
          title="当前开放展览"
          value={ongoingExhibitions}
          subtitle="个展览进行中"
          icon={<GalleryHorizontalEnd className="h-6 w-6" />}
          color="jade"
        />
        <div className="rounded-xl border border-museum-brown-100 bg-white p-6 shadow-museum transition-all hover:shadow-museum-hover">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-museum-brown-500">平均满意度</p>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-3xl font-bold font-serif text-museum-brown-900">
                  {satisfactionData?.overallScore ?? 0}
                </p>
                <span className="text-sm text-museum-brown-400">/ 5.0</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderStars(satisfactionData?.overallScore ?? 0)}
                <span className="text-xs text-museum-brown-400">
                  共 {satisfactionData?.totalRatings ?? 0} 条评价
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-museum-gold-100 text-museum-gold-600">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 rounded-full bg-museum-gold-50 text-museum-gold-700 border-museum-gold-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-museum-brown-800">客流对比趋势</h2>
            <Badge variant="gold">今日 vs 昨日</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorCompareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FDF8F3',
                    border: '1px solid #E8DCC8',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="今日" stroke="#B8860B" strokeWidth={2.5} dot={{ fill: '#B8860B' }} />
                <Line type="monotone" dataKey="昨日" stroke="#A68154" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#A68154' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-museum-brown-800">票务收入趋势</h2>
            <Badge variant="brown">本周数据</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={revenueBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FDF8F3',
                    border: '1px solid #E8DCC8',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), '收入']}
                />
                <Bar dataKey="收入" fill="#B8860B" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-museum-brown-800">展览转化率漏斗</h2>
            <Badge variant="info">预约→评分</Badge>
          </div>
          <div className="space-y-3">
            {funnelData.map((item, index) => {
              const maxWidth = 100;
              const width = (item.value / funnelData[0].value) * 100;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-museum-brown-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-museum-brown-900">
                        {item.value.toLocaleString()}
                      </span>
                      {index > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-museum-jade">
                          <ArrowUpRight className="h-3 w-3" />
                          {item.rate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-lg bg-museum-cream">
                    <div
                      className="flex h-full items-center justify-end pr-3 text-xs font-medium text-white transition-all"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, #B8860B ${100 - index * 15}%, #DCB03C 100%)`,
                      }}
                    >
                      {index > 0 && `${item.rate}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-museum-brown-800">各展区满意度排名</h2>
            <Badge variant="success">按评分排序</Badge>
          </div>
          <div className="space-y-3">
            {(satisfactionData?.hallRanking ?? []).map((hall, index) => (
              <div key={hall.hallId} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    index === 0
                      ? 'bg-museum-gold-500 text-white'
                      : index === 1
                      ? 'bg-museum-brown-400 text-white'
                      : index === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-museum-brown-100 text-museum-brown-600'
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-museum-brown-800">
                      {hall.hallName}
                    </p>
                    <div className="flex items-center gap-2">
                      {renderStars(hall.score)}
                      <span className="text-sm font-bold text-museum-brown-900">{hall.score}</span>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-museum-brown-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-museum-gold-400 to-museum-gold-600"
                      style={{ width: `${(hall.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        onClick={() => navigate('/director/reports')}
        className="cursor-pointer rounded-xl border-2 border-dashed border-museum-gold-300 bg-gradient-to-r from-museum-gold-50 to-museum-cream p-6 transition-all hover:border-museum-gold-500 hover:shadow-museum-hover"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-museum-gold-100 text-museum-gold-600">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-museum-brown-900">月度运营报告</h3>
              <p className="mt-1 text-sm text-museum-brown-500">
                每月1号自动生成，包含收入、客流、满意度等全维度运营数据分析
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="gold">2026年5月报告</Badge>
                <span className="text-xs text-museum-brown-400">已生成 · 6月1日 09:00</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-museum-gold-600">
            <span className="text-sm font-medium">查看报告</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
