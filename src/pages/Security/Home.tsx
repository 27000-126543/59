import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, AlertTriangle, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import DataCard from '@/components/Common/DataCard';
import Badge from '@/components/Common/Badge';
import { get } from '@/utils/request';
import { cn } from '@/lib/utils';

interface HallFlow {
  id: string;
  name: string;
  currentCount: number;
  maxCapacity: number;
  occupancyRate: number;
  densityLevel: 'normal' | 'warning' | 'critical';
}

interface AlertItem {
  id: string;
  hallId: string;
  hallName: string;
  type: string;
  level: 'warning' | 'critical';
  message: string;
  resolved: boolean;
  createdAt: string;
}

interface FlowData {
  totalCurrent: number;
  totalMax: number;
  overallOccupancy: number;
  halls: HallFlow[];
}

interface AlertsResponse {
  total: number;
  unresolved: number;
  list: AlertItem[];
}

const densityColorMap = {
  normal: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-museum-jade',
    bar: 'bg-museum-jade',
    label: '正常',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    label: '人流较多',
  },
  critical: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-museum-crimson',
    bar: 'bg-museum-crimson',
    label: '拥挤',
  },
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SecurityHome() {
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flow, alerts] = await Promise.all([
          get<FlowData>('/security/flow'),
          get<AlertsResponse>('/security/alerts'),
        ]);
        setFlowData(flow);
        setAlertsData(alerts);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unresolvedCount = alertsData?.unresolved ?? 0;
  const resolvedCount = (alertsData?.total ?? 0) - unresolvedCount;
  const recentAlerts = alertsData?.list.slice(0, 5) ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-museum-brown-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
            安全管理员工作台
          </h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            实时监控各展厅人流密度与安全预警
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="展厅总数"
          value={flowData?.halls.length ?? 0}
          subtitle="全馆展厅"
          icon={<Building2 className="h-6 w-6" />}
          color="brown"
        />
        <DataCard
          title="当前总人数"
          value={flowData?.totalCurrent ?? 0}
          subtitle={`最大容量 ${flowData?.totalMax ?? 0} 人`}
          icon={<Users className="h-6 w-6" />}
          color="gold"
          trend={flowData?.overallOccupancy}
        />
        <DataCard
          title="预警中"
          value={unresolvedCount}
          subtitle="待处理预警"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="crimson"
        />
        <DataCard
          title="今日已处理"
          value={resolvedCount}
          subtitle="已解决预警"
          icon={<CheckCircle className="h-6 w-6" />}
          color="jade"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-museum-brown-800">
            各展厅人流密度
          </h2>
          <button
            onClick={() => navigate('/security/capacity')}
            className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700"
          >
            容量设置 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flowData?.halls.map((hall) => {
            const colors = densityColorMap[hall.densityLevel];
            return (
              <div
                key={hall.id}
                className={cn(
                  'rounded-xl border p-5 shadow-museum transition-all hover:shadow-museum-hover',
                  colors.bg
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-museum-brown-800">
                      {hall.name}
                    </h3>
                    <Badge variant={hall.densityLevel === 'critical' ? 'danger' : hall.densityLevel === 'warning' ? 'warning' : 'success'}>
                      {colors.label}
                    </Badge>
                  </div>
                  <div className={cn('text-right', colors.text)}>
                    <p className="text-2xl font-bold">{hall.currentCount}</p>
                    <p className="text-xs">/ {hall.maxCapacity}人</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-museum-brown-500">
                    <span>容量使用率</span>
                    <span>{hall.occupancyRate}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      className={cn('h-full rounded-full transition-all', colors.bar)}
                      style={{ width: `${Math.min(hall.occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-museum-brown-800">
            最近预警
          </h2>
          <button
            onClick={() => navigate('/security/alerts')}
            className="flex items-center gap-1 text-sm text-museum-gold-600 hover:text-museum-gold-700"
          >
            查看全部 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-museum-brown-100 shadow-museum">
          {recentAlerts.length === 0 ? (
            <div className="py-12 text-center text-museum-brown-400">
              暂无预警记录
            </div>
          ) : (
            <div className="divide-y divide-museum-brown-100">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-museum-cream/50"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      alert.level === 'critical'
                        ? 'bg-red-100 text-museum-crimson animate-pulse-red'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-museum-brown-800 truncate">
                        {alert.hallName}
                      </p>
                      <Badge
                        variant={
                          alert.level === 'critical' ? 'danger' : 'warning'
                        }
                      >
                        {alert.level === 'critical' ? '严重' : '警告'}
                      </Badge>
                      <Badge variant={alert.resolved ? 'success' : 'default'}>
                        {alert.resolved ? '已处理' : '待处理'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-museum-brown-500 line-clamp-1">
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-museum-brown-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(alert.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
