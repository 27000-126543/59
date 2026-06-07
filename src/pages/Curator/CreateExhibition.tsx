import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Archive,
  Info,
  Lock,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import { get, post } from '@/utils/request';
import type { Exhibition, Exhibit, ConflictCheckResponse } from '@/types';
import { cn } from '@/lib/utils';

interface ExhibitionForm {
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  hallId: string;
  hallName: string;
  ticketPrice: number;
  maxCapacityPerSlot: number;
  selectedExhibitIds: string[];
}

interface Hall {
  id: string;
  name: string;
}

const halls: Hall[] = [
  { id: 'h1', name: '第一展厅' },
  { id: 'h2', name: '第二展厅' },
  { id: 'h3', name: '第三展厅' },
  { id: 'h4', name: '第四展厅' },
  { id: 'h5', name: '第五展厅' },
];

const categories = [
  { value: 'all', label: '全部' },
  { value: 'bronze', label: '青铜器' },
  { value: 'painting', label: '书画' },
  { value: 'ceramic', label: '瓷器' },
  { value: 'jade', label: '玉器' },
  { value: 'other', label: '其他' },
];

const steps = [
  { id: 1, label: '基本信息' },
  { id: 2, label: '展品选择' },
  { id: 3, label: '冲突检测' },
  { id: 4, label: '方案预览' },
];

