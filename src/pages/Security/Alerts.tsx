import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Ban,
  TrendingDown,
  MapPin,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Badge from '@/components/Common/Badge';
import { get, post, put } from '@/utils/request';
import { cn } from '@/lib/utils';

type AlertFilter = 'all' | 'active' | 'resolved';

interface AlertItem {
  id: string;
  hallId: string;
  hallName: string;
  type: 'overcrowding' | 'fire' | 'intrusion' | 'temperature' | 'equipment';
  level: 'warning' | 'critical';
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

interface AlertsResponse {
  total: number;
  unresolved: number;
  list: AlertItem[];
}

const typeLabelMap: Record<string, string> = {
  overcrowding: '超容量',
  fire: '火灾警报',
  intrusion: '入侵警报',
  temperature: '温湿度异常',
  equipment: '设备故障',
};

const filterOptions: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '预警中' },
  { key: 'resolved', label: '已处理' },
];

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateTrendData() {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    data.push({
      time: `${time.getHours().toString().padStart(2, '0')}:${time
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
      人数: Math.round(60 + Math.sin(i / 2) * 40 + Math.random() * 20),
    });
  }
  return data;
}

export default function Alerts() {
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [limitingFlow, setLimitingFlow] = useState(false);
  const [trendData] = useState(generateTrendData());

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await get<AlertsResponse>('/security/alerts');
      setAlerts(data.list);
      if (data.list.length > 0) {
        setSelectedAlert(data.list.find((a) => !a.resolved) || data.list[0]);
      }
    } catch (error) {
      console.error('获取预警数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const handleResolve = async () => {
    if (!selectedAlert || selectedAlert.resolved) return;
    setResolving(true);
    try {
      await post(`/security/alerts/${selectedAlert.id}/resolve`);
      const updated = { ...selectedAlert, resolved: true };
      setAlerts((prev) =>
        prev.map((a) => (a.id === selectedAlert.id ? updated : a))
      );
      setSelectedAlert(updated);
    } catch (error) {
      console.error('处理预警失败:', error);
    } finally {
      setResolving(false);
    }
  };

  const handleLimitFlow = async () => {
    if (!selectedAlert) return;
    setLimitingFlow(true);
    try {
      await put(`/security/halls/${selectedAlert.hallId}/limit-flow`, {
        reduceBy: 50,
      });
      alert('限流措施已启动，该展厅临时减少入场人数');
    } catch (error) {
      console.error('启动限流失败:', error);
    } finally {
      setLimitingFlow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-museum-brown-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
          预警中心
        </h1>
        <p className="mt-1 text-sm text-museum-brown-500">
          监控全馆安全预警，及时处理异常情况
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-museum-brown-100 bg-white shadow-museum">
            <div className="border-b border-museum-brown-100 p-4">
              <div className="flex gap-2">
                {filterOptions.map((opt) => {
                  const count =
                    opt.key === 'all'
                      ? alerts.length
                      : opt.key === 'active'
                      ? alerts.filter((a) => !a.resolved).length
                      : alerts.filter((a) => a.resolved).length;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setFilter(opt.key)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                        filter === opt.key
                          ? 'bg-museum-gold-500 text-white shadow-gold'
                          : 'text-museum-brown-600 hover:bg-museum-cream'
                      )}
                    >
                      {opt.label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs',
                          filter === opt.key
                            ? 'bg-white/20 text-white'
                            : 'bg-museum-brown-100 text-museum-brown-600'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="py-16 text-center text-museum-brown-400">
                  暂无预警记录
                </div>
              ) : (
                <div className="divide-y divide-museum-brown-100">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={cn(
                        'cursor-pointer p-4 transition-colors',
                        selectedAlert?.id === alert.id
                          ? 'bg-museum-gold-50'
                          : 'hover:bg-museum-cream/50',
                        !alert.resolved &&
                          selectedAlert?.id !== alert.id &&
                          'border-l-4 border-transparent'
                      )}
                      style={
                        !alert.resolved && selectedAlert?.id !== alert.id
                          ? { borderLeftWidth: alert.level === 'critical' ? '4px' : '0' }
                          : undefined
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                            alert.resolved
                              ? 'bg-museum-brown-100 text-museum-brown-400'
                              : alert.level === 'critical'
                              ? 'bg-red-100 text-museum-crimson animate-pulse-red'
                              : 'bg-amber-100 text-amber-700 animate-pulse-gold'
                          )}
                        >
                          <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-museum-brown-800">
                              {alert.hallName}
                            </p>
                            {!alert.resolved && (
                              <Badge
                                variant={
                                  alert.level === 'critical' ? 'danger' : 'warning'
                                }
                              >
                                {alert.level === 'critical' ? '严重' : '警告'}
                              </Badge>
                            )}
                            {alert.resolved && (
                              <Badge variant="success">已处理</Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-museum-brown-500">
                              {typeLabelMap[alert.type] || alert.type}
                            </span>
                            <span className="text-xs text-museum-brown-300">·</span>
                            <span className="flex items-center gap-1 text-xs text-museum-brown-400">
                              <Clock className="h-3 w-3" />
                              {formatTime(alert.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-xs text-museum-brown-500">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedAlert ? (
            <div className="space-y-5 rounded-xl border border-museum-brown-100 bg-white p-6 shadow-museum">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      selectedAlert.resolved
                        ? 'bg-museum-brown-100 text-museum-brown-400'
                        : selectedAlert.level === 'critical'
                        ? 'bg-red-100 text-museum-crimson animate-pulse-red'
                        : 'bg-amber-100 text-amber-700 animate-pulse-gold'
                    )}
                  >
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-museum-brown-900">
                      {selectedAlert.hallName}
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={
                          selectedAlert.level === 'critical' ? 'danger' : 'warning'
                        }
                      >
                        {selectedAlert.level === 'critical' ? '严重预警' : '一般预警'}
                      </Badge>
                      <Badge variant="info">
                        {typeLabelMap[selectedAlert.type] || selectedAlert.type}
                      </Badge>
                      {selectedAlert.resolved && (
                        <Badge variant="success">已处理</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-museum-cream/50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-museum-gold-600" />
                  <p className="text-sm text-museum-brown-700">
                    {selectedAlert.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-museum-brown-100 p-4">
                  <p className="text-xs text-museum-brown-400">发生位置</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-museum-gold-600" />
                    <p className="font-medium text-museum-brown-800">
                      {selectedAlert.hallName}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-museum-brown-100 p-4">
                  <p className="text-xs text-museum-brown-400">发生时间</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-museum-gold-600" />
                    <p className="font-medium text-museum-brown-800">
                      {formatTime(selectedAlert.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-museum-brown-800">
                  展厅人流历史趋势
                </h3>
                <div className="h-64 rounded-lg border border-museum-brown-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: '#8B6341' }}
                        axisLine={{ stroke: '#E8DCC8' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#8B6341' }}
                        axisLine={{ stroke: '#E8DCC8' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FDF8F3',
                          border: '1px solid #E8DCC8',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="人数"
                        stroke="#B8860B"
                        strokeWidth={2.5}
                        dot={{ fill: '#B8860B', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleLimitFlow}
                  disabled={limitingFlow || selectedAlert.resolved}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                    selectedAlert.resolved
                      ? 'cursor-not-allowed bg-museum-brown-100 text-museum-brown-400'
                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200 shadow-md hover:shadow-lg'
                  )}
                >
                  <TrendingDown className="h-4 w-4" />
                  {limitingFlow ? '执行中...' : '执行限流'}
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolving || selectedAlert.resolved}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                    selectedAlert.resolved
                      ? 'cursor-not-allowed bg-museum-brown-100 text-museum-brown-400'
                      : 'bg-museum-jade text-white hover:bg-green-700 shadow-green-200 shadow-md hover:shadow-lg'
                  )}
                >
                  {selectedAlert.resolved ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      已解除
                    </>
                  ) : resolving ? (
                    <>
                      <CheckCircle className="h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      解除预警
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center rounded-xl border border-museum-brown-100 bg-white shadow-museum">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-museum-brown-300" />
                <p className="mt-3 text-museum-brown-400">请选择一条预警查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
