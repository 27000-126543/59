import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Check,
  X,
  ClipboardList,
  Archive,
  User,
  Clock,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import Modal from '@/components/Common/Modal';
import { get, post } from '@/utils/request';
import type { WorkOrder } from '@/types';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function CuratorWorkOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审批' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
  ];

  useEffect(() => {
    loadWorkOrders();
  }, [activeTab]);

  async function loadWorkOrders() {
    try {
      setLoading(true);
      const statusMap: Record<FilterTab, string | undefined> = {
        all: undefined,
        pending: 'pending_approval',
        approved: 'approved',
        rejected: 'rejected',
      };
      const status = statusMap[activeTab];
      const data = await get<WorkOrder[]>(
        `/workorders${status ? `?status=${status}` : ''}`
      ).catch(() => null);

      if (data) {
        setWorkOrders(data as WorkOrder[]);
      } else {
        setWorkOrders([
          {
            id: 'wo1',
            title: '青铜鼎足部修复',
            description: '青铜鼎左前足出现明显裂缝，长约3cm，需进行修复处理。建议采用传统青铜器修复工艺，使用铜焊进行裂缝填补，并做旧处理以保持外观一致性。',
            type: 'repair',
            priority: 'high',
            status: 'pending_approval',
            requesterId: 'con1',
            requesterName: '张保护',
            exhibitId: 'e1',
            exhibitName: '司母戊鼎',
            createdAt: '2026-06-05T09:30:00Z',
            estimatedCost: 8500,
          },
          {
            id: 'wo2',
            title: '古画装裱修复',
            description: '画作边缘出现轻微霉变，画心有两处小破损，需重新装裱。',
            type: 'repair',
            priority: 'critical',
            status: 'pending_approval',
            requesterId: 'con2',
            requesterName: '李修复',
            exhibitId: 'e2',
            exhibitName: '清明上河图',
            createdAt: '2026-06-06T14:20:00Z',
            estimatedCost: 15000,
          },
          {
            id: 'wo3',
            title: '瓷瓶口沿修补',
            description: '瓷瓶口沿有细小磕碰缺口，需进行金缮修复。',
            type: 'repair',
            priority: 'medium',
            status: 'pending_approval',
            requesterId: 'con1',
            requesterName: '张保护',
            exhibitId: 'e3',
            exhibitName: '汝窑天青釉洗',
            createdAt: '2026-06-04T11:15:00Z',
            estimatedCost: 3200,
          },
          {
            id: 'wo4',
            title: '玉器表面清洁',
            description: '玉器表面有积尘和轻微氧化层，需进行专业清洁保养。',
            type: 'maintenance',
            priority: 'low',
            status: 'approved',
            requesterId: 'con2',
            requesterName: '李修复',
            approverId: 'cur1',
            exhibitId: 'e4',
            exhibitName: '翠玉白菜',
            createdAt: '2026-06-02T10:00:00Z',
            approvedAt: '2026-06-03T08:30:00Z',
            estimatedCost: 800,
          },
          {
            id: 'wo5',
            title: '青铜方尊除锈',
            description: '申请被驳回：当前展览期间不宜进行除锈处理，建议展览结束后再行处理。',
            type: 'repair',
            priority: 'medium',
            status: 'rejected',
            requesterId: 'con1',
            requesterName: '张保护',
            approverId: 'cur1',
            exhibitId: 'e5',
            exhibitName: '四羊方尊',
            rejectReason: '当前展览期间不宜进行除锈处理，建议展览结束后再行处理。',
            createdAt: '2026-05-28T15:45:00Z',
            estimatedCost: 5000,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function getPriorityConfig(priority: WorkOrder['priority']) {
    const map = {
      low: { label: '低', variant: 'default' as const },
      medium: { label: '中', variant: 'warning' as const },
      high: { label: '高', variant: 'danger' as const },
      critical: { label: '紧急', variant: 'danger' as const },
    };
    return map[priority];
  }

  function getStatusConfig(status: WorkOrder['status']) {
    const map = {
      pending_approval: { label: '待审批', variant: 'gold' as const },
      approved: { label: '已通过', variant: 'success' as const },
      rejected: { label: '已驳回', variant: 'danger' as const },
      in_progress: { label: '处理中', variant: 'info' as const },
      completed: { label: '已完成', variant: 'success' as const },
      cancelled: { label: '已取消', variant: 'default' as const },
    };
    return map[status];
  }

  function formatDateTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleApprove(id: string) {
    try {
      setProcessing(id);
      await post(`/workorders/${id}/approve`).catch(() => null);
      await loadWorkOrders();
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: string) {
    try {
      setProcessing(id);
      await post(`/workorders/${id}/reject`, { reason: '不符合审批条件' }).catch(() => null);
      await loadWorkOrders();
    } finally {
      setProcessing(null);
    }
  }

  function openDetail(order: WorkOrder) {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  }

  const filteredOrders =
    activeTab === 'all'
      ? workOrders
      : activeTab === 'pending'
      ? workOrders.filter((o) => o.status === 'pending_approval')
      : activeTab === 'approved'
      ? workOrders.filter((o) => o.status === 'approved' || o.status === 'in_progress')
      : workOrders.filter((o) => o.status === 'rejected');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-serif text-museum-brown-900">修复工单审批</h1>
        <p className="mt-1 text-sm text-museum-brown-500">审核文物保护员提交的修复工单申请</p>
      </div>

      <div className="flex items-center gap-2 border-b border-museum-brown-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-museum-gold-600'
                : 'text-museum-brown-500 hover:text-museum-brown-700'
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-museum-gold-500" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-museum-brown-500">加载中...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-museum-brown-300" />
          <p className="mt-4 text-museum-brown-500">暂无工单数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const priorityConfig = getPriorityConfig(order.priority);
            const statusConfig = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className={cn(
                  'rounded-xl border p-5 transition-all shadow-museum hover:shadow-museum-hover',
                  order.status === 'pending_approval'
                    ? 'border-museum-gold-200 bg-gradient-to-r from-museum-gold-50/80 to-white'
                    : 'border-museum-brown-100 bg-white'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-museum-brown-900">{order.title}</h3>
                      <Badge variant={priorityConfig.variant}>
                        {priorityConfig.label}优先级
                      </Badge>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      {order.priority === 'critical' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-museum-crimson animate-pulse-red">
                          <AlertTriangle className="h-3 w-3" />
                          紧急
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <Archive className="h-4 w-4 text-museum-gold-600" />
                        <span className="text-museum-brown-500">展品：</span>
                        <span className="font-medium">{order.exhibitName || '未指定'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <User className="h-4 w-4 text-museum-gold-600" />
                        <span className="text-museum-brown-500">提交人：</span>
                        <span className="font-medium">{order.requesterName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <Clock className="h-4 w-4 text-museum-gold-600" />
                        <span className="text-museum-brown-500">提交时间：</span>
                        <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                      </div>
                      {order.estimatedCost !== undefined && (
                        <div className="flex items-center gap-1.5 text-museum-brown-600">
                          <span className="text-museum-brown-500">预估费用：</span>
                          <span className="font-medium text-museum-gold-700">
                            ¥{order.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {order.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-museum-brown-600">
                        {order.description}
                      </p>
                    )}
                    {order.rejectReason && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <span className="font-medium">驳回原因：</span>
                        {order.rejectReason}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openDetail(order)}
                      className="flex items-center gap-1.5 rounded-lg border border-museum-brown-200 bg-white px-4 py-2 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
                    >
                      <Eye className="h-4 w-4" />
                      详情
                    </button>
                    {order.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => handleReject(order.id)}
                          disabled={processing === order.id}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-museum-crimson transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          驳回
                        </button>
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={processing === order.id}
                          className="btn-gold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          通过
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="工单详情"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-museum-brown-900">{selectedOrder.title}</h3>
              <Badge variant={getPriorityConfig(selectedOrder.priority).variant}>
                {getPriorityConfig(selectedOrder.priority).label}优先级
              </Badge>
              <Badge variant={getStatusConfig(selectedOrder.status).variant}>
                {getStatusConfig(selectedOrder.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-museum-brown-500">关联展品</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {selectedOrder.exhibitName || '未指定'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">工单类型</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {selectedOrder.type === 'repair'
                    ? '修复'
                    : selectedOrder.type === 'maintenance'
                    ? '保养'
                    : selectedOrder.type === 'installation'
                    ? '安装'
                    : selectedOrder.type === 'inspection'
                    ? '检查'
                    : '其他'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">提交人</p>
                <p className="mt-1 text-sm text-museum-brown-800">{selectedOrder.requesterName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">提交时间</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              {selectedOrder.estimatedCost !== undefined && (
                <div>
                  <p className="text-xs font-medium text-museum-brown-500">预估费用</p>
                  <p className="mt-1 text-sm font-medium text-museum-gold-700">
                    ¥{selectedOrder.estimatedCost.toLocaleString()}
                  </p>
                </div>
              )}
              {selectedOrder.approvedAt && (
                <div>
                  <p className="text-xs font-medium text-museum-brown-500">审批时间</p>
                  <p className="mt-1 text-sm text-museum-brown-800">
                    {formatDateTime(selectedOrder.approvedAt)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-museum-brown-500">损坏描述</p>
              <div className="rounded-lg bg-museum-brown-50 p-4">
                <p className="text-sm text-museum-brown-700 leading-relaxed whitespace-pre-wrap">
                  {selectedOrder.description || '暂无描述'}
                </p>
              </div>
            </div>

            {selectedOrder.rejectReason && (
              <div>
                <p className="mb-2 text-xs font-medium text-museum-brown-500">驳回原因</p>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700 leading-relaxed">
                    {selectedOrder.rejectReason}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium text-museum-brown-500">现场图片</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-museum-brown-200 bg-museum-brown-50"
                  >
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-museum-brown-300" />
                      <p className="mt-1 text-xs text-museum-brown-400">图片 {i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
