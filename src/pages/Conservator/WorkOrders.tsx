import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Archive,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import Modal from '@/components/Common/Modal';
import { get, post } from '@/utils/request';
import type { WorkOrder, Exhibit } from '@/types';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

interface NewWorkOrderForm {
  exhibitId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const priorityOptions: { value: NewWorkOrderForm['priority']; label: string; color: string }[] = [
  { value: 'low', label: '低', color: 'bg-museum-brown-100 text-museum-brown-700 ring-museum-brown-400' },
  { value: 'medium', label: '中', color: 'bg-amber-100 text-amber-700 ring-amber-400' },
  { value: 'high', label: '高', color: 'bg-red-100 text-museum-crimson ring-red-400' },
  { value: 'critical', label: '紧急', color: 'bg-red-600 text-white ring-red-600' },
];

export default function ConservatorWorkOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form, setForm] = useState<NewWorkOrderForm>({
    exhibitId: '',
    description: '',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审批' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
    { key: 'completed', label: '已完成' },
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      const statusMap: Record<FilterTab, string | undefined> = {
        all: undefined,
        pending: 'pending_approval',
        approved: 'approved',
        rejected: 'rejected',
        completed: 'completed',
      };
      const status = statusMap[activeTab];

      const [ordersData, exhibitsData] = await Promise.all([
        get<WorkOrder[]>(`/workorders/my${status ? `?status=${status}` : ''}`).catch(() => null),
        get<Exhibit[]>('/exhibits?assigned=true').catch(() => null),
      ]);

      if (ordersData) {
        setWorkOrders(ordersData as WorkOrder[]);
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
            requesterId: 'con1',
            requesterName: '张保护',
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
            status: 'approved',
            requesterId: 'con1',
            requesterName: '张保护',
            approverId: 'cur1',
            exhibitId: 'e3',
            exhibitName: '汝窑天青釉洗',
            createdAt: '2026-06-04T11:15:00Z',
            approvedAt: '2026-06-05T08:30:00Z',
            estimatedCost: 3200,
          },
          {
            id: 'wo4',
            title: '玉器表面清洁',
            description: '玉器表面有积尘和轻微氧化层，需进行专业清洁保养。',
            type: 'maintenance',
            priority: 'low',
            status: 'approved',
            requesterId: 'con1',
            requesterName: '张保护',
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
            description: '青铜器表面有氧化锈蚀，建议做除锈和缓蚀处理。',
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
          {
            id: 'wo6',
            title: '书画展柜密封条更换',
            description: '展柜密封胶条老化，需更换新的密封条以保持微环境稳定。',
            type: 'installation',
            priority: 'medium',
            status: 'completed',
            requesterId: 'con1',
            requesterName: '张保护',
            approverId: 'cur1',
            exhibitId: 'e6',
            exhibitName: '富春山居图',
            createdAt: '2026-05-10T09:00:00Z',
            approvedAt: '2026-05-11T08:00:00Z',
            completedAt: '2026-05-15T16:30:00Z',
            estimatedCost: 1500,
          },
        ]);
      }

      if (exhibitsData) {
        setExhibits(exhibitsData as Exhibit[]);
      } else {
        setExhibits([
          { id: 'e1', name: '司母戊鼎', era: '商代', category: 'bronze', description: '', imageUrl: '', location: '第一展厅 A-01', hallId: 'h1', condition: 'fair', acquisitionDate: '1950-01-01', lastInspectionDate: '2026-06-01', exhibitionHistory: [] },
          { id: 'e2', name: '清明上河图', era: '北宋', category: 'painting', description: '', imageUrl: '', location: '第一展厅 B-03', hallId: 'h1', condition: 'good', acquisitionDate: '1955-03-10', lastInspectionDate: '2026-06-01', exhibitionHistory: [] },
          { id: 'e3', name: '汝窑天青釉洗', era: '北宋', category: 'ceramic', description: '', imageUrl: '', location: '第二展厅 C-02', hallId: 'h2', condition: 'good', acquisitionDate: '1948-07-22', lastInspectionDate: '2026-05-20', exhibitionHistory: [] },
          { id: 'e4', name: '翠玉白菜', era: '清代', category: 'jade', description: '', imageUrl: '', location: '第二展厅 D-01', hallId: 'h2', condition: 'excellent', acquisitionDate: '1965-11-30', lastInspectionDate: '2026-04-10', exhibitionHistory: [] },
          { id: 'e5', name: '四羊方尊', era: '商代', category: 'bronze', description: '', imageUrl: '', location: '第三展厅 A-05', hallId: 'h3', condition: 'fair', acquisitionDate: '1952-04-18', lastInspectionDate: '2026-03-15', exhibitionHistory: [] },
          { id: 'e6', name: '富春山居图', era: '元代', category: 'painting', description: '', imageUrl: '', location: '第三展厅 B-08', hallId: 'h3', condition: 'good', acquisitionDate: '1958-09-25', lastInspectionDate: '2026-05-28', exhibitionHistory: [] },
          { id: 'e7', name: '青花瓷瓶', era: '明代', category: 'ceramic', description: '', imageUrl: '', location: '第四展厅 C-12', hallId: 'h4', condition: 'excellent', acquisitionDate: '1960-02-14', lastInspectionDate: '2026-06-03', exhibitionHistory: [] },
          { id: 'e8', name: '玉璧', era: '汉代', category: 'jade', description: '', imageUrl: '', location: '第四展厅 D-07', hallId: 'h4', condition: 'fair', acquisitionDate: '1956-08-09', lastInspectionDate: '2026-02-20', exhibitionHistory: [] },
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
      pending_approval: { label: '待审批', variant: 'gold' as const, icon: <Clock className="h-3.5 w-3.5" /> },
      approved: { label: '已通过', variant: 'success' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      rejected: { label: '已驳回', variant: 'danger' as const, icon: <XCircle className="h-3.5 w-3.5" /> },
      in_progress: { label: '处理中', variant: 'info' as const, icon: <AlertTriangle className="h-3.5 w-3.5" /> },
      completed: { label: '已完成', variant: 'success' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      cancelled: { label: '已取消', variant: 'default' as const, icon: <XCircle className="h-3.5 w-3.5" /> },
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

  function updateForm<K extends keyof NewWorkOrderForm>(key: K, value: NewWorkOrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateWorkOrder() {
    if (!form.exhibitId || !form.description.trim()) return;
    try {
      setSubmitting(true);
      const selectedExhibit = exhibits.find((e) => e.id === form.exhibitId);
      const payload = {
        title: `${selectedExhibit?.name || '展品'}修复申请`,
        description: form.description,
        type: 'repair' as const,
        priority: form.priority,
        exhibitId: form.exhibitId,
        exhibitName: selectedExhibit?.name,
        status: 'pending_approval' as const,
      };
      await post('/workorders', payload).catch(() => null);
      setCreateModalOpen(false);
      setForm({ exhibitId: '', description: '', priority: 'medium' });
      await loadData();
    } finally {
      setSubmitting(false);
    }
  }

  const filteredOrders =
    activeTab === 'all'
      ? workOrders
      : activeTab === 'pending'
      ? workOrders.filter((o) => o.status === 'pending_approval')
      : activeTab === 'approved'
      ? workOrders.filter((o) => o.status === 'approved' || o.status === 'in_progress')
      : activeTab === 'rejected'
      ? workOrders.filter((o) => o.status === 'rejected')
      : workOrders.filter((o) => o.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">修复工单</h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            提交和管理展品修复工单申请
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新建修复工单
        </button>
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
          <FileText className="mx-auto h-12 w-12 text-museum-brown-300" />
          <p className="mt-4 text-museum-brown-500">暂无工单数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredOrders.map((order) => {
            const priorityConfig = getPriorityConfig(order.priority);
            const statusConfig = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className={cn(
                  'rounded-xl border p-5 transition-all shadow-museum hover:shadow-museum-hover',
                  order.status === 'pending_approval'
                    ? 'border-museum-gold-200 bg-gradient-to-r from-museum-gold-50/60 to-white'
                    : order.status === 'rejected'
                    ? 'border-red-200 bg-gradient-to-r from-red-50/40 to-white'
                    : order.status === 'completed'
                    ? 'border-green-200 bg-gradient-to-r from-green-50/40 to-white opacity-80'
                    : 'border-museum-brown-100 bg-white'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-museum-brown-900">{order.title}</h3>
                      <Badge variant={priorityConfig.variant}>
                        {order.priority === 'critical' ? (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {priorityConfig.label}
                          </span>
                        ) : (
                          priorityConfig.label
                        )}
                      </Badge>
                      <Badge variant={statusConfig.variant}>
                        <span className="flex items-center gap-1">
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <Archive className="h-3.5 w-3.5 text-museum-gold-600" />
                        <span className="text-museum-brown-500">展品：</span>
                        <span className="font-medium">{order.exhibitName || '未指定'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <User className="h-3.5 w-3.5 text-museum-gold-600" />
                        <span className="text-museum-brown-500">提交人：</span>
                        <span className="font-medium">{order.requesterName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-museum-brown-600">
                        <Clock className="h-3.5 w-3.5 text-museum-gold-600" />
                        <span>{formatDateTime(order.createdAt)}</span>
                      </div>
                    </div>

                    {order.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-museum-brown-600">
                        {order.description}
                      </p>
                    )}

                    {order.rejectReason && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        <span className="font-medium">驳回原因：</span>
                        {order.rejectReason}
                      </div>
                    )}

                    {order.approvedAt && order.status !== 'rejected' && (
                      <p className="mt-2 text-xs text-museum-brown-400">
                        审批时间：{formatDateTime(order.approvedAt)}
                      </p>
                    )}
                    {order.completedAt && (
                      <p className="mt-1 text-xs text-museum-brown-400">
                        完成时间：{formatDateTime(order.completedAt)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-museum-brown-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="新建修复工单"
        size="lg"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
              选择展品 <span className="text-museum-crimson">*</span>
            </label>
            <select
              value={form.exhibitId}
              onChange={(e) => updateForm('exhibitId', e.target.value)}
              className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
            >
              <option value="">请选择需要修复的展品</option>
              {exhibits.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}（{ex.era}）- {ex.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
              损坏描述 <span className="text-museum-crimson">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="请详细描述展品的损坏情况，包括损坏位置、程度、建议修复方式等..."
              rows={5}
              className="w-full resize-none rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
            />
            <p className="mt-1 text-xs text-museum-brown-400">
              请尽可能详细描述，以便策展人审批
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-museum-brown-700">
              紧急程度 <span className="text-museum-crimson">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateForm('priority', opt.value)}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    form.priority === opt.value
                      ? `${opt.color} ring-2 ring-offset-2 shadow-md`
                      : 'bg-museum-brown-50 text-museum-brown-600 hover:bg-museum-brown-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-museum-brown-400">
              <span className="font-medium">说明：</span>
              低 - 不影响展示；中 - 轻微损坏；高 - 明显损坏影响展示；紧急 - 有进一步损坏风险
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCreateModalOpen(false)}
            className="flex-1 rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
          >
            取消
          </button>
          <button
            onClick={handleCreateWorkOrder}
            disabled={submitting || !form.exhibitId || !form.description.trim()}
            className="btn-gold flex-1 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交工单'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
