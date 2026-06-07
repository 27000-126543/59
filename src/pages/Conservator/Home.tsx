import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  FileText,
  CalendarClock,
  Archive,
  AlertTriangle,
  ChevronRight,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import DataCard from '@/components/Common/DataCard';
import Badge from '@/components/Common/Badge';
import { get } from '@/utils/request';
import type { Inspection, MaintenancePlan, WorkOrder } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardStats {
  todayInspections: number;
  completedInspections: number;
  pendingWorkOrders: number;
  upcomingMaintenance: number;
  totalExhibits: number;
}

interface TodoItem {
  id: string;
  type: 'inspection' | 'workorder' | 'maintenance';
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  time?: string;
}

export default function ConservatorHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayInspections: 0,
    completedInspections: 0,
    pendingWorkOrders: 0,
    upcomingMaintenance: 0,
    totalExhibits: 0,
  });
  const [todayInspections, setTodayInspections] = useState<Inspection[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, inspectionsData] = await Promise.all([
        get<DashboardStats>('/analytics/conservator/stats'),
        get<Inspection[]>('/inspections/today'),
      ]).catch(() => [null, null]);

      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
          todayInspections: 8,
          completedInspections: 5,
          pendingWorkOrders: 3,
          upcomingMaintenance: 2,
          totalExhibits: 156,
        });
      }

      if (inspectionsData) {
        setTodayInspections(inspectionsData as Inspection[]);
      }

      setTodos([
        {
          id: '1',
          type: 'inspection',
          title: '巡检任务待完成',
          description: '青铜展厅 3 件展品待巡检',
          priority: 'high',
          time: '今日 14:00',
        },
        {
          id: '2',
          type: 'workorder',
          title: '工单待提交',
          description: '玉器表面氧化处理申请未提交',
          priority: 'medium',
          time: '建议今日完成',
        },
        {
          id: '3',
          type: 'maintenance',
          title: '保养即将到期',
          description: '书画展厅「富春山居图」3天后需保养',
          priority: 'high',
          time: '2026-06-10',
        },
        {
          id: '4',
          type: 'inspection',
          title: '巡检异常处理',
          description: '瓷器展厅温度偏高，需持续观察',
          priority: 'critical',
          time: '紧急',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    {
      name: '已完成',
      value: stats.completedInspections,
      color: '#2E7D32',
    },
    {
      name: '待完成',
      value: Math.max(stats.todayInspections - stats.completedInspections, 0),
      color: '#DCB03C',
    },
  ];

  const completionRate =
    stats.todayInspections > 0
      ? Math.round((stats.completedInspections / stats.todayInspections) * 100)
      : 0;

  function getTodoPriorityConfig(priority?: TodoItem['priority']) {
    const map = {
      low: { label: '低', variant: 'default' as const },
      medium: { label: '中', variant: 'warning' as const },
      high: { label: '高', variant: 'danger' as const },
      critical: { label: '紧急', variant: 'danger' as const },
    };
    return map[priority || 'low'];
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-museum-brown-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
            文物保护员工作台
          </h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            欢迎回来，今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="今日巡检任务"
          value={`${stats.completedInspections}/${stats.todayInspections}`}
          subtitle={`完成率 ${completionRate}%`}
          icon={<ClipboardCheck className="h-6 w-6" />}
          color="gold"
          trend={completionRate >= 60 ? 10 : -5}
        />
        <DataCard
          title="待提交工单"
          value={stats.pendingWorkOrders}
          subtitle="需要您处理"
          icon={<FileText className="h-6 w-6" />}
          color="crimson"
          trend={-2}
        />
        <DataCard
          title="保养即将到期"
          value={stats.upcomingMaintenance}
          subtitle="7天内需处理"
          icon={<CalendarClock className="h-6 w-6" />}
          color="brown"
          trend={1}
        />
        <DataCard
          title="展品总数"
          value={stats.totalExhibits}
          subtitle="负责养护"
          icon={<Archive className="h-6 w-6" />}
          color="jade"
          trend={0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-museum">
          <h2 className="mb-4 text-lg font-semibold font-serif text-museum-brown-900">
            今日巡检进度
          </h2>
          <div className="relative flex items-center justify-center">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-museum-brown-900">
                {completionRate}%
              </span>
              <span className="text-sm text-museum-brown-500">完成率</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-museum-jade" />
              <span className="text-sm text-museum-brown-600">
                已完成 ({stats.completedInspections})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-museum-gold-500" />
              <span className="text-sm text-museum-brown-600">
                待完成 ({Math.max(stats.todayInspections - stats.completedInspections, 0)})
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/conservator/inspections')}
            className="mt-5 flex w-full items-center justify-center gap-1 rounded-lg border border-museum-gold-200 bg-museum-gold-50 py-2.5 text-sm font-medium text-museum-gold-700 transition-colors hover:bg-museum-gold-100"
          >
            查看巡检任务
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
              待办列表
            </h2>
            <Badge variant="danger">{todos.length} 项待处理</Badge>
          </div>
          <div className="space-y-3">
            {todos.map((todo) => {
              const priorityConfig = getTodoPriorityConfig(todo.priority);
              const isCritical = todo.priority === 'critical';
              return (
                <div
                  key={todo.id}
                  className={cn(
                    'rounded-xl border p-4 transition-all hover:shadow-md',
                    isCritical
                      ? 'border-red-200 bg-gradient-to-r from-red-50 to-white'
                      : todo.priority === 'high'
                      ? 'border-museum-gold-200 bg-gradient-to-r from-museum-gold-50/60 to-white'
                      : 'border-museum-brown-100 bg-white'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        isCritical
                          ? 'bg-red-100 text-museum-crimson'
                          : todo.type === 'inspection'
                          ? 'bg-museum-gold-100 text-museum-gold-600'
                          : todo.type === 'workorder'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-museum-jade'
                      )}
                    >
                      {todo.type === 'inspection' ? (
                        <ClipboardCheck className="h-5 w-5" />
                      ) : todo.type === 'workorder' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <CalendarClock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-museum-brown-900">{todo.title}</h3>
                        <Badge variant={priorityConfig.variant}>
                          {isCritical ? (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {priorityConfig.label}
                            </span>
                          ) : (
                            priorityConfig.label
                          )}
                        </Badge>
                        {todo.time && (
                          <span className="text-xs text-museum-brown-400">{todo.time}</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-museum-brown-500">{todo.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-museum-brown-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-museum">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
            最近通知
          </h2>
          <button className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700">
            全部标记已读
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {[
            {
              id: '1',
              title: '新工单审批通过',
              description: '您提交的「玉器表面清洁」工单已通过审批',
              time: '30分钟前',
              unread: true,
            },
            {
              id: '2',
              title: '保养计划提醒',
              description: '「翠玉白菜」将于 3 天后进行季度保养',
              time: '2小时前',
              unread: true,
            },
            {
              id: '3',
              title: '巡检任务更新',
              description: '今日新增瓷器展厅 2 件展品巡检任务',
              time: '昨天',
              unread: false,
            },
          ].map((notice) => (
            <div
              key={notice.id}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-museum-brown-50/50"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-museum-brown-100 text-museum-brown-500">
                <Bell className="h-4 w-4" />
                {notice.unread && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-museum-crimson ring-2 ring-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-museum-brown-900">{notice.title}</p>
                  {notice.unread && (
                    <span className="h-1.5 w-1.5 rounded-full bg-museum-crimson" />
                  )}
                </div>
                <p className="text-sm text-museum-brown-500">{notice.description}</p>
              </div>
              <span className="shrink-0 text-xs text-museum-brown-400">{notice.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
