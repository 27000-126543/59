import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Navigation,
  ChevronRight,
  Star,
  Heart,
  ToggleLeft,
  ToggleRight,
  Clock,
  Info,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Hall {
  id: string;
  name: string;
  position: { x: number; y: number; w: number; h: number };
  density: number;
  color: string;
  exhibits: { id: string; name: string }[];
}

interface ExhibitDetail {
  id: string;
  name: string;
  dynasty: string;
  description: string;
  related: { id: string; name: string }[];
}

const halls: Hall[] = [
  {
    id: '1',
    name: '第一展厅 · 青铜器',
    position: { x: 20, y: 30, w: 160, h: 100 },
    density: 35,
    color: '#8B6341',
    exhibits: [
      { id: 'e1', name: '后母戊鼎' },
      { id: 'e2', name: '四羊方尊' },
      { id: 'e3', name: '大盂鼎' },
    ],
  },
  {
    id: '2',
    name: '第二展厅 · 书画',
    position: { x: 200, y: 30, w: 160, h: 100 },
    density: 78,
    color: '#6B4A31',
    exhibits: [
      { id: 'e4', name: '清明上河图' },
      { id: 'e5', name: '兰亭集序' },
    ],
  },
  {
    id: '3',
    name: '第三展厅 · 玉器',
    position: { x: 380, y: 30, w: 160, h: 100 },
    density: 52,
    color: '#543A27',
    exhibits: [
      { id: 'e6', name: '翠玉白菜' },
      { id: 'e7', name: '玉琮王' },
    ],
  },
  {
    id: '4',
    name: '第四展厅 · 陶瓷',
    position: { x: 20, y: 160, w: 160, h: 100 },
    density: 42,
    color: '#A68154',
    exhibits: [
      { id: 'e8', name: '汝窑天青釉洗' },
      { id: 'e9', name: '青花瓷瓶' },
    ],
  },
  {
    id: '5',
    name: '第五展厅 · 丝绸之路',
    position: { x: 200, y: 160, w: 160, h: 100 },
    density: 92,
    color: '#3E2723',
    exhibits: [
      { id: 'e10', name: '鎏金银壶' },
      { id: 'e11', name: '玻璃碗' },
    ],
  },
  {
    id: '6',
    name: '第六展厅 · 明清珍宝',
    position: { x: 380, y: 160, w: 160, h: 100 },
    density: 28,
    color: '#8B6341',
    exhibits: [
      { id: 'e12', name: '金冠' },
      { id: 'e13', name: '龙袍' },
    ],
  },
];

const recommendedRoute = [
  { hallId: '6', name: '第六展厅 · 明清珍宝', exhibits: ['金冠'] },
  { hallId: '1', name: '第一展厅 · 青铜器', exhibits: ['后母戊鼎', '四羊方尊'] },
  { hallId: '4', name: '第四展厅 · 陶瓷', exhibits: ['汝窑天青釉洗'] },
  { hallId: '3', name: '第三展厅 · 玉器', exhibits: ['翠玉白菜'] },
  { hallId: '2', name: '第二展厅 · 书画', exhibits: ['清明上河图'] },
];

const currentExhibit: ExhibitDetail = {
  id: 'e1',
  name: '后母戊鼎',
  dynasty: '商代晚期',
  description:
    '后母戊鼎，又称司母戊鼎、司母戊大方鼎，是中国商代晚期王室用于祭祀的青铜方鼎，是中国国家一级文物。1939年出土于河南省安阳市武官村，现藏于中国国家博物馆。后母戊鼎是迄今世界上出土最大、最重的青铜礼器，享有"镇国之宝"的美誉。',
  related: [
    { id: 'e2', name: '四羊方尊' },
    { id: 'e3', name: '大盂鼎' },
    { id: 'e9', name: '青花瓷瓶' },
  ],
};

const getDensityColor = (density: number) => {
  if (density < 40) return 'from-emerald-400 to-emerald-500';
  if (density < 70) return 'from-amber-400 to-amber-500';
  return 'from-red-400 to-red-500';
};

const getDensityBg = (density: number) => {
  if (density < 40) return 'bg-emerald-500';
  if (density < 70) return 'bg-amber-500';
  return 'bg-red-500';
};

const getDensityLabel = (density: number) => {
  if (density < 40) return '舒适';
  if (density < 70) return '适中';
  return '拥挤';
};

