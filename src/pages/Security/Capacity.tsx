import { useEffect, useState } from 'react';
import { Save, Users, RefreshCw, Check } from 'lucide-react';
import Badge from '@/components/Common/Badge';
import { get, put } from '@/utils/request';
import { cn } from '@/lib/utils';

interface Hall {
  id: string;
  name: string;
  currentCount: number;
  maxCapacity: number;
  occupancyRate: number;
  densityLevel: 'normal' | 'warning' | 'critical';
}

const densityColorMap = {
  normal: {
    text: 'text-museum-jade',
    bar: 'bg-museum-jade',
    label: '正常',
    variant: 'success' as const,
  },
  warning: {
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    label: '人流较多',
    variant: 'warning' as const,
  },
  critical: {
    text: 'text-museum-crimson',
    bar: 'bg-museum-crimson',
    label: '拥挤',
    variant: 'danger' as const,
  },
};

export default function Capacity() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [editingCapacities, setEditingCapacities] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const data = await get<{ halls: Hall[] }>('/security/flow');
      setHalls(data.halls);
      const capacities: Record<string, number> = {};
      data.halls.forEach((h) => {
        capacities[h.id] = h.maxCapacity;
      });
      setEditingCapacities(capacities);
    } catch (error) {
      console.error('获取展厅数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityChange = (hallId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditingCapacities((prev) => ({
        ...prev,
        [hallId]: numValue,
      }));
    }
  };

  const handleSave = async (hallId: string) => {
    const newCapacity = editingCapacities[hallId];
    if (!newCapacity || newCapacity <= 0) return;

    setSavingId(hallId);
    try {
      const updatedHall = await put<Hall>(`/security/halls/${hallId}/capacity`, {
        maxCapacity: newCapacity,
      });
      setHalls((prev) =>
        prev.map((h) => (h.id === hallId ? updatedHall : h))
      );
      setSavedId(hallId);
      setTimeout(() => setSavedId(null), 2000);
    } catch (error) {
      console.error('保存容量失败:', error);
    } finally {
      setSavingId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
            容量设置
          </h1>
          <p className="mt-1 text-sm text-museum-brown-500">
            配置各展厅最大容纳人数，调整后实时生效
          </p>
        </div>
        <button
          onClick={fetchHalls}
          className="flex items-center gap-2 rounded-lg border border-museum-brown-200 px-4 py-2 text-sm text-museum-brown-600 transition-colors hover:bg-museum-cream"
        >
          <RefreshCw className="h-4 w-4" />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => {
          const colors = densityColorMap[hall.densityLevel];
          const editingValue = editingCapacities[hall.id] ?? hall.maxCapacity;
          const isDirty = editingValue !== hall.maxCapacity;
          const isSaving = savingId === hall.id;
          const isSaved = savedId === hall.id;

          return (
            <div
              key={hall.id}
              className="rounded-xl border border-museum-brown-100 bg-white p-6 shadow-museum transition-all hover:shadow-museum-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-museum-brown-800">
                    {hall.name}
                  </h3>
                  <Badge variant={colors.variant}>{colors.label}</Badge>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-museum-gold-50 text-museum-gold-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-museum-brown-400">当前人数</p>
                    <p className={cn('text-3xl font-bold', colors.text)}>
                      {hall.currentCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-museum-brown-400">使用率</p>
                    <p className="text-xl font-semibold text-museum-brown-700">
                      {hall.occupancyRate}%
                    </p>
                  </div>
                </div>

                <div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-museum-brown-100">
                    <div
                      className={cn('h-full rounded-full transition-all', colors.bar)}
                      style={{ width: `${Math.min(hall.occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-museum-brown-600">
                    最大容量（人）
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={hall.currentCount}
                      value={editingValue}
                      onChange={(e) => handleCapacityChange(hall.id, e.target.value)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                        isDirty
                          ? 'border-museum-gold-400 focus:border-museum-gold-500 focus:ring-2 focus:ring-museum-gold-100'
                          : 'border-museum-brown-200 focus:border-museum-brown-400 focus:ring-2 focus:ring-museum-brown-100'
                      )}
                    />
                    <button
                      onClick={() => handleSave(hall.id)}
                      disabled={!isDirty || isSaving}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                        isSaved
                          ? 'bg-museum-jade text-white'
                          : !isDirty || isSaving
                          ? 'cursor-not-allowed bg-museum-brown-100 text-museum-brown-400'
                          : 'bg-museum-gold-500 text-white hover:bg-museum-gold-600 shadow-gold hover:shadow-gold-hover'
                      )}
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : isSaved ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaved ? '已保存' : '保存'}
                    </button>
                  </div>
                  {editingValue < hall.currentCount && (
                    <p className="mt-1.5 text-xs text-museum-crimson">
                      警告：最大容量不能低于当前人数
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
