import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Ticket,
  Sparkles,
  AlertCircle,
  TrendingDown,
  Heart,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { post } from '@/utils/request';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  remaining: number;
  capacity: number;
  heatLevel: 'low' | 'medium' | 'high' | 'full';
}

interface InterestTag {
  key: string;
  label: string;
}

const interestTags: InterestTag[] = [
  { key: 'bronze', label: '青铜器' },
  { key: 'calligraphy', label: '书画' },
  { key: 'ceramic', label: '陶瓷' },
  { key: 'jade', label: '玉器' },
];

const durations = [
  { key: '1h', label: '1小时' },
  { key: '2h', label: '2小时' },
  { key: '3h', label: '3小时' },
  { key: 'half', label: '半天' },
];

const timeSlots: TimeSlot[] = [
  { id: '1', start: '09:00', end: '10:30', remaining: 156, capacity: 200, heatLevel: 'low' },
  { id: '2', start: '10:30', end: '12:00', remaining: 89, capacity: 200, heatLevel: 'medium' },
  { id: '3', start: '12:00', end: '13:30', remaining: 178, capacity: 200, heatLevel: 'low' },
  { id: '4', start: '13:30', end: '15:00', remaining: 45, capacity: 200, heatLevel: 'high' },
  { id: '5', start: '15:00', end: '16:30', remaining: 12, capacity: 200, heatLevel: 'high' },
  { id: '6', start: '16:30', end: '18:00', remaining: 0, capacity: 200, heatLevel: 'full' },
];

const getHeatColor = (level: TimeSlot['heatLevel']) => {
  switch (level) {
    case 'low':
      return 'bg-emerald-500';
    case 'medium':
      return 'bg-amber-500';
    case 'high':
      return 'bg-orange-500';
    case 'full':
      return 'bg-red-500';
  }
};