export default function CreateExhibition() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ExhibitionForm>({
    title: '',
    subtitle: '',
    description: '',
    startDate: '',
    endDate: '',
    hallId: '',
    hallName: '',
    ticketPrice: 0,
    maxCapacityPerSlot: 50,
    selectedExhibitIds: [],
  });
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [conflictResult, setConflictResult] = useState<ConflictCheckResponse | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExhibits, setLoadingExhibits] = useState(false);

  useEffect(() => {
    if (editId) {
      loadExhibition(editId);
    }
    loadExhibits();
  }, [editId]);

  async function loadExhibition(id: string) {
    try {
      const data = await get<Exhibition>(`/exhibitions/${id}`).catch(() => null);
      if (data) {
        const ex = data as Exhibition;
        const hall = halls.find((h) => h.name === ex.location) || halls[0];
        setForm({
          title: ex.title || '',
          subtitle: ex.subtitle || '',
          description: ex.description || '',
          startDate: ex.startDate || '',
          endDate: ex.endDate || '',
          hallId: hall?.id || '',
          hallName: hall?.name || ex.location || '',
          ticketPrice: ex.ticketPrice || 0,
          maxCapacityPerSlot: ex.maxCapacityPerSlot || 50,
          selectedExhibitIds: ex.exhibitIds || [],
        });
      }
    } catch {
      // ignore
    }
  }

  async function loadExhibits() {
    try {
      setLoadingExhibits(true);
      const data = await get<Exhibit[]>('/exhibits').catch(() => null);
      if (data) {
        setExhibits(data as Exhibit[]);
      } else {
        setExhibits([
          { id: 'e1', name: '司母戊鼎', era: '商代', category: 'bronze', description: '商代晚期青铜礼器', imageUrl: '', location: '库房A-01', hallId: '', condition: 'excellent', acquisitionDate: '1950-01-01', lastInspectionDate: '2026-05-15', exhibitionHistory: [] },
          { id: 'e2', name: '清明上河图', era: '北宋', category: 'painting', description: '北宋张择端风俗画', imageUrl: '', location: '库房B-02', hallId: '', condition: 'good', acquisitionDate: '1955-03-10', lastInspectionDate: '2026-06-01', exhibitionHistory: [] },
          { id: 'e3', name: '汝窑天青釉洗', era: '北宋', category: 'ceramic', description: '宋代五大名窑之首', imageUrl: '', location: '库房C-03', hallId: '', condition: 'excellent', acquisitionDate: '1948-07-22', lastInspectionDate: '2026-05-20', exhibitionHistory: [] },
          { id: 'e4', name: '翠玉白菜', era: '清代', category: 'jade', description: '清宫旧藏玉雕精品', imageUrl: '', location: '库房D-01', hallId: '', condition: 'good', acquisitionDate: '1965-11-30', lastInspectionDate: '2026-04-10', exhibitionHistory: [] },
          { id: 'e5', name: '四羊方尊', era: '商代', category: 'bronze', description: '商代青铜方尊', imageUrl: '', location: '库房A-05', hallId: '', condition: 'fair', acquisitionDate: '1952-04-18', lastInspectionDate: '2026-03-15', exhibitionHistory: [] },
          { id: 'e6', name: '富春山居图', era: '元代', category: 'painting', description: '黄公望山水画代表作', imageUrl: '', location: '库房B-08', hallId: '', condition: 'good', acquisitionDate: '1958-09-25', lastInspectionDate: '2026-05-28', exhibitionHistory: [] },
          { id: 'e7', name: '青花瓷瓶', era: '明代', category: 'ceramic', description: '永乐年间官窑精品', imageUrl: '', location: '库房C-12', hallId: '', condition: 'excellent', acquisitionDate: '1960-02-14', lastInspectionDate: '2026-06-03', exhibitionHistory: [] },
          { id: 'e8', name: '玉璧', era: '汉代', category: 'jade', description: '汉代祭祀用玉', imageUrl: '', location: '库房D-07', hallId: '', condition: 'fair', acquisitionDate: '1956-08-09', lastInspectionDate: '2026-02-20', exhibitionHistory: [] },
        ]);
      }
    } finally {
      setLoadingExhibits(false);
    }
  }

  function updateForm<K extends keyof ExhibitionForm>(key: K, value: ExhibitionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleExhibit(exhibitId: string) {
    setForm((prev) => ({
      ...prev,
      selectedExhibitIds: prev.selectedExhibitIds.includes(exhibitId)
        ? prev.selectedExhibitIds.filter((id) => id !== exhibitId)
        : [...prev.selectedExhibitIds, exhibitId],
    }));
  }

  const filteredExhibits = exhibits.filter((ex) => {
    const matchKeyword =
      !searchKeyword ||
      ex.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (ex.era || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const matchCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchKeyword && matchCategory;
  });

  function validateStep1() {
    return form.title.trim() && form.startDate && form.endDate && form.hallId;
  }

  function validateStep2() {
    return form.selectedExhibitIds.length > 0;
  }

  async function goToNextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep === 2) {
      await checkConflicts();
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }

  function goToPrevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/curator/exhibitions');
    }
  }

  async function checkConflicts() {
    try {
      setCheckingConflict(true);
      const data = await post<ConflictCheckResponse>('/exhibitions/check-conflict', {
        startDate: form.startDate,
        endDate: form.endDate,
        hallId: form.hallId,
        exhibitIds: form.selectedExhibitIds,
        excludeId: editId || undefined,
      }).catch(() => null);

      if (data) {
        setConflictResult(data as ConflictCheckResponse);
      } else {
        setConflictResult({
          hasConflict: true,
          conflicts: [
            {
              type: 'exhibit',
              message: '展品「清明上河图」已在「唐宋书画精品展」中展出（2026-05-01 至 2026-08-31）',
              conflictingIds: ['e2'],
            },
            {
              type: 'hall',
              message: '展厅「第一展厅」在 2026-07-15 至 2026-09-30 期间已被「古代书法展」占用',
              conflictingIds: ['h1'],
            },
          ],
        });
      }
    } finally {
      setCheckingConflict(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      const selectedHall = halls.find((h) => h.id === form.hallId);
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        location: selectedHall?.name || form.hallName,
        hallId: form.hallId,
        ticketPrice: form.ticketPrice,
        maxCapacityPerSlot: form.maxCapacityPerSlot,
        exhibitIds: form.selectedExhibitIds,
        status: 'draft' as const,
      };

      if (editId) {
        await post(`/exhibitions/${editId}`, payload).catch(() => null);
      } else {
        await post('/exhibitions', payload).catch(() => null);
      }

      navigate('/curator/exhibitions');
    } finally {
      setSubmitting(false);
    }
  }

  function getCategoryLabel(value: string) {
    return categories.find((c) => c.value === value)?.label || value;
  }

  function getConditionLabel(condition: Exhibit['condition']) {
    const map = {
      excellent: { label: '优秀', variant: 'success' as const },
      good: { label: '良好', variant: 'info' as const },
      fair: { label: '一般', variant: 'warning' as const },
      poor: { label: '较差', variant: 'danger' as const },
    };
    return map[condition];
  }

  const selectedExhibits = exhibits.filter((e) => form.selectedExhibitIds.includes(e.id));
  const conflictingExhibitIds = new Set(
    conflictResult?.conflicts.filter((c) => c.type === 'exhibit').flatMap((c) => c.conflictingIds) || []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/curator/exhibitions')}
            className="rounded-lg p-2 text-museum-brown-500 transition-colors hover:bg-museum-brown-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
              {editId ? '编辑展览' : '创建新展览'}
            </h1>
            <p className="mt-1 text-sm text-museum-brown-500">
              分步骤完成展览策划，系统将自动检测时间和展品冲突
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-museum">
        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    currentStep > step.id
                      ? 'border-museum-jade bg-museum-jade text-white'
                      : currentStep === step.id
                      ? 'border-museum-gold-500 bg-museum-gold-500 text-white'
                      : 'border-museum-brown-200 bg-white text-museum-brown-400'
                  )}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-museum-brown-800' : 'text-museum-brown-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1',
                    currentStep > step.id ? 'bg-museum-jade' : 'bg-museum-brown-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  展览名称 <span className="text-museum-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="请输入展览名称"
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  副标题
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => updateForm('subtitle', e.target.value)}
                  placeholder="请输入副标题（可选）"
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  展览描述
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="请输入展览详细描述"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  开始日期 <span className="text-museum-crimson">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  结束日期 <span className="text-museum-crimson">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  展厅选择 <span className="text-museum-crimson">*</span>
                </label>
                <select
                  value={form.hallId}
                  onChange={(e) => {
                    const hall = halls.find((h) => h.id === e.target.value);
                    updateForm('hallId', e.target.value);
                    updateForm('hallName', hall?.name || '');
                  }}
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                >
                  <option value="">请选择展厅</option>
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  票价（元）
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.ticketPrice}
                  onChange={(e) => updateForm('ticketPrice', Number(e.target.value))}
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-museum-brown-700">
                  单时段容量（人）
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxCapacityPerSlot}
                  onChange={(e) => updateForm('maxCapacityPerSlot', Number(e.target.value))}
                  className="w-full rounded-lg border border-museum-brown-200 bg-white px-4 py-2.5 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-museum-brown-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索展品名称或年代..."
                  className="w-full rounded-lg border border-museum-brown-200 bg-white py-2.5 pl-10 pr-4 text-museum-brown-900 outline-none transition focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                      selectedCategory === cat.value
                        ? 'bg-museum-gold-500 text-white shadow-gold'
                        : 'bg-museum-brown-100 text-museum-brown-600 hover:bg-museum-brown-200'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-museum-gold-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-museum-gold-700">
                <Info className="h-4 w-4" />
                已选择 <span className="font-semibold">{form.selectedExhibitIds.length}</span> 件展品
              </div>
            </div>

            {loadingExhibits ? (
              <div className="py-12 text-center text-museum-brown-500">加载中...</div>
            ) : (
              <div className="grid max-h-[50vh] grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredExhibits.map((exhibit) => {
                  const isSelected = form.selectedExhibitIds.includes(exhibit.id);
                  const conditionConfig = getConditionLabel(exhibit.condition);
                  const isConflicting = conflictingExhibitIds.has(exhibit.id);
                  return (
                    <button
                      key={exhibit.id}
                      onClick={() => toggleExhibit(exhibit.id)}
                      className={cn(
                        'relative rounded-xl border-2 p-4 text-left transition-all',
                        isSelected
                          ? 'border-museum-gold-500 bg-museum-gold-50 shadow-gold'
                          : isConflicting
                          ? 'border-red-300 bg-red-50'
                          : 'border-museum-brown-100 bg-white hover:border-museum-brown-200 hover:shadow-museum'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-museum-gold-500 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-museum-brown-50">
                          <Archive className="h-6 w-6 text-museum-brown-500" />
                        </div>
                        <div className="min-w-0 flex-1 pr-6">
                          <p className="truncate font-medium text-museum-brown-900">{exhibit.name}</p>
                          <p className="mt-0.5 text-xs text-museum-brown-500">
                            {exhibit.era} · {getCategoryLabel(exhibit.category)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant={conditionConfig.variant}>{conditionConfig.label}</Badge>
                            {isConflicting && <Badge variant="danger">存在冲突</Badge>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold font-serif text-museum-brown-900">
                  冲突检测结果
                </h3>
                <p className="mt-1 text-sm text-museum-brown-500">
                  系统自动检测展厅和展品的时间冲突
                </p>
              </div>
              <button
                onClick={checkConflicts}
                disabled={checkingConflict}
                className="rounded-lg border border-museum-brown-200 bg-white px-4 py-2 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50 disabled:opacity-50"
              >
                {checkingConflict ? '检测中...' : '重新检测'}
              </button>
            </div>

            {checkingConflict ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-museum-gold-500 border-t-transparent" />
                <p className="mt-4 text-museum-brown-500">正在检测冲突...</p>
              </div>
            ) : conflictResult?.hasConflict ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-museum-crimson">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-museum-crimson">检测到 {conflictResult.conflicts.length} 项冲突</h4>
                    <p className="mt-1 text-sm text-red-700">
                      请返回上一步调整后重新检测，或评估是否可接受以下冲突
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {conflictResult.conflicts.map((conflict, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-red-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-museum-crimson">
                          {conflict.type === 'hall' ? (
                            <MapPin className="h-4 w-4" />
                          ) : conflict.type === 'exhibit' ? (
                            <Archive className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-museum-brown-900">
                            {conflict.type === 'hall'
                              ? '展厅冲突'
                              : conflict.type === 'exhibit'
                              ? '展品冲突'
                              : '时间冲突'}
                          </p>
                          <p className="mt-1 text-sm text-museum-brown-600">{conflict.message}</p>
                        </div>
                        <Badge variant="danger">冲突</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-museum-jade">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-museum-jade">未检测到冲突</h4>
                <p className="mt-2 text-sm text-museum-brown-500">
                  展厅和展品在选定时间段内均可用，可继续下一步
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-lg font-semibold font-serif text-museum-brown-900">
              方案预览
            </h3>

            <div className="rounded-xl border border-museum-brown-100 bg-museum-brown-50/50 p-5">
              <h4 className="font-semibold text-museum-brown-900">{form.title}</h4>
              {form.subtitle && <p className="mt-1 text-sm text-museum-brown-500">{form.subtitle}</p>}
              {form.description && (
                <p className="mt-3 text-sm text-museum-brown-600 leading-relaxed">
                  {form.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-museum-brown-100 bg-white p-4">
                <p className="text-xs font-medium text-museum-brown-500">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  展览时间
                </p>
                <p className="mt-1.5 text-sm font-medium text-museum-brown-800">
                  {form.startDate}
                </p>
                <p className="text-sm text-museum-brown-500">至 {form.endDate}</p>
              </div>
              <div className="rounded-lg border border-museum-brown-100 bg-white p-4">
                <p className="text-xs font-medium text-museum-brown-500">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  展厅
                </p>
                <p className="mt-1.5 text-sm font-medium text-museum-brown-800">
                  {form.hallName || '未选择'}
                </p>
              </div>
              <div className="rounded-lg border border-museum-brown-100 bg-white p-4">
                <p className="text-xs font-medium text-museum-brown-500">票价</p>
                <p className="mt-1.5 text-sm font-medium text-museum-brown-800">¥{form.ticketPrice}</p>
              </div>
              <div className="rounded-lg border border-museum-brown-100 bg-white p-4">
                <p className="text-xs font-medium text-museum-brown-500">单时段容量</p>
                <p className="mt-1.5 text-sm font-medium text-museum-brown-800">
                  {form.maxCapacityPerSlot} 人
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-museum-brown-700">
                已选展品（{selectedExhibits.length} 件）
              </p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {selectedExhibits.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-2 rounded-lg border border-museum-brown-100 bg-white p-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-museum-gold-100">
                      <Archive className="h-4 w-4 text-museum-gold-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-museum-brown-800">{ex.name}</p>
                      <p className="truncate text-xs text-museum-brown-500">{ex.era}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {conflictResult?.hasConflict && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-museum-crimson" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">存在未解决的冲突</p>
                  <p className="mt-0.5">
                    共 {conflictResult.conflicts.length} 项冲突，创建后展品将被强制锁定
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-museum-brown-100 pt-6">
          <button
            onClick={goToPrevStep}
            className="flex items-center gap-2 rounded-lg border border-museum-brown-200 bg-white px-5 py-2.5 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? '取消' : '上一步'}
          </button>
          {currentStep < 4 ? (
            <button
              onClick={goToNextStep}
              disabled={
                (currentStep === 1 && !validateStep1()) ||
                (currentStep === 2 && !validateStep2())
              }
              className="btn-gold flex items-center gap-2 disabled:opacity-50"
            >
              下一步
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold flex items-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {submitting ? '创建中...' : '确认创建并锁定展品'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
