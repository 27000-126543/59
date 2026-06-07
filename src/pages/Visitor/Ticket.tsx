import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  ArrowRight,
  Download,
  Share2,
  Sparkles,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function VisitorTicket() {
  const navigate = useNavigate();
  const { ticketId = 'HX20240607001234' } = useParams();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ticketData = {
    ticketId,
    exhibition: '商周青铜器特展 + 唐宋书画珍品展',
    date: '2024年06月10日',
    weekday: '星期一',
    time: '13:30 - 15:00',
    visitors: 2,
    price: 136,
    location: '华夏博物馆第一、第二展厅',
    holder: user?.name || user?.realName || user?.username || '观众',
  };

  const notices = [
    '请在参观时段前15分钟到达博物馆入口，凭此电子票扫码入场',
    '参观时请保持安静，禁止触摸展品，遵守博物馆相关规定',
    '票券仅限本人使用，不可转让、退换，请妥善保管',
    '馆内禁止携带食品、饮料及易燃易爆物品',
    '如需导览服务，可扫描二维码或前往服务台咨询',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-museum-brown-900 via-museum-brown-800 to-museum-brown-950 py-10 px-4">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ticketPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="#B8860B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ticketPattern)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-xl">
        <div
          className={`mb-6 text-center transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <h1 className="font-serif text-3xl font-bold gold-text mb-2">华夏博物馆电子门票</h1>
          <p className="text-museum-brown-300 text-sm">HUAXIA MUSEUM E-TICKET</p>
        </div>

        <div
          className={`relative transition-all duration-700 delay-150 ${
            mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <div className="relative bg-[#FDF8F3] rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-museum-gold-400 via-museum-gold-500 to-museum-gold-400" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-museum-gold-400 via-museum-gold-500 to-museum-gold-400" />

            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-museum-brown-900 rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-museum-brown-900 rounded-l-full" />

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-museum-gold-400 to-museum-gold-600">
                    <Ticket className="h-5 w-5 text-museum-brown-900" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-museum-brown-900">
                      {ticketData.exhibition}
                    </h2>
                    <p className="text-xs text-museum-brown-500">持票人：{ticketData.holder}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">有效</span>
                </div>
              </div>

              <div className="mb-6 flex justify-center">
                <div className="relative p-4 bg-white rounded-2xl shadow-museum">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-museum-gold-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-museum-gold-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-museum-gold-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-museum-gold-500 rounded-br-lg" />
                  <QRCodeSVG
                    value={ticketId}
                    size={180}
                    level="H"
                    fgColor="#3E2723"
                    bgColor="#FFFFFF"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="mb-6 text-center">
                <p className="text-xs text-museum-brown-500 mb-1">票号</p>
                <p className="font-mono text-xl font-bold tracking-wider text-museum-brown-900">
                  {ticketId.toUpperCase()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-museum-brown-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-museum-gold-600" />
                    <span className="text-xs text-museum-brown-500">参观日期</span>
                  </div>
                  <p className="font-medium text-museum-brown-900">
                    {ticketData.date} <span className="text-museum-brown-500 text-sm">({ticketData.weekday})</span>
                  </p>
                </div>
                <div className="rounded-xl bg-museum-brown-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-museum-gold-600" />
                    <span className="text-xs text-museum-brown-500">参观时段</span>
                  </div>
                  <p className="font-medium text-museum-brown-900">{ticketData.time}</p>
                </div>
                <div className="rounded-xl bg-museum-brown-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-museum-gold-600" />
                    <span className="text-xs text-museum-brown-500">参观人数</span>
                  </div>
                  <p className="font-medium text-museum-brown-900">{ticketData.visitors} 人</p>
                </div>
                <div className="rounded-xl bg-museum-brown-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className="h-4 w-4 text-museum-gold-600" />
                    <span className="text-xs text-museum-brown-500">票价</span>
                  </div>
                  <p className="font-bold gold-text text-lg">¥{ticketData.price}</p>
                </div>
              </div>

              <div className="rounded-xl border border-museum-gold-300 bg-museum-gold-50/50 p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-museum-gold-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-museum-brown-500">参观地点</span>
                    <p className="font-medium text-museum-brown-900">{ticketData.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-dashed border-t border-dashed border-museum-brown-300 mx-4" />

            <div className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-medium text-museum-brown-900">
                <AlertCircle className="h-4 w-4 text-museum-gold-600" />
                入场须知
              </h3>
              <ul className="space-y-2">
                {notices.map((notice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-museum-brown-600">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-museum-gold-100 text-xs font-medium text-museum-gold-700">
                      {idx + 1}
                    </span>
                    <span>{notice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className={`mt-6 flex gap-3 transition-all duration-700 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <button className="flex-1 museum-card flex items-center justify-center gap-2 py-3 text-museum-brown-700 font-medium">
            <Download className="h-4 w-4" />
            <span>保存门票</span>
          </button>
          <button className="flex-1 museum-card flex items-center justify-center gap-2 py-3 text-museum-brown-700 font-medium">
            <Share2 className="h-4 w-4" />
            <span>分享</span>
          </button>
        </div>

        <div
          className={`mt-4 transition-all duration-700 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <button
            onClick={() => navigate('/visitor/guide')}
            className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            <Navigation className="h-5 w-5" />
            <span>查看智能导览</span>
            <ChevronRight className="h-5 w-5" />
            <ArrowRight className="h-5 w-5 hidden" />
          </button>
        </div>

        <div
          className={`mt-8 text-center text-museum-brown-500 text-xs transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          © 2024 华夏博物馆 · 智慧管理平台
        </div>
      </div>
    </div>
  );
}
