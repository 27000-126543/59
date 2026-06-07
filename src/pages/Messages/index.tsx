import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Calendar,
  Ticket,
  Wrench,
  AlertTriangle,
  FileText,
  Settings,
  Bell,
  CheckCheck,
  ChevronRight,
  Clock,
} from 'lucide-react';
import Badge from '@/components/Common/Badge';
import { useMessageStore } from '@/store/messageStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

type MessageCategory =
  | 'all'
  | 'notification'
  | 'ticket'
  | 'workorder'
  | 'alert'
  | 'report'
  | 'system';

interface Message {
  id: string;
  type: MessageCategory;
  title: string;
  content: string;
  senderName: string;
  read: boolean;
  createdAt: string;
  relatedType?: string;
  relatedId?: string;
}

const categoryOptions: {
  key: MessageCategory;
  label: string;
  icon: typeof Inbox;
  variant: 'brown' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'default';
}[] = [
  { key: 'all', label: '全部消息', icon: Inbox, variant: 'brown' },
  { key: 'notification', label: '预约通知', icon: Calendar, variant: 'info' },
  { key: 'ticket', label: '调价提醒', icon: Ticket, variant: 'gold' },
  { key: 'workorder', label: '修复工单', icon: Wrench, variant: 'warning' },
  { key: 'alert', label: '安全预警', icon: AlertTriangle, variant: 'danger' },
  { key: 'report', label: '运营报告', icon: FileText, variant: 'success' },
  { key: 'system', label: '系统消息', icon: Settings, variant: 'default' },
];

const typeToCategory: Record<string, MessageCategory> = {
  notification: 'notification',
  ticket: 'ticket',
  work_order: 'workorder',
  workorder: 'workorder',
  alert: 'alert',
  system: 'system',
  approval: 'report',
  task: 'system',
};

const categoryToRoute: Record<string, string> = {
  notification: '/visitor/booking',
  ticket: '/visitor/ticket',
  workorder: '/curator/workorders',
  alert: '/security/alerts',
  report: '/director/reports',
  system: '/messages',
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}

