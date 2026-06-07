import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  MapPin,
  Archive,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Eye,
  Edit3,
  Users,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import Modal from '@/components/Common/Modal';
import { get } from '@/utils/request';
import type { Exhibition, Exhibit } from '@/types';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'ongoing' | 'draft' | 'ended';

export default function CuratorExhibitions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [exhibitionExhibits, setExhibitionExhibits] = useState<Exhibit[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'draft', label: '草稿' },
    { key: 'ended', label: '已结束' },
  ];

  useEffect(() => {
    loadExhibitions();
  }, [activeTab]);

  async function loadExhibitions() {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await get<Exhibition[]>(
        `/exhibitions${status ? `?status=${status}` : ''}`
      ).catch(() => null);

      if (data) {
        setExhibitions(data as Exhibition[]);
      } else {
        setExhibitions([
          {
            id: '1',
            title: '唐宋书画精品展',
            subtitle: '古代艺术珍品特展',
            description: '汇集唐宋时期名家书画真迹，展现中国古代书画艺术的巅峰成就。',
            startDate: '2026-05-01',
            endDate: '2026-08-31',
            location: '第一展厅',
            status: 'ongoing',
            maxCapacityPerSlot: 50,
            ticketPrice: 80,
            curatorId: 'cur1',
            visitorCount: 12500,
            targetVisitorCount: 20000,
            exhibitIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
            createdAt: '2026-04-01',
            updatedAt: '2026-06-01',
          },
          {
            id: '2',
            title: '丝路文明特展',
            subtitle: '东西方文化交流',
            description: '通过丝绸之路上的文物，展现古代东西方文明的交流与融合。',
            startDate: '2026-07-01',
            endDate: '2026-10-31',
            location: '第二展厅',
            status: 'upcoming',
            maxCapacityPerSlot: 60,
            ticketPrice: 100,
            curatorId: 'cur1',
            visitorCount: 0,
            targetVisitorCount: 30000,
            exhibitIds: ['e9', 'e10', 'e11', 'e12'],
            createdAt: '2026-05-15',
            updatedAt: '2026-06-05',
          },
          {
            id: '3',
            title: '明清瓷器展',
            subtitle: '官窑精品鉴赏',
            description: '',
            startDate: '2026-09-01',
            endDate: '2026-12-31',
            location: '第三展厅',
            status: 'draft',
            maxCapacityPerSlot: 40,
            ticketPrice: 60,
            curatorId: 'cur1',
            visitorCount: 0,
            targetVisitorCount: 15000,
            exhibitIds: [],
            createdAt: '2026-06-01',
            updatedAt: '2026-06-06',
          },
          {
            id: '4',
            title: '青铜器珍品展',
            subtitle: '商周青铜器艺术',
            description: '展示商周时期青铜器的精湛工艺和历史文化价值。',
            startDate: '2026-01-01',
            endDate: '2026-04-30',
            location: '第四展厅',
            status: 'ended',
            maxCapacityPerSlot: 45,
            ticketPrice: 70,
            curatorId: 'cur1',
            visitorCount: 28000,
            targetVisitorCount: 25000,
            exhibitIds: ['e20', 'e21', 'e22'],
            createdAt: '2025-12-01',
            updatedAt: '2026-04-30',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function openExhibitionDetail(exhibition: Exhibition) {
    setSelectedExhibition(exhibition);
    setDrawerOpen(true);
    try {
      const data = await get<Exhibit[]>(`/exhibitions/${exhibition.id}/exhibits`).catch(() => null);
      if (data) {
        setExhibitionExhibits(data as Exhibit[]);
      } else {
        setExhibitionExhibits([]);
      }
    } catch {
      setExhibitionExhibits([]);
    }
  }

  const getExhibitionStatusConfig = (status: Exhibition['status']) => {
    const map = {
      ongoing: { label: '进行中', variant: 'success' as const, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      upcoming: { label: '即将开始', variant: 'info' as const, icon: <Clock className="h-3.5 w-3.5" /> },
      ended: { label: '已结束', variant: 'default' as const, icon: <XCircle className="h-3.5 w-3.5" /> },
      draft: { label: '草稿', variant: 'warning' as const, icon: <AlertCircle className="h-3.5 w-3.5" /> },
    };
    return map[status];
  };

  const filteredExhibitions =
    activeTab === 'all'
      ? exhibitions
      : activeTab === 'ongoing'
      ? exhibitions.filter((e) => e.status === 'ongoing' || e.status === 'upcoming')
      : exhibitions.filter((e) => e.status === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-museum-brown-900">展览管理</h1>
          <p className="mt-1 text-sm text-museum-brown-500">管理所有展览的创建、编辑和上线</p>
        </div>
        <button
          onClick={() => navigate('/curator/exhibitions/create')}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          创建新展览
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
      ) : filteredExhibitions.length === 0 ? (
        <div className="py-16 text-center">
          <Archive className="mx-auto h-12 w-12 text-museum-brown-300" />
          <p className="mt-4 text-museum-brown-500">暂无展览数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredExhibitions.map((exhibition) => {
            const statusConfig = getExhibitionStatusConfig(exhibition.status);
            return (
              <div
                key={exhibition.id}
                className="museum-card overflow-hidden border border-museum-brown-100"
              >
                <div className="h-32 bg-gradient-to-br from-museum-gold-100 via-museum-gold-50 to-museum-brown-50 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-lg font-semibold font-serif text-museum-brown-900">
                        {exhibition.title}
                      </h3>
                      {exhibition.subtitle && (
                        <p className="mt-1 truncate text-sm text-museum-brown-500">
                          {exhibition.subtitle}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusConfig.variant}>
                      <span className="flex items-center gap-1">
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-sm text-museum-brown-600">
                    <Calendar className="h-4 w-4 text-museum-gold-600" />
                    <span>{exhibition.startDate} ~ {exhibition.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-museum-brown-600">
                    <MapPin className="h-4 w-4 text-museum-gold-600" />
                    <span>{exhibition.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-museum-brown-600">
                    <Archive className="h-4 w-4 text-museum-gold-600" />
                    <span>{exhibition.exhibitIds?.length || 0} 件展品</span>
                    <span className="mx-2 text-museum-brown-300">|</span>
                    <Users className="h-4 w-4 text-museum-gold-600" />
                    <span>{exhibition.visitorCount?.toLocaleString() || 0} 访客</span>
                  </div>
                  {exhibition.targetVisitorCount && exhibition.visitorCount !== undefined && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-museum-brown-500">
                        <span>访客目标</span>
                        <span>
                          {Math.round((exhibition.visitorCount / exhibition.targetVisitorCount) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-museum-brown-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-museum-gold-400 to-museum-gold-600 transition-all"
                          style={{
                            width: `${Math.min((exhibition.visitorCount / exhibition.targetVisitorCount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openExhibitionDetail(exhibition)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-museum-brown-200 bg-white px-3 py-2 text-sm font-medium text-museum-brown-700 transition-colors hover:bg-museum-brown-50"
                    >
                      <Eye className="h-4 w-4" />
                      查看详情
                    </button>
                    {exhibition.status === 'draft' && (
                      <button
                        onClick={() => navigate(`/curator/exhibitions/create?id=${exhibition.id}`)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-museum-gold-100 px-3 py-2 text-sm font-medium text-museum-gold-700 transition-colors hover:bg-museum-gold-200"
                      >
                        <Edit3 className="h-4 w-4" />
                        编辑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedExhibition?.title || '展览详情'}
        size="xl"
      >
        {selectedExhibition && (
          <div className="space-y-5">
            {selectedExhibition.subtitle && (
              <p className="text-museum-brown-500">{selectedExhibition.subtitle}</p>
            )}
            {selectedExhibition.description && (
              <div className="rounded-lg bg-museum-brown-50 p-4">
                <p className="text-sm text-museum-brown-700 leading-relaxed">
                  {selectedExhibition.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-museum-brown-500">展览时间</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {selectedExhibition.startDate} ~ {selectedExhibition.endDate}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">展览地点</p>
                <p className="mt-1 text-sm text-museum-brown-800">{selectedExhibition.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">票价</p>
                <p className="mt-1 text-sm text-museum-brown-800">¥{selectedExhibition.ticketPrice}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">单时段容量</p>
                <p className="mt-1 text-sm text-museum-brown-800">{selectedExhibition.maxCapacityPerSlot} 人</p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">展品数量</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {selectedExhibition.exhibitIds?.length || 0} 件
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-museum-brown-500">当前访客</p>
                <p className="mt-1 text-sm text-museum-brown-800">
                  {selectedExhibition.visitorCount?.toLocaleString() || 0} 人
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-museum-brown-500">展品列表</p>
              {exhibitionExhibits.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {exhibitionExhibits.map((exhibit) => (
                    <div
                      key={exhibit.id}
                      className="flex items-center gap-2 rounded-lg border border-museum-brown-100 bg-white p-2"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-museum-gold-100">
                        <Archive className="h-5 w-5 text-museum-gold-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-museum-brown-800">
                          {exhibit.name}
                        </p>
                        <p className="truncate text-xs text-museum-brown-500">
                          {exhibit.era || exhibit.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-museum-brown-400">暂无展品信息</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
