import { Router, type Request, type Response } from 'express';
import { tickets, exhibitions, exhibits, messages, users } from '../data/mockData.js';
import type { Ticket, Message } from '../../shared/types.js';
import { broadcastMessage } from '../websocket.js';

const router = Router();

const timeSlots = [
  '09:00-11:00',
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
  '19:00-21:00',
];

const categoryHeatScores: Record<string, number> = {
  bronze: 85,
  painting: 92,
  ceramic: 78,
  jade: 88,
  other: 70,
};

function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function hasSpecialExhibition(dateStr: string): boolean {
  const target = new Date(dateStr).getTime();
  return exhibitions.some((ex) => {
    if (!ex.isSpecial) return false;
    if (ex.status !== 'ongoing') return false;
    const start = new Date(ex.startDate).getTime();
    const end = new Date(ex.endDate).getTime();
    return target >= start && target <= end;
  });
}

function getActiveSpecialExhibitions(dateStr: string) {
  const target = new Date(dateStr).getTime();
  return exhibitions.filter((ex) => {
    if (!ex.isSpecial || ex.status !== 'ongoing') return false;
    const start = new Date(ex.startDate).getTime();
    const end = new Date(ex.endDate).getTime();
    return target >= start && target <= end;
  });
}

function getAverageHeatScoreByCategory(): number {
  if (exhibits.length === 0) return 70;
  const sum = exhibits.reduce((acc, e) => acc + (categoryHeatScores[e.category] || 70), 0);
  return sum / exhibits.length;
}

function getHistoricalFlowBySlot(slot: string): number {
  const slotTickets = tickets.filter((t) => t.timeSlot === slot && t.status !== 'cancelled');
  if (slotTickets.length === 0) {
    const baseFlows: Record<string, number> = {
      '09:00-11:00': 150,
      '11:00-13:00': 120,
      '13:00-15:00': 180,
      '15:00-17:00': 200,
      '17:00-19:00': 130,
      '19:00-21:00': 80,
    };
    return baseFlows[slot] || 100;
  }
  return slotTickets.length * 15 + Math.floor(Math.random() * 30);
}

function getRecommendationNote(
  avgFlow: number,
  isWeekendFlag: boolean,
  hasSpecial: boolean
): { recommended: boolean; note: string } {
  if (avgFlow < 100 && !isWeekendFlag) {
    return { recommended: true, note: '该时段人流较少，推荐参观' };
  }
  if (avgFlow < 130) {
    return { recommended: true, note: '该时段人流适中，参观体验较好' };
  }
  if (avgFlow > 200) {
    return { recommended: false, note: '该时段人流高峰，建议错峰参观' };
  }
  if (hasSpecial && avgFlow > 150) {
    return { recommended: false, note: '特展期间人流较多，请合理安排' };
  }
  return { recommended: false, note: '' };
}

router.get('/pricing', async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const weekend = isWeekend(targetDate);
  const hasSpecial = hasSpecialExhibition(targetDate);
  const specialExhibitions = getActiveSpecialExhibitions(targetDate);
  const avgHeat = getAverageHeatScoreByCategory();

  const slotPricing = timeSlots.map((slot) => {
    const avgFlow = getHistoricalFlowBySlot(slot);

    let basePrice = 80;
    let price = basePrice;

    if (weekend) price *= 1.15;
    if (hasSpecial) price *= 1.2;

    const heatFactor = avgHeat / 80;
    price *= heatFactor;

    if (avgFlow > 200) price *= 1.15;
    else if (avgFlow > 150) price *= 1.08;
    else if (avgFlow < 100) price *= 0.9;

    price = Math.round(price);
    const { recommended, note } = getRecommendationNote(avgFlow, weekend, hasSpecial);

    return {
      timeSlot: slot,
      basePrice,
      finalPrice: price,
      historicalAvgFlow: Math.round(avgFlow),
      remainingCapacity: Math.max(0, 300 - Math.round(avgFlow)),
      isWeekend: weekend,
      hasSpecialExhibition: hasSpecial,
      heatScore: Math.round(avgHeat),
      recommended,
      recommendationNote: note,
      heatLevel: avgFlow < 100 ? 'low' : avgFlow < 150 ? 'medium' : avgFlow < 200 ? 'high' : 'full',
    };
  });

  slotPricing.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.historicalAvgFlow - b.historicalAvgFlow;
  });

  res.json({
    success: true,
    data: {
      date: targetDate,
      isWeekend: weekend,
      hasSpecialExhibition: hasSpecial,
      specialExhibitions: specialExhibitions.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
      })),
      timeSlots: slotPricing,
    },
  });
});

interface BookRequest {
  visitorName: string;
  visitorPhone: string;
  visitDate: string;
  timeSlot: string;
  price: number;
  ticketType: 'adult' | 'child' | 'senior' | 'student';
}

router.post('/book', async (req: Request, res: Response): Promise<void> => {
  const { visitorName, visitorPhone, visitDate, timeSlot, price, ticketType }: BookRequest = req.body;

  if (!visitorName || !visitorPhone || !visitDate || !timeSlot || !price) {
    res.status(400).json({
      success: false,
      error: '缺少必要参数',
    });
    return;
  }

  const ticketNumber = 'TK' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  const newTicket: Ticket = {
    id: 'ticket-' + (tickets.length + 1),
    ticketNumber,
    visitorName,
    visitorPhone,
    visitDate,
    timeSlot,
    ticketType: ticketType || 'adult',
    price,
    status: 'booked',
    qrCode: ticketNumber,
    createdAt: new Date().toISOString(),
  };

  tickets.push(newTicket);

  const receiver = users.find((u) => u.name === visitorName);
  const receiverId = receiver?.id || 'user-001';
  const receiverName = receiver?.name || visitorName;

  const newMessage: Message = {
    id: 'msg-' + (messages.length + 1),
    type: 'notification',
    title: '门票预订成功',
    content: `您已成功预订 ${visitDate} ${timeSlot} 的门票，票号：${ticketNumber}`,
    senderId: 'system',
    senderName: '票务系统',
    receiverId,
    receiverName,
    read: false,
    createdAt: new Date().toISOString(),
    relatedType: 'ticket',
    priority: 'medium',
  };

  messages.push(newMessage);
  broadcastMessage(newMessage);

  res.json({
    success: true,
    data: {
      ticket: newTicket,
    },
  });
});

router.get('/my-tickets', async (req: Request, res: Response): Promise<void> => {
  const { visitorName } = req.query;

  if (!visitorName) {
    res.status(400).json({
      success: false,
      error: '缺少访客姓名',
    });
    return;
  }

  const userTickets = tickets
    .filter((t) => t.visitorName === visitorName)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    data: userTickets,
  });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const ticket = tickets.find((t) => t.id === id || t.ticketNumber === id);

  if (!ticket) {
    res.status(404).json({
      success: false,
      error: '门票不存在',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      ...ticket,
    },
  });
});

export default router;
