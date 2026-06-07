import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Archive,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import DataCard from '@/components/Common/DataCard';
import Badge from '@/components/Common/Badge';
import { get } from '@/utils/request';
import type { Exhibition, WorkOrder } from '@/types';

interface DashboardStats {
  currentExhibitions: number;
  pendingWorkOrders: number;
  totalExhibits: number;
  newExhibitionsThisMonth: number;
}

interface ActivityRecord {
  id: string;
  type: 'exhibition' | 'workorder' | 'exhibit';
  title: string;
  description: string;
  time: string;
}

export default function CuratorHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    currentExhibitions: 0,
    pendingWorkOrders: 0,
    totalExhibits: 0,
    newExhibitionsThisMonth: 0,
  });
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [pendingWorkOrders, setPendingWorkOrders] = useState<WorkOrder[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, exhibitionsData, workOrdersData] = await Promise.all([
        get<DashboardStats>('/analytics/curator/stats'),
        get<Exhibition[]>('/exhibitions?limit=10'),
        get<WorkOrder[]>('/workorders?status=pending_approval&limit=5'),
      ]).catch(() => [null, null, null]);

      if (statsData) setStats(statsData);
      if (exhibitionsData) setExhibitions(exhibitionsData as Exhibition[]);
      if (workOrdersData) setPendingWorkOrders(workOrdersData as WorkOrder[]);

      setActivities([
        {
          id: '1',
          type: 'workorder',
          title: '新工单待审批',
          description: '青铜鼎修复申请 - 紧急程度：高',
          time: '10分钟前',
        },
        {
          id: '2',
          type: 'exhibition',
          title: '展览已上线',
          description: '"唐宋书画精品展" 已开始对公众开放',
          time: '2小时前',
        },
        {
          id: '3',
          type: 'exhibit',
          title: '展品入库',
          description: '新增 5 件明代瓷器展品',
          time: '昨天',
        },
        {
          id: '4',
          type: 'exhibition',
          title: '展览审批通过',
          description: '"丝路文明特展" 已通过审批',
          time: '2天前',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const getExhibitionStatusConfig = (status: Exhibition['status']) => {
    const map = {
      ongoing: { label: '进行中', variant: 'success' as const, icon: <CheckCircle2 className="h-4 w-4" /> },
      upcoming: { label: '即将开始', variant: 'info' as const, icon: <Clock className="h-4 w-4" /> },
      ended: { label: '已结束', variant: 'default' as const, icon: <XCircle className="h-4 w-4" /> },
      draft: { label: '草稿', variant: 'warning' as const, icon: <AlertCircle className="h-4 w-4" /> },
    };
    return map[status];
  };

  const getPriorityConfig = (priority: WorkOrder['priority']) => {
    const map = {
      low: { label: '低', variant: 'default' as const },
      medium: { label: '中', variant: 'warning' as const },
      high: { label: '高', variant: 'danger' as const },
      critical: { label: '紧急', variant: 'danger' as const },
    };
    return map[priority];
  };

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
            策展人工作台
          </h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            欢迎回来，今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="当前展览数"
          value={stats.currentExhibitions}
          subtitle="正在进行中"
          icon={<LayoutDashboard className="h-6 w-6" />}
          color="gold"
          trend={12}
        />
        <DataCard
          title="待审批工单"
          value={stats.pendingWorkOrders}
          subtitle="需要您处理"
          icon={<ClipboardCheck className="h-6 w-6" />}
          color="crimson"
          trend={-5}
        />
        <DataCard
          title="展品总数"
          value={stats.totalExhibits}
          subtitle="馆藏总量"
          icon={<Archive className="h-6 w-6" />}
          color="brown"
          trend={3}
        />
        <DataCard
          title="本月新增展览"
          value={stats.newExhibitionsThisMonth}
          subtitle="6月统计"
          icon={<TrendingUp className="h-6 w-6" />}
          color="jade"
          trend={25}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
              展览状态时间线
            </h2>
            <button
              onClick={() => navigate('/curator/exhibitions')}
              className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700"
            >
              查看全部 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {exhibitions.length > 0 ? (
              exhibitions.slice(0, 5).map((exhibition, index) => {
                const statusConfig = getExhibitionStatusConfig(exhibition.status);
                return (
                  <div key={exhibition.id} className="relative pl-8">
                    {index < Math.min(exhibitions.length, 5) - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-museum-brown-200" />
                    )}
                    <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-museum-gold-400 bg-white">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          exhibition.status === 'ongoing'
                            ? 'bg-museum-jade'
                            : exhibition.status === 'upcoming'
                            ? 'bg-blue-500'
                            : 'bg-museum-brown-400'
                        }`}
                      />
                    </div>
                    <div className="rounded-lg border border-museum-brown-100 bg-museum-brown-50/50 p-4 transition-all hover:bg-museum-gold-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-museum-brown-900">
                            {exhibition.title}
                          </h3>
                          <p className="mt-1 text-sm text-museum-brown-500">
                            <Calendar className="mr-1 inline h-3.5 w-3.5" />
                            {exhibition.startDate} ~ {exhibition.endDate}
                          </p>
                          <p className="mt-1 text-sm text-museum-brown-500">
                            {exhibition.location}
                          </p>
                        </div>
                        <Badge variant={statusConfig.variant}>
                          <span className="flex items-center gap-1">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-museum-brown-400">
                暂无展览数据
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-museum">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
              待办事项
            </h2>
            <Badge variant="danger">{stats.pendingWorkOrders} 项待处理</Badge>
          </div>
          <div className="space-y-3">
            {pendingWorkOrders.length > 0 ? (
              pendingWorkOrders.map((wo) => {
                const priorityConfig = getPriorityConfig(wo.priority);
                return (
                  <button
                    key={wo.id}
                    onClick={() => navigate('/curator/workorders')}
                    className="w-full rounded-lg border border-museum-gold-200 bg-museum-gold-50/60 p-3 text-left transition-all hover:bg-museum-gold-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-museum-brown-900">
                          {wo.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-museum-brown-500">
                          {wo.exhibitName || '未指定展品'}
                        </p>
                      </div>
                      <Badge variant={priorityConfig.variant}>
                        {priorityConfig.label}
                      </Badge>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-museum-brown-400">
                暂无待办事项
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-museum">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold font-serif text-museum-brown-900">
            最近活动记录
          </h2>
        </div>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-museum-brown-50/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-museum-gold-100 text-museum-gold-600">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-museum-brown-900">{activity.title}</p>
                <p className="text-sm text-museum-brown-500">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-museum-brown-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