function generateMockMessages(): Message[] {
  return [
    {
      id: 'msg-001',
      type: 'alert',
      title: '温湿度异常警报',
      content: '第二展厅书画展柜湿度波动超过阈值，当前湿度62%，请及时检查。',
      senderName: '系统监测',
      read: false,
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      relatedType: 'alert',
      relatedId: 'a002',
    },
    {
      id: 'msg-002',
      type: 'report',
      title: '新工单待审批',
      content: '赵安全提交了展厅空调系统维修工单，预算15,000元，请审批。',
      senderName: '赵安全',
      read: false,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      relatedType: 'workorder',
      relatedId: 'wo-001',
    },
    {
      id: 'msg-003',
      type: 'system',
      title: '巡检任务提醒',
      content: '您有一个待完成的巡检任务：第三展厅午间巡检，计划时间13:00。',
      senderName: '任务管理',
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      relatedType: 'system',
    },
    {
      id: 'msg-004',
      type: 'workorder',
      title: '保养计划即将到期',
      content: '钧窑玫瑰紫釉花盆的月度保养已逾期，请尽快安排。',
      senderName: '保养管理',
      read: false,
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      relatedType: 'workorder',
      relatedId: 'maintenance-006',
    },
    {
      id: 'msg-005',
      type: 'report',
      title: '月度报表已生成',
      content: '2026年5月博物馆运营报表已生成，请查收。',
      senderName: '系统',
      read: true,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      relatedType: 'report',
    },
    {
      id: 'msg-006',
      type: 'notification',
      title: '展览参观人数突破10万',
      content: '华夏文明五千年特展参观人数已突破10万人次，恭喜！',
      senderName: '数据统计',
      read: true,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      relatedType: 'notification',
      relatedId: 'exhibition-001',
    },
    {
      id: 'msg-007',
      type: 'workorder',
      title: '工单已完成',
      content: '第三展厅玻璃清洁工单已完成，实际花费750元。',
      senderName: '王保护',
      read: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      relatedType: 'workorder',
      relatedId: 'wo-005',
    },
    {
      id: 'msg-008',
      type: 'alert',
      title: '人流密度预警',
      content: '第五展厅当前人数156人，接近最大容量200人，请关注。',
      senderName: '人流监测',
      read: true,
      createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
      relatedType: 'alert',
    },
    {
      id: 'msg-009',
      type: 'report',
      title: '工单已通过审批',
      content: '您提交的展厅灯光调试工单已通过审批，可以开始执行。',
      senderName: '钱馆长',
      read: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      relatedType: 'workorder',
      relatedId: 'wo-006',
    },
    {
      id: 'msg-010',
      type: 'notification',
      title: '新用户反馈',
      content: '收到新的访客反馈，评分5星，建议增加更多互动体验项目。',
      senderName: '反馈系统',
      read: true,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      relatedType: 'notification',
    },
  ];
}

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    markRead,
    markAllRead,
    messages: storeMessages,
    fetchMessages,
    initWebSocketListeners,
    cleanupWebSocketListeners,
  } = useMessageStore();
  const [category, setCategory] = useState<MessageCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      initWebSocketListeners();
    }
    return () => {
      cleanupWebSocketListeners();
    };
  }, [user, fetchMessages, initWebSocketListeners, cleanupWebSocketListeners]);

  const messages: Message[] =
    storeMessages.length > 0
      ? storeMessages.map((m) => ({
          id: m.id,
          type: (typeToCategory[m.type] || typeToCategory[m.relatedType || ''] || 'system') as MessageCategory,
          title: m.title,
          content: m.content,
          senderName: m.senderName,
          read: m.read,
          createdAt: m.createdAt,
          relatedType: m.relatedType,
          relatedId: m.relatedId,
        }))
      : generateMockMessages();

  const unreadByCategory = categoryOptions.reduce(
    (acc, cat) => {
      if (cat.key === 'all') {
        acc[cat.key] = messages.filter((m) => !m.read).length;
      } else {
        acc[cat.key] = messages.filter((m) => m.type === cat.key && !m.read).length;
      }
      return acc;
    },
    {} as Record<MessageCategory, number>
  );

  const filteredMessages = messages.filter((m) => {
    if (category === 'all') return true;
    return m.type === category;
  });

  const handleExpand = async (message: Message) => {
    if (!message.read) {
      await markRead(message.id);
    }
    setExpandedId(expandedId === message.id ? null : message.id);
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllRead();
    }
  };

  const handleViewDetail = (message: Message) => {
    const route = categoryToRoute[message.type] || '/messages';
    navigate(route);
  };

  const getCategoryInfo = (type: MessageCategory) => {
    return categoryOptions.find((c) => c.key === type) || categoryOptions[0];
  };

  const hasUnread = messages.some((m) => !m.read);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
          消息中心
        </h1>
        <p className="mt-1 text-sm text-museum-brown-500">
          查看所有系统通知、业务提醒和预警消息
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-museum-brown-100 bg-white shadow-museum overflow-hidden">
            <div className="border-b border-museum-brown-100 p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-museum-gold-600" />
                <h2 className="font-semibold text-museum-brown-800">消息分类</h2>
              </div>
            </div>
            <div className="p-2">
              {categoryOptions.map((cat) => {
                const unreadCount = unreadByCategory[cat.key] || 0;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all',
                      category === cat.key
                        ? 'bg-museum-gold-50 text-museum-gold-700'
                        : 'text-museum-brown-600 hover:bg-museum-cream/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-museum-crimson px-1.5 text-xs font-medium text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-xl border border-museum-brown-100 bg-white shadow-museum overflow-hidden">
            <div className="flex items-center justify-between border-b border-museum-brown-100 p-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-museum-brown-800">
                  {categoryOptions.find((c) => c.key === category)?.label}
                </h2>
                <Badge variant="brown">共 {filteredMessages.length} 条</Badge>
              </div>
              <button
                onClick={handleMarkAllRead}
                disabled={!hasUnread}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all',
                  hasUnread
                    ? 'text-museum-gold-600 hover:bg-museum-gold-50'
                    : 'cursor-not-allowed text-museum-brown-300'
                )}
              >
                <CheckCheck className="h-4 w-4" />
                全部标为已读
              </button>
            </div>

            <div className="max-h-[700px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="py-20 text-center">
                  <Inbox className="mx-auto h-12 w-12 text-museum-brown-200" />
                  <p className="mt-3 text-museum-brown-400">暂无消息</p>
                </div>
              ) : (
                <div className="divide-y divide-museum-brown-50">
                  {filteredMessages.map((message) => {
                    const catInfo = getCategoryInfo(message.type);
                    const Icon = catInfo.icon;
                    const isExpanded = expandedId === message.id;
                    return (
                      <div
                        key={message.id}
                        onClick={() => handleExpand(message)}
                        className={cn(
                          'cursor-pointer transition-all duration-200',
                          !message.read && 'border-l-4 border-museum-gold-500 bg-museum-gold-50/30',
                          'hover:bg-museum-cream/50 hover:shadow-inner'
                        )}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                                message.read
                                  ? 'bg-museum-brown-100 text-museum-brown-400'
                                  : 'bg-museum-gold-100 text-museum-gold-600'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={catInfo.variant}>{catInfo.label}</Badge>
                                    {!message.read && (
                                      <span className="h-2 w-2 rounded-full bg-museum-gold-500 shadow-[0_0_0_3px_rgba(184,134,11,0.2)]" />
                                    )}
                                  </div>
                                  <h3
                                    className={cn(
                                      'mt-1.5 truncate font-medium',
                                      message.read
                                        ? 'text-museum-brown-600'
                                        : 'text-museum-brown-900'
                                    )}
                                  >
                                    {message.title}
                                  </h3>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-1 text-xs text-museum-brown-400">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(message.createdAt)}
                                </div>
                              </div>

                              <p
                                className={cn(
                                  'mt-1 line-clamp-1 text-sm',
                                  message.read
                                    ? 'text-museum-brown-400'
                                    : 'text-museum-brown-500'
                                )}
                              >
                                {message.content}
                              </p>

                              {isExpanded && (
                                <div className="mt-4 animate-fade-in">
                                  <div className="rounded-lg bg-museum-cream/60 p-4">
                                    <p className="text-sm text-museum-brown-700">
                                      {message.content}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                      <p className="text-xs text-museum-brown-400">
                                        发送者：{message.senderName}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewDetail(message);
                                        }}
                                        className="flex items-center gap-1 rounded-lg bg-museum-gold-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-museum-gold-600 shadow-gold"
                                      >
                                        查看详情
                                        <ChevronRight className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