export default function VisitorGuide() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedHall, setSelectedHall] = useState<string | null>('1');
  const [avoidCrowd, setAvoidCrowd] = useState(true);
  const [densities, setDensities] = useState(halls.map((h) => h.density));

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDensities((prev) =>
        prev.map((d) => Math.max(5, Math.min(98, d + Math.floor(Math.random() * 11) - 5)))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedHallData = halls.find((h) => h.id === selectedHall);
  const crowdedHalls = halls.filter((h, idx) => densities[idx] >= 80);

  return (
    <div className="min-h-screen bg-museum-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div
          className={`mb-6 transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-museum-brown-900">
                欢迎，{user?.name || user?.realName || user?.username || '尊敬的观众'}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-museum-brown-500">
                <MapPin className="h-4 w-4 text-museum-gold-600" />
                当前位置：博物馆大厅入口
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-museum">
                <Clock className="h-4 w-4 text-museum-gold-600" />
                <span className="text-sm text-museum-brown-700">预计参观：2.5小时</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div
            className={`lg:col-span-5 transition-all duration-700 delay-100 ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
          >
            <div className="museum-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                  <Navigation className="h-5 w-5 text-museum-gold-600" />
                  博物馆平面图
                </h3>
                {crowdedHalls.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 animate-pulse-red">
                    <Users className="h-3 w-3" />
                    {crowdedHalls.length}处拥挤
                  </span>
                )}
              </div>

              <div className="relative rounded-xl bg-museum-brown-50 p-4">
                <svg viewBox="0 0 560 290" className="w-full h-auto">
                  <defs>
                    <pattern id="floorPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill="#FDF8F3" />
                      <path d="M0 20 L20 0" stroke="#E8DCC8" strokeWidth="0.5" />
                    </pattern>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect x="10" y="15" width="540" height="260" fill="url(#floorPattern)" rx="8" stroke="#D4BF9E" strokeWidth="1.5" />

                  <line x1="280" y1="20" x2="280" y2="270" stroke="#D4BF9E" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="10" y1="145" x2="550" y2="145" stroke="#D4BF9E" strokeWidth="1" strokeDasharray="4 4" />

                  {halls.map((hall, idx) => {
                    const density = densities[idx];
                    const isCrowded = density >= 80;
                    const isSelected = selectedHall === hall.id;
                    const inRoute = recommendedRoute.some((r) => r.hallId === hall.id);

                    return (
                      <g
                        key={hall.id}
                        onClick={() => setSelectedHall(hall.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <rect
                          x={hall.position.x}
                          y={hall.position.y}
                          width={hall.position.w}
                          height={hall.position.h}
                          rx="8"
                          fill={hall.color}
                          opacity={isSelected ? 0.9 : 0.7}
                          stroke={isSelected ? '#B8860B' : inRoute ? '#B8860B' : 'transparent'}
                          strokeWidth={isSelected ? 3 : inRoute ? 2 : 1.5}
                          filter={isSelected ? 'url(#glow)' : undefined}
                          className="transition-all duration-300"
                        />
                        <text
                          x={hall.position.x + hall.position.w / 2}
                          y={hall.position.y + hall.position.h / 2 - 8}
                          textAnchor="middle"
                          fill="#FBF3D9"
                          fontSize="12"
                          fontWeight="600"
                        >
                          {hall.name}
                        </text>
                        <rect
                          x={hall.position.x + 15}
                          y={hall.position.y + hall.position.h - 25}
                          width={hall.position.w - 30}
                          height="10"
                          rx="5"
                          fill="rgba(0,0,0,0.2)"
                        />
                        <rect
                          x={hall.position.x + 15}
                          y={hall.position.y + hall.position.h - 25}
                          width={((hall.position.w - 30) * density) / 100}
                          height="10"
                          rx="5"
                          fill={
                            density < 40 ? '#22c55e' : density < 70 ? '#f59e0b' : '#ef4444'
                          }
                        />
                        <text
                          x={hall.position.x + hall.position.w / 2}
                          y={hall.position.y + hall.position.h - 17}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {density}%
                        </text>

                        {isCrowded && (
                          <g className="animate-pulse">
                            <circle
                              cx={hall.position.x + hall.position.w - 15}
                              cy={hall.position.y + 18}
                              r="10"
                              fill="#ef4444"
                            />
                            <circle
                              cx={hall.position.x + hall.position.w - 15}
                              cy={hall.position.y + 18}
                              r="10"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2"
                              opacity="0.5"
                            >
                              <animate attributeName="r" from="10" to="18" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <text
                              x={hall.position.x + hall.position.w - 15}
                              y={hall.position.y + 21}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              !
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  <g>
                    {recommendedRoute.slice(0, -1).map((_, idx) => {
                      const current = recommendedRoute[idx];
                      const next = recommendedRoute[idx + 1];
                      const currentHall = halls.find((h) => h.id === current.hallId)!;
                      const nextHall = halls.find((h) => h.id === next.hallId)!;
                      const x1 = currentHall.position.x + currentHall.position.w / 2;
                      const y1 = currentHall.position.y + currentHall.position.h / 2;
                      const x2 = nextHall.position.x + nextHall.position.w / 2;
                      const y2 = nextHall.position.y + nextHall.position.h / 2;

                      return (
                        <g key={`route-${idx}`}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#B8860B"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="8 4"
                            opacity="0.8"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              from="24"
                              to="0"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </line>
                        </g>
                      );
                    })}
                  </g>

                  <g>
                    <circle cx="280" cy="275" r="12" fill="#B8860B" />
                    <text x="280" y="279" textAnchor="middle" fill="#3E2723" fontSize="12" fontWeight="bold">
                      ●
                    </text>
                    <text x="280" y="295" textAnchor="middle" fill="#543A27" fontSize="10">
                      您的位置
                    </text>
                  </g>
                </svg>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-museum-brown-600">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-emerald-500" />
                    <span>舒适</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-amber-500" />
                    <span>适中</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-red-500" />
                    <span>拥挤</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-0.5 bg-museum-gold-500" style={{ borderStyle: 'dashed', borderWidth: '0 0 0 3px' }} />
                    <span>推荐路线</span>
                  </div>
                </div>
              </div>

              {selectedHallData && (
                <div className="mt-4 rounded-xl border border-museum-gold-300 bg-museum-gold-50/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-museum-brown-900">{selectedHallData.name}</h4>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${getDensityBg(
                        densities[halls.indexOf(selectedHallData)]
                      )}`}
                    >
                      {getDensityLabel(densities[halls.indexOf(selectedHallData)])}
                    </span>
                  </div>
                  <p className="text-sm text-museum-brown-600">
                    主要展品：{selectedHallData.exhibits.map((e) => e.name).join('、')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div
              className={`transition-all duration-700 delay-200 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="museum-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                    <Users className="h-5 w-5 text-museum-gold-600" />
                    实时拥挤度
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-museum-brown-500">避开拥挤区域</span>
                    <button onClick={() => setAvoidCrowd(!avoidCrowd)}>
                      {avoidCrowd ? (
                        <ToggleRight className="h-6 w-6 text-museum-gold-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-museum-brown-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {halls.map((hall, idx) => (
                    <div key={hall.id} className="flex items-center gap-3">
                      <span className="w-32 flex-shrink-0 text-sm text-museum-brown-700 truncate">
                        {hall.name}
                      </span>
                      <div className="flex-1 h-6 rounded-full bg-museum-brown-100 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getDensityColor(densities[idx])} rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                          style={{ width: `${densities[idx]}%` }}
                        >
                          {densities[idx] > 20 && (
                            <span className="text-xs font-medium text-white">{densities[idx]}%</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`w-14 text-right text-xs font-medium ${
                          densities[idx] < 40
                            ? 'text-emerald-600'
                            : densities[idx] < 70
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {getDensityLabel(densities[idx])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-700 delay-300 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="museum-card p-5">
                <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                  <Sparkles className="h-5 w-5 text-museum-gold-600" />
                  推荐参观路线
                  {avoidCrowd && (
                    <span className="ml-2 text-xs font-normal text-emerald-600">（已避开拥挤区域）</span>
                  )}
                </h3>

                <div className="space-y-3">
                  {recommendedRoute.map((item, idx) => (
                    <div key={item.hallId} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-museum-gold-400 to-museum-gold-600 text-sm font-bold text-museum-brown-900 shadow-gold">
                          {idx + 1}
                        </div>
                        {idx < recommendedRoute.length - 1 && (
                          <div className="mt-1 w-0.5 flex-1 bg-museum-gold-300" style={{ height: '40px' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-museum-brown-900">{item.name}</h4>
                          <ChevronRight className="h-4 w-4 text-museum-brown-400" />
                        </div>
                        <p className="mt-1 text-sm text-museum-brown-500">
                          重点展品：{item.exhibits.join('、')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-700 delay-400 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="museum-card p-5">
                <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                  <Star className="h-5 w-5 text-museum-gold-600" />
                  当前展品详情
                </h3>

                <div className="flex flex-col md:flex-row gap-5">
                  <div className="relative flex-shrink-0 h-40 w-full md:w-48 rounded-xl bg-gradient-to-br from-museum-brown-200 to-museum-brown-400 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-16 w-16 text-museum-gold-400/50" />
                    </div>
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1">
                      <Heart className="h-3 w-3 text-museum-crimson" />
                      <span className="text-xs font-medium text-museum-brown-700">99k+</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-serif text-xl font-bold text-museum-brown-900">
                        {currentExhibit.name}
                      </h4>
                      <span className="rounded-full bg-museum-gold-100 px-2.5 py-0.5 text-xs text-museum-gold-700">
                        {currentExhibit.dynasty}
                      </span>
                    </div>
                    <p className="text-sm text-museum-brown-600 leading-relaxed">
                      {currentExhibit.description}
                    </p>

                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-1 text-xs text-museum-brown-500">
                        <Info className="h-3.5 w-3.5" />
                        相关推荐
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentExhibit.related.map((rel) => (
                          <button
                            key={rel.id}
                            className="rounded-lg border border-museum-brown-200 bg-museum-brown-50 px-3 py-1.5 text-sm text-museum-brown-700 hover:border-museum-gold-400 hover:bg-museum-gold-50 transition-all"
                          >
                            {rel.name}
                            <ArrowRight className="ml-1 inline h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-6 transition-all duration-700 delay-500 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <button
            onClick={() => navigate('/visitor/feedback')}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3"
          >
            <Star className="h-5 w-5" />
            <span>参观结束，提交评价反馈</span>
          </button>
        </div>
      </div>
    </div>
  );
}
