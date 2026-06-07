export type UserRole =
  | 'visitor'
  | 'curator'
  | 'conservator'
  | 'security'
  | 'director';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  realName?: string;
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  exhibitionId: string;
  timeSlotId: string;
  ticketType: 'adult' | 'child' | 'senior' | 'student';
  price: number;
  status: 'reserved' | 'paid' | 'used' | 'cancelled' | 'refunded' | 'booked' | 'expired';
  qrCode?: string;
  reservedAt: string;
  paidAt?: string;
  usedAt?: string;
  ticketNumber?: string;
  visitorName?: string;
  visitorPhone?: string;
  visitDate?: string;
  timeSlot?: string;
  createdAt?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBooked: number;
  date: string;
  exhibitionId: string;
  capacity: number;
  bookedCount: number;
  status: 'available' | 'limited' | 'full' | 'closed';
}

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

export interface BookResponse {
  success: boolean;
  orderId: string;
  tickets: Ticket[];
  totalPrice: number;
  message?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  location: string;
  curatorId?: string;
  hallId?: string;
  status: 'upcoming' | 'ongoing' | 'ended' | 'draft';
  maxCapacityPerSlot: number;
  ticketPrice: number;
  exhibitIds?: string[];
  visitorCount?: number;
  targetVisitorCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exhibit {
  id: string;
  name: string;
  dynasty?: string;
  era?: string;
  category?: 'bronze' | 'painting' | 'ceramic' | 'jade' | 'other';
  description?: string;
  imageUrl?: string;
  location: string;
  hallId?: string;
  exhibitionId?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'restoring';
  lastInspectedAt?: string;
  lastInspectionDate?: string;
  acquisitionDate?: string;
  exhibitionHistory?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: {
    type: 'hall' | 'exhibit' | 'time';
    message: string;
    conflictingIds: string[];
  }[];
}

export interface Inspection {
  id: string;
  exhibitId: string;
  conservatorId: string;
  scheduledAt: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  photos?: string[];
  temperature?: number;
  humidity?: number;
  title?: string;
  description?: string;
  inspectorId?: string;
  inspectorName?: string;
  hallId?: string;
  hallName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  items?: {
    id: string;
    name: string;
    description: string;
    status: 'normal' | 'abnormal' | 'unchecked';
    remark?: string;
  }[];
  remark?: string;
}

export interface MaintenancePlan {
  id: string;
  exhibitId: string;
  exhibitName?: string;
  title: string;
  description?: string;
  type: 'routine' | 'repair' | 'restoration' | 'special';
  planType?: 'cleaning' | 'restoration' | 'environmental' | 'structural';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  conservatorId?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'suspended' | 'scheduled' | 'overdue';
  progress?: number;
  notes?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  costEstimate?: number;
  createdAt?: string;
}

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  type: 'repair' | 'installation' | 'inspection' | 'move' | 'other' | 'maintenance';
  priority: WorkOrderPriority;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'pending_approval';
  requesterId: string;
  requesterName?: string;
  approverId?: string;
  assigneeId?: string;
  assigneeName?: string;
  exhibitId?: string;
  exhibitName?: string;
  hallId?: string;
  hallName?: string;
  approvedAt?: string;
  completedAt?: string;
  rejectReason?: string;
  estimatedCost?: number;
  actualCost?: number;
  remark?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HallFlow {
  id: string;
  hallId: string;
  hallName: string;
  timestamp: string;
  currentCount: number;
  maxCapacity: number;
  enterCount: number;
  exitCount: number;
  status: 'normal' | 'crowded' | 'full';
  densityLevel?: 'low' | 'medium' | 'high' | 'critical';
  averageStayMinutes?: number;
  entryCountToday?: number;
  exitCountToday?: number;
  lastUpdated?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'intrusion' | 'fire' | 'temperature' | 'humidity' | 'equipment' | 'other' | 'crowd';
  severity: 'low' | 'medium' | 'high' | 'critical';
  level?: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  message: string;
  title?: string;
  description?: string;
  hallId?: string;
  hallName?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
  acknowledgedBy?: string;
  resolvedBy?: string;
  handledBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  reportedAt?: string;
  resolution?: string;
  resolutionNote?: string;
  createdAt?: string;
}

export type MessageType = 'system' | 'notification' | 'ticket' | 'workorder' | 'alert' | 'feedback' | 'approval' | 'task';

export interface Message {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  senderId?: string;
  senderName?: string;
  receiverId?: string;
  receiverName?: string;
  relatedId?: string;
  relatedType?: 'work_order' | 'inspection' | 'maintenance' | 'exhibition' | 'security_alert' | 'ticket';
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  readAt?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Feedback {
  id: string;
  userId: string;
  visitorId?: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  exhibitionId?: string;
  exhibitionTitle?: string;
  rating: number;
  category?: 'general' | 'exhibition' | 'service' | 'facility' | 'ticketing' | 'other';
  comment?: string;
  tags?: string[];
  status: 'pending' | 'reviewed' | 'replied' | 'resolved';
  reply?: string;
  replyContent?: string;
  repliedBy?: string;
  repliedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenueData {
  date: string;
  ticketRevenue: number;
  merchandiseRevenue: number;
  donationRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  visitorCount: number;
}

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

export interface LoginRequest {
  role: UserRole;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
