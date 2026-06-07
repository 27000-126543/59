import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Archive,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import { get } from '@/utils/request';
import type { MaintenancePlan } from '@/types';
import { cn } from '@/lib/utils';

interface MaintenanceTask {
  id: string;
  exhibitId: string;
  exhibitName: string;
  exhibitCategory: string;
  planType: 'cleaning' | 'restoration' | 'environmental' | 'structural';
  description: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
}

const categoryLabels: Record<string, string> = {
  bronze: '青铜器',
  painting: '书画',
  ceramic: '瓷器',
  jade: '玉器',
  other: '其他',
};

const planTypeLabels: Record<MaintenanceTask['planType'], string> = {
  cleaning: '清洁保养',
  restoration: '修复',
  environmental: '环境调控',
  structural: '结构加固',
};

function getPlanTypeLabel(type: string) {
  return planTypeLabels[type as MaintenanceTask['planType']] || type;
}

function getStatusConfig(status: MaintenanceTask['status']) {
  const map = {
    scheduled: { label: '待执行', variant: 'gold' as const, icon: <Clock className="h-3.5 w-3.5" /> },
    in_progress: { label: '进行中', variant: 'info' as const, icon: <Sparkles className="h-3.5 w-3.5" /> },
    completed: { label: '已完成', variant: 'success' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    overdue: { label: '已逾期', variant: 'danger' as const, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  };
  return map[status];
}

function getPriorityConfig(priority: MaintenanceTask['priority']) {
  const map = {
    low: { label: '低', variant: 'default' as const },
    medium: { label: '中', variant: 'warning' as const },
    high: { label: '高', variant: 'danger' as const },
    urgent: { label: '紧急', variant: 'danger' as const },
    critical: { label: '紧急', variant: 'danger' as const },
  };
  return map[priority];
}

export default function ConservatorMaintenance() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await get<MaintenancePlan[]>('/maintenance-plans').catch(() => null);

      if (data) {
        setTasks(
          (data as MaintenancePlan[]).map((plan) => ({
            id: plan.id,
            exhibitId: plan.exhibitId,
            exhibitName: plan.exhibitName || `展品 ${plan.exhibitId}`,
            exhibitCategory: 'other',
            planType: (plan.planType as MaintenanceTask['planType']) || 'cleaning',
            description: plan.description || '',
            lastMaintenanceDate: plan.lastMaintenanceDate,
            nextMaintenanceDate: plan.nextMaintenanceDate,
            status: (plan.status as MaintenanceTask['status']) || 'scheduled',
            priority: plan.priority || 'medium',
          }))
        );
      } else {
        setTasks([
          {
            id: 'mt1',
            exhibitId: 'e2',
            exhibitName: '清明上河图',
            exhibitCategory: 'painting',
            planType: 'environmental',
            description: '检查存放环境温湿度，调整展柜密封系统，检查纸张状态',
            lastMaintenanceDate: '2026-03-10',
            nextMaintenanceDate: '2026-06-10',
            status: 'scheduled',
            priority: 'high',
          },
          {
            id: 'mt2',
            exhibitId: 'e4',
            exhibitName: '翠玉白菜',
            exhibitCategory: 'jade',
            planType: 'cleaning',
            description: '玉器表面专业清洁，检查光泽度，涂抹保护剂',
            lastMaintenanceDate: '2026-03-15',
            nextMaintenanceDate: '2026-06-15',
            status: 'scheduled',
            priority: 'medium',
          },
          {
            id: 'mt3',
            exhibitId: 'e6',
            exhibitName: '富春山居图',
            exhibitCategory: 'painting',
            planType: 'environmental',
            description: '检查展柜微环境，调整光照强度，检查画心状态',
            lastMaintenanceDate: '2026-02-20',
            nextMaintenanceDate: '2026-06-20',
            status: 'scheduled',
            priority: 'high',
          },
          {
            id: 'mt4',
            exhibitId: 'e1',
            exhibitName: '司母戊鼎',
            exhibitCategory: 'bronze',
            planType: 'cleaning',
            description: '青铜表面除尘，检查氧化程度，必要时做缓蚀处理',
            lastMaintenanceDate: '2026-01-05',
            nextMaintenanceDate: '2026-06-05',
            status: 'completed',
            priority: 'high',
          },
          {
            id: 'mt5',
            exhibitId: 'e3',
            exhibitName: '汝窑天青釉洗',
            exhibitCategory: 'ceramic',
            planType: 'cleaning',
            description: '瓷器表面清洁，检查釉面状态，必要时补釉',
            lastMaintenanceDate: '2026-05-20',
            nextMaintenanceDate: '2026-06-20',
            status: 'scheduled',
            priority: 'medium',
          },
          {
            id: 'mt6',
            exhibitId: 'e5',
            exhibitName: '四羊方尊',
            exhibitCategory: 'bronze',
            planType: 'restoration',
            description: '检查裂缝修复状态，评估是否需要进一步修复',
            lastMaintenanceDate: '2026-04-10',
            nextMaintenanceDate: '2026-06-08',
            status: 'scheduled',
            priority: 'critical',
          },
          {
            id: 'mt7',
            exhibitId: 'e7',
            exhibitName: '青花瓷瓶',
            exhibitCategory: 'ceramic',
            planType: 'environmental',
            description: '检查展柜环境，调整温湿度，检查瓷器状态',
            lastMaintenanceDate: '2026-03-01',
            nextMaintenanceDate: '2026-06-25',
            status: 'scheduled',
            priority: 'low',
          },
          {
            id: 'mt8',
            exhibitId: 'e8',
            exhibitName: '玉璧',
            exhibitCategory: 'jade',
            planType: 'structural',
            description: '检查玉器结构完整性，评估展示支撑是否安全',
            lastMaintenanceDate: '2026-02-15',
            nextMaintenanceDate: '2026-06-18',
            status: 'in_progress',
            priority: 'medium',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date | null; dateStr: string; isToday: boolean; hasTask: boolean; taskCount: number }[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dateStr: '', isToday: false, hasTask: false, taskCount: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.nextMaintenanceDate === dateStr);
      days.push({
        date,
        dateStr,
        isToday: dateStr === todayStr,
        hasTask: dayTasks.length > 0,
        taskCount: dayTasks.length,
      });
    }

    return days;
  }, [currentYear, currentMonth, tasks, today]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.toISOString().split('T')[0]);
  }

  const selectedDateTasks = tasks.filter((t) => t.nextMaintenanceDate === selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">保养计划</h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            系统根据展品种类和保存时长自动生成保养计划
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-museum-brown-200 bg-white px-4 py-2 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
          >
            今天
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-white p-6 shadow-museum lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="rounded-lg p-1.5 text-museum-brown-500 transition-colors hover:bg-museum-brown-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
                {currentYear}年{currentMonth + 1}月
              </h2>
              <button
                onClick={nextMonth}
                className="rounded-lg p-1.5 text-museum-brown-500 transition-colors hover:bg-museum-brown-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-museum-brown-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-museum-gold-500" />
                有保养任务
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-museum-brown-200 ring-2 ring-museum-gold-400" />
                今天
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-museum-brown-500"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => (
              <div key={idx} className="aspect-square">
                {day.date ? (
                  <button
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={cn(
                      'relative flex h-full w-full flex-col items-center justify-center rounded-lg text-sm transition-all',
                      selectedDate === day.dateStr
                        ? 'bg-museum-gold-500 text-white font-semibold shadow-gold'
                        : day.isToday
                        ? 'bg-museum-gold-50 text-museum-brown-900 ring-2 ring-museum-gold-400'
                        : 'text-museum-brown-700 hover:bg-museum-brown-50'
                    )}
                  >
                    <span>{day.date.getDate()}</span>
                    {day.hasTask && (
                      <div className="absolute bottom-1.5 flex items-center gap-0.5">
                        {Array.from({ length: Math.min(day.taskCount, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              selectedDate === day.dateStr ? 'bg-white' : 'bg-museum-gold-500'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white p-5 shadow-museum">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-museum-gold-600" />
                <h3 className="font-semibold font-serif text-museum-brown-900">
                  {selectedDate} 保养任务
                </h3>
              </div>
              <Badge variant="gold">{selectedDateTasks.length} 项</Badge>
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center text-museum-brown-500">
                加载中...
              </div>
            ) : selectedDateTasks.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarClock className="mx-auto h-10 w-10 text-museum-brown-300" />
                <p className="mt-3 text-sm text-museum-brown-500">当天暂无保养任务</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {selectedDateTasks.map((task) => {
                  const statusConfig = getStatusConfig(task.status);
                  const priorityConfig = getPriorityConfig(task.priority);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'rounded-xl border p-4 transition-all',
                        task.status === 'overdue'
                          ? 'border-red-200 bg-red-50/50'
                          : task.status === 'in_progress'
                          ? 'border-blue-200 bg-blue-50/50'
                          : task.status === 'completed'
                          ? 'border-green-200 bg-green-50/50 opacity-75'
                          : 'border-museum-gold-200 bg-museum-gold-50/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-medium text-museum-brown-900">
                              {task.exhibitName}
                            </h4>
                            <Badge variant={priorityConfig.variant}>
                              {priorityConfig.label}
                            </Badge>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-museum-brown-500">
                            <span className="flex items-center gap-1">
                              <Archive className="h-3 w-3" />
                              {categoryLabels[task.exhibitCategory] || task.exhibitCategory}
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {getPlanTypeLabel(task.planType)}
                            </span>
                          </div>
                        </div>
                        <Badge variant={statusConfig.variant}>
                          <span className="flex items-center gap-1">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-museum-brown-600">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-museum-brown-400">上次保养：</span>
                          <span className="text-museum-brown-600">{task.lastMaintenanceDate}</span>
                        </div>
                        <div>
                          <span className="text-museum-brown-400">下次保养：</span>
                          <span className="font-medium text-museum-brown-700">
                            {task.nextMaintenanceDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-museum-gold-200 bg-museum-gold-50/60 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-museum-gold-600" />
            <div className="text-sm text-museum-brown-700">
              <p className="font-medium text-museum-gold-700">自动保养说明</p>
              <p className="mt-1 leading-relaxed">
                系统根据展品种类和保存时长自动生成保养计划：
                <br />· 书画类：每3个月环境检查
                <br />· 青铜器：每6个月清洁保养
                <br />· 瓷器：每4个月检查维护
                <br />· 玉器：每3个月清洁保养
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
