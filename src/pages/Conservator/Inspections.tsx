import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Clock,
  MapPin,
  Archive,
  ClipboardCheck,
  Thermometer,
  Droplets,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import Modal from '@/components/Common/Modal';
import { get, post } from '@/utils/request';
import type { Inspection } from '@/types';
import { cn } from '@/lib/utils';

interface InspectionTask {
  id: string;
  exhibitId: string;
  exhibitName: string;
  exhibitEra?: string;
  location: string;
  scheduledTime: string;
  status: 'pending' | 'completed';
}

interface InspectionForm {
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  temperature: string;
  humidity: string;
  notes: string;
}

const conditionOptions = [
  { value: 'excellent', label: '优秀', color: 'bg-museum-jade text-white', ring: 'ring-museum-jade' },
  { value: 'good', label: '良好', color: 'bg-blue-500 text-white', ring: 'ring-blue-500' },
  { value: 'fair', label: '一般', color: 'bg-amber-500 text-white', ring: 'ring-amber-500' },
  { value: 'poor', label: '较差', color: 'bg-museum-crimson text-white', ring: 'ring-museum-crimson' },
];

export default function ConservatorInspections() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<InspectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [form, setForm] = useState<InspectionForm>({
    condition: 'good',
    temperature: '',
    humidity: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await get<Inspection[]>('/inspections/today').catch(() => null);

      if (data) {
        setTasks(
          (data as Inspection[]).map((ins) => ({
            id: ins.id,
            exhibitId: ins.exhibitId,
            exhibitName: `展品 ${ins.exhibitId}`,
            location: ins.hallName || '未知位置',
            scheduledTime: ins.scheduledTime || '09:00',
            status: ins.status === 'completed' ? 'completed' : 'pending',
          }))
        );
      } else {
        setTasks([
          {
            id: 'ins1',
            exhibitId: 'e1',
            exhibitName: '司母戊鼎',
            exhibitEra: '商代',
            location: '第一展厅 A-01',
            scheduledTime: '09:00',
            status: 'completed',
          },
          {
            id: 'ins2',
            exhibitId: 'e2',
            exhibitName: '清明上河图',
            exhibitEra: '北宋',
            location: '第一展厅 B-03',
            scheduledTime: '09:30',
            status: 'completed',
          },
          {
            id: 'ins3',
            exhibitId: 'e3',
            exhibitName: '汝窑天青釉洗',
            exhibitEra: '北宋',
            location: '第二展厅 C-02',
            scheduledTime: '10:00',
            status: 'completed',
          },
          {
            id: 'ins4',
            exhibitId: 'e4',
            exhibitName: '翠玉白菜',
            exhibitEra: '清代',
            location: '第二展厅 D-01',
            scheduledTime: '10:30',
            status: 'completed',
          },
          {
            id: 'ins5',
            exhibitId: 'e5',
            exhibitName: '四羊方尊',
            exhibitEra: '商代',
            location: '第三展厅 A-05',
            scheduledTime: '14:00',
            status: 'pending',
          },
          {
            id: 'ins6',
            exhibitId: 'e6',
            exhibitName: '富春山居图',
            exhibitEra: '元代',
            location: '第三展厅 B-08',
            scheduledTime: '14:30',
            status: 'pending',
          },
          {
            id: 'ins7',
            exhibitId: 'e7',
            exhibitName: '青花瓷瓶',
            exhibitEra: '明代',
            location: '第四展厅 C-12',
            scheduledTime: '15:00',
            status: 'pending',
          },
          {
            id: 'ins8',
            exhibitId: 'e8',
            exhibitName: '玉璧',
            exhibitEra: '汉代',
            location: '第四展厅 D-07',
            scheduledTime: '15:30',
            status: 'pending',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function openInspectionModal(task: InspectionTask) {
    setSelectedTask(task);
    setForm({
      condition: 'good',
      temperature: '',
      humidity: '',
      notes: '',
    });
    setInspectionModalOpen(true);
  }

  function updateForm<K extends keyof InspectionForm>(key: K, value: InspectionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmitInspection() {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      const payload = {
        condition: form.condition,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        humidity: form.humidity ? Number(form.humidity) : undefined,
        notes: form.notes,
        status: 'completed',
      };
      await post(`/inspections/${selectedTask.id}/complete`, payload).catch(() => null);
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, status: 'completed' } : t))
      );
      setInspectionModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">巡检任务</h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            今日需完成 {tasks.length} 件展品巡检，已完成 {completedTasks.length} 件
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="gold">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              待完成 {pendingTasks.length} 件
            </span>
          </Badge>
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              已完成 {completedTasks.length} 件
            </span>
          </Badge>
        </div>
      </div>

      {pendingTasks.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-museum-brown-800">
            <Clock className="h-4 w-4 text-museum-gold-600" />
            待完成巡检
          </h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-museum-brown-500">加载中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="museum-card rounded-xl border border-museum-gold-200 bg-gradient-to-br from-white to-museum-gold-50/40 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-museum-gold-100 text-museum-gold-600">
                        <Archive className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-museum-brown-900">
                          {task.exhibitName}
                        </h3>
                        {task.exhibitEra && (
                          <p className="mt-0.5 text-xs text-museum-brown-500">{task.exhibitEra}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-museum-brown-600">
                            <MapPin className="h-3.5 w-3.5 text-museum-gold-600" />
                            <span className="truncate">{task.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-museum-brown-600">
                            <Clock className="h-3.5 w-3.5 text-museum-gold-600" />
                            <span>应检时间 {task.scheduledTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="gold">待完成</Badge>
                  </div>
                  <button
                    onClick={() => openInspectionModal(task)}
                    className="btn-gold mt-4 flex w-full items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    开始巡检
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-museum-brown-800">
            <CheckCircle2 className="h-4 w-4 text-museum-jade" />
            已完成巡检
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-museum-brown-100 bg-museum-brown-50/50 p-5 opacity-80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-museum-jade">
                      <Archive className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-museum-brown-700">
                        {task.exhibitName}
                      </h3>
                      {task.exhibitEra && (
                        <p className="mt-0.5 text-xs text-museum-brown-400">{task.exhibitEra}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-museum-brown-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{task.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-museum-brown-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>应检时间 {task.scheduledTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">已完成</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="py-16 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-museum-brown-300" />
          <p className="mt-4 text-museum-brown-500">今日暂无巡检任务</p>
        </div>
      )}

      <Modal
        open={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        title="提交巡检结果"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-museum-gold-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-museum-gold-600 shadow-sm">
                <Archive className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-museum-brown-900">{selectedTask.exhibitName}</h3>
                <p className="text-sm text-museum-brown-500">
                  {selectedTask.location} · 应检 {selectedTask.scheduledTime}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-medium text-museum-brown-700">
                品相评估 <span className="text-museum-crimson">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {conditionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm('condition', opt.value as InspectionForm['condition'])}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      form.condition === opt.value
                        ? `${opt.color} ring-2 ring-offset-2 ${opt.ring} shadow-md`
                        : 'bg-museum-brown-50 text-museum-brown-600 hover:bg-museum-brown-100'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  <Thermometer className="mr-1 inline h-4 w-4 text-museum-gold-600" />
                  温度（°C）
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={(e) => updateForm('temperature', e.target.value)}
                  placeholder="如 22.5"
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  <Droplets className="mr-1 inline h-4 w-4 text-museum-gold-600" />
                  湿度（%）
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.humidity}
                  onChange={(e) => updateForm('humidity', e.target.value)}
                  placeholder="如 55"
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                <MessageSquare className="mr-1 inline h-4 w-4 text-museum-gold-600" />
                备注
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                placeholder="记录巡检过程中发现的问题或其他需要说明的情况..."
                rows={4}
                className="w-full resize-none rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
              />
            </div>

            {form.condition === 'poor' || form.condition === 'fair' ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">建议提交修复工单</p>
                  <p className="mt-0.5">
                    展品品相评估为「{form.condition === 'poor' ? '较差' : '一般'}」，建议提交修复工单申请进一步处理。
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
        {selectedTask && (
          <div className="flex gap-3">
            <button
              onClick={() => setInspectionModalOpen(false)}
              className="flex-1 rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmitInspection}
              disabled={submitting || !form.condition}
              className="btn-gold flex-1 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交巡检结果'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