const getHeatLabel = (level: TimeSlot['heatLevel']) => {
  switch (level) {
    case 'low':
      return '舒适';
    case 'medium':
      return '适中';
    case 'high':
      return '拥挤';
    case 'full':
      return '已满';
  }
};

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState('2h');
  const [avoidCrowd, setAvoidCrowd] = useState(true);
  const [visitorCount, setVisitorCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    setSelectedDate(today);
  }, []);

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const basePrice = 80;
  const discount = selectedTags.length > 0 ? 0.85 : selectedDate && selectedDate.getDay() === 0 ? 0.9 : 1;
  const dynamicPrice = Math.round(basePrice * discount);
  const totalPrice = dynamicPrice * visitorCount;

  const isDateSelectable = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate >= today;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const getRemainingSpots = (_day: number) => {
    return Math.floor(Math.random() * 300) + 50;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      const slot = timeSlots.find((s) => s.id === selectedSlot);
      const result = await post<{ ticketId: string }>('/tickets/book', {
        userId: user?.id,
        date: selectedDate.toISOString().split('T')[0],
        timeSlotId: selectedSlot,
        startTime: slot?.start,
        endTime: slot?.end,
        visitorCount,
        interests: selectedTags,
        duration: selectedDuration,
        avoidCrowd,
        totalPrice,
      });
      navigate(`/visitor/ticket/${result?.ticketId || 'demo-ticket-001'}`);
    } catch (err) {
      console.error(err);
      navigate('/visitor/ticket/demo-ticket-001');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-museum-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div
          className={`mb-6 transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="font-serif text-2xl font-bold text-museum-brown-900">门票预约</h1>
          <p className="mt-1 text-sm text-museum-brown-500">智能动态定价，为您提供最优参观体验</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-100 ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
          >
            <div className="museum-card p-5 sticky top-6">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                <Calendar className="h-5 w-5 text-museum-gold-600" />
                选择日期
              </h3>

              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-museum-brown-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-museum-brown-600" />
                </button>
                <span className="font-medium text-museum-brown-800">
                  {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-museum-brown-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-museum-brown-600" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1">
                {weekdays.map((w) => (
                  <div key={w} className="py-1 text-center text-xs text-museum-brown-500">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selectable = isDateSelectable(day);
                  const selected = isDateSelected(day);
                  const todays = isToday(day);
                  const remaining = getRemainingSpots(day);
                  const nearlyFull = remaining < 50;

                  return (
                    <button
                      key={day}
                      disabled={!selectable}
                      onClick={() =>
                        selectable &&
                        setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
                      }
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                        selected
                          ? 'bg-gradient-to-br from-museum-gold-400 to-museum-gold-600 text-museum-brown-900 font-bold shadow-gold'
                          : selectable
                          ? 'hover:bg-museum-brown-100 text-museum-brown-700'
                          : 'text-museum-brown-300 cursor-not-allowed'
                      }`}
                    >
                      <span>{day}</span>
                      {selectable && !selected && (
                        <span
                          className={`text-[10px] ${
                            nearlyFull ? 'text-museum-crimson' : 'text-museum-brown-400'
                          }`}
                        >
                          {nearlyFull ? '紧张' : '余票'}
                        </span>
                      )}
                      {todays && !selected && (
                        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-museum-gold-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-museum-brown-100">
                <p className="text-xs text-museum-brown-500">
                  {selectedDate
                    ? `已选择：${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`
                    : '请选择参观日期'}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`lg:col-span-5 transition-all duration-700 delay-200 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="museum-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-museum-brown-900">
                <Clock className="h-5 w-5 text-museum-gold-600" />
                选择时段
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  const isFull = slot.heatLevel === 'full';

                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => !isFull && setSelectedSlot(slot.id)}
                      className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-museum-gold-500 bg-gradient-to-br from-museum-gold-50 to-museum-gold-100 shadow-gold'
                          : isFull
                          ? 'border-museum-brown-200 bg-museum-brown-50 opacity-60 cursor-not-allowed'
                          : 'border-museum-brown-200 bg-white hover:border-museum-gold-400 hover:shadow-museum'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-museum-gold-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isSelected ? 'text-museum-brown-900' : 'text-museum-brown-800'
                          }`}
                        >
                          {slot.start} - {slot.end}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${getHeatColor(
                            slot.heatLevel
                          )}`}
                        >
                          {getHeatLabel(slot.heatLevel)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-museum-brown-500">
                          <Users className="h-4 w-4" />
                          <span>剩余 {slot.remaining} 名</span>
                        </div>
                        <div className="w-20 h-2 rounded-full bg-museum-brown-100 overflow-hidden">
                          <div
                            className={`h-full ${getHeatColor(slot.heatLevel)}`}
                            style={{ width: `${((slot.capacity - slot.remaining) / slot.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className={`lg:col-span-4 transition-all duration-700 delay-300 ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="museum-card p-5 sticky top-6">
              <div className="mb-5 rounded-xl bg-gradient-to-br from-museum-brown-50 to-museum-brown-100 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-museum-gold-600" />
                  <h3 className="font-serif text-lg font-semibold text-museum-brown-900">智能动态定价</h3>
                </div>

                <div className="mb-4 flex items-end gap-3">
                  {discount < 1 && (
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-museum-crimson px-2.5 py-1 text-xs font-medium text-white">
                      <TrendingDown className="h-3 w-3" />
                      {Math.round((1 - discount) * 100)}% OFF
                    </span>
                  )}
                  {discount < 1 && (
                    <span className="text-lg text-museum-brown-400 line-through">¥{basePrice}</span>
                  )}
                  <span className="text-4xl font-bold gold-text">¥{dynamicPrice}</span>
                  <span className="mb-1 text-sm text-museum-brown-500">/人</span>
                </div>

                <div className="space-y-2 rounded-lg bg-white/60 p-3">
                  <p className="flex items-start gap-2 text-xs text-museum-brown-600">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-museum-gold-600" />
                    <span>价格受历史客流、展品热度、特殊展览等因素动态调整</span>
                  </p>
                  {selectedTags.length > 0 && (
                    <p className="flex items-start gap-2 text-xs text-museum-jade">
                      <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>设置偏好标签享额外折扣</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-museum-brown-800">
                  <Heart className="h-4 w-4 text-museum-gold-600" />
                  兴趣偏好
                </h4>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.key);
                    return (
                      <button
                        key={tag.key}
                        onClick={() => toggleTag(tag.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-all ${
                          isSelected
                            ? 'bg-museum-gold-500 text-museum-brown-900 font-medium shadow-gold'
                            : 'bg-museum-brown-100 text-museum-brown-600 hover:bg-museum-brown-200'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-museum-brown-800">
                  <Clock className="h-4 w-4 text-museum-gold-600" />
                  参观时长
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((d) => {
                    const isSelected = selectedDuration === d.key;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setSelectedDuration(d.key)}
                        className={`rounded-lg py-2 text-sm transition-all ${
                          isSelected
                            ? 'bg-museum-gold-500 text-museum-brown-900 font-medium shadow-gold'
                            : 'bg-museum-brown-100 text-museum-brown-600 hover:bg-museum-brown-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-museum-brown-800">
                    <AlertCircle className="h-4 w-4 text-museum-gold-600" />
                    避开拥挤区域
                  </h4>
                  <button
                    onClick={() => setAvoidCrowd(!avoidCrowd)}
                    className="text-museum-gold-600 transition-colors"
                  >
                    {avoidCrowd ? (
                      <ToggleRight className="h-6 w-6 text-museum-gold-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-museum-brown-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-museum-brown-500">
                  开启后智能导览将优先推荐人流较少的展厅
                </p>
              </div>

              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-museum-brown-800">
                    <Users className="h-4 w-4 text-museum-gold-600" />
                    参观者数量
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setVisitorCount(Math.max(1, visitorCount - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-museum-brown-200 hover:bg-museum-brown-50 transition-colors"
                    >
                      <Minus className="h-4 w-4 text-museum-brown-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-museum-brown-900">
                      {visitorCount}
                    </span>
                    <button
                      onClick={() => setVisitorCount(Math.min(10, visitorCount + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-museum-brown-200 hover:bg-museum-brown-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-museum-brown-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-5 flex items-center justify-between border-t border-museum-brown-100 pt-5">
                <span className="text-museum-brown-600">应付总价</span>
                <span className="text-3xl font-bold gold-text">¥{totalPrice}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedSlot || loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="h-5 w-5" />
                    <span>{!selectedDate ? '请选择日期' : !selectedSlot ? '请选择时段' : '立即预约支付'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
