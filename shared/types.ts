// 用户角色枚举类型
export type UserRole = 'visitor' | 'curator' | 'conservator' | 'security' | 'director';

// 用户接口
export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  password?: string;
}

// 门票接口
export interface Ticket {
  id: string;
  ticketNumber: string;
  visitorName: string;
  visitorPhone: string;
  visitDate: string;
  timeSlot: string;
  ticketType: 'adult' | 'child' | 'senior' | 'student';
  price: number;
  status: 'booked' | 'used' | 'cancelled' | 'expired';
  qrCode: string;
  createdAt: string;
}

// 时间段接口
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBooked: number;
  date: string;
}

// 票价响应接口
export interface PricingResponse {
  adult: number;
  child: number;
  senior: number;
  student: number;
  groupDiscount: {
    minCount: number;
    discountRate: number;
  };
}

// 预订请求接口
export interface BookRequest {
  visitorName: string;
  visitorPhone: string;
  visitDate: string;
  timeSlotId: string;
  tickets: {
    type: 'adult' | 'child' | 'senior' | 'student';
    count: number;
  }[];
}

// 预订响应接口
export interface BookResponse {
  success: boolean;
  orderId: string;
  tickets: Ticket[];
  totalPrice: number;
  message?: string;
}

// 展览接口
export interface Exhibition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'ended' | 'draft';
  hallId: string;
  curatorId: string;
  exhibitIds: string[];
  visitorCount: number;
  targetVisitorCount: number;
  isSpecial?: boolean;
  createdAt: string;
}

// 展品接口
export interface Exhibit {
  id: string;
  name: string;
  era: string;
  category: 'bronze' | 'painting' | 'ceramic' | 'jade' | 'other';
  description: string;
  imageUrl: string;
  location: string;
  hallId: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  acquisitionDate: string;
  lastInspectionDate: string;
  exhibitionHistory: string[];
}

// 冲突检查响应接口
export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: {
    type: 'hall' | 'exhibit' | 'time';
    message: string;
    conflictingIds: string[];
  }[];
}

// 巡检接口
export interface Inspection {
  id: string;
  title: string;
  description: string;
  inspectorId: string;
  inspectorName: string;
  hallId: string;
  hallName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  items: {
    id: string;
    name: string;
    description: string;
    status: 'normal' | 'abnormal' | 'unchecked';
    remark?: string;
  }[];
  completedAt?: string;
  remark?: string;
}

// 保养计划接口
export interface MaintenancePlan {
  id: string;
  exhibitId: string;
  exhibitName: string;
  planType: 'cleaning' | 'restoration' | 'environmental' | 'structural';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  costEstimate?: number;
}

// 工单优先级
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

// 工单接口
export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'repair' | 'installation' | 'inspection' | 'other';
  priority: WorkOrderPriority;
  status: 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  requesterId: string;
  requesterName: string;
  assigneeId?: string;
  assigneeName?: string;
  hallId?: string;
  hallName?: string;
  exhibitId?: string;
  exhibitName?: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
  remark?: string;
  attachments?: string[];
}

// 展厅人流接口
export interface HallFlow {
  id: string;
  hallId: string;
  hallName: string;
  currentCount: number;
  maxCapacity: number;
  densityLevel: DensityLevel;
  averageStayMinutes: number;
  entryCountToday: number;
  exitCountToday: number;
  lastUpdated: string;
}

// 密度等级
export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

// 安全警报接口
export interface SecurityAlert {
  id: string;
  type: 'fire' | 'intrusion' | 'crowd' | 'equipment' | 'other';
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  hallId?: string;
  hallName?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  reportedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  handledBy?: string;
  resolutionNote?: string;
}

// 收入数据接口
export interface RevenueData {
  date: string;
  ticketRevenue: number;
  merchandiseRevenue: number;
  donationRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  visitorCount: number;
}

// 访客统计接口
export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  averageDailyVisitors: number;
  peakHourVisitors: number;
  visitorTypeBreakdown: {
    type: 'adult' | 'child' | 'senior' | 'student';
    count: number;
    percentage: number;
  }[];
}

// 展览转化率接口
export interface ExhibitionConversion {
  exhibitionId: string;
  exhibitionTitle: string;
  totalViews: number;
  ticketClicks: number;
  bookings: number;
  completedVisits: number;
  viewToClickRate: number;
  clickToBookRate: number;
  bookToVisitRate: number;
  overallConversionRate: number;
}

// 满意度数据接口
export interface SatisfactionData {
  id: string;
  surveyId: string;
  overallRating: number;
  exhibitionRating: number;
  serviceRating: number;
  facilityRating: number;
  recommendationScore: number;
  totalResponses: number;
  ratingDistribution: {
    rating: 1 | 2 | 3 | 4 | 5;
    count: number;
    percentage: number;
  }[];
  topComments: string[];
  areasForImprovement: string[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// 月度报表接口
export interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  visitorStats: VisitorStats;
  revenueData: RevenueData;
  exhibitionConversions: ExhibitionConversion[];
  satisfactionData: SatisfactionData;
  maintenanceCompleted: number;
  inspectionsCompleted: number;
  securityAlerts: number;
  workOrdersResolved: number;
  keyHighlights: string[];
  challenges: string[];
  nextMonthGoals: string[];
  generatedAt: string;
}

// 消息类型
export type MessageType = 'system' | 'notification' | 'alert' | 'approval' | 'task';

// 消息接口
export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  relatedType?: 'work_order' | 'inspection' | 'maintenance' | 'exhibition' | 'security_alert' | 'ticket';
  relatedId?: string;
  priority?: 'low' | 'medium' | 'high';
}

// 反馈接口
export interface Feedback {
  id: string;
  visitorId?: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  category: 'general' | 'exhibition' | 'service' | 'facility' | 'ticketing' | 'other';
  title: string;
  content: string;
  exhibitionId?: string;
  exhibitionTitle?: string;
  status: 'pending' | 'reviewed' | 'replied' | 'resolved';
  createdAt: string;
  reviewedAt?: string;
  repliedAt?: string;
  replyContent?: string;
  repliedBy?: string;
  tags?: string[];
}
