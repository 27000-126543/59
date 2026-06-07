import { Router, type Request, type Response } from 'express';
import { tickets, messages, exhibitions, exhibits, users } from '../data/mockData.js';
import type { Ticket, Message } from '../../shared/types.js';

const router = Router();

const timeSlots = [
  '09:00-11:00',
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
  '19:00-21:00',
];

const historicalFlow: Record<string, number[]> = {
  '09:00-11:00': [120, 180, 220, 190, 210],
  '11:00-13:00': [90, 140, 170, 160, 150],
  '13:00-15:00': [150, 200, 260, 240, 230],
  '15:00-17:00': [180, 230, 290, 270, 280],
  '17:00-19:00': [100, 160, 200, 180, 170],
  '19:00-21:00': [60, 110, 150, 130, 120],
};

function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function hasSpecialExhibition(_dateStr: string): boolean {
  return false;
}

function getAverageHeatScore(): number {
  if (exhibits.length === 0) return 70;
  const baseScores: Record<string, number> = {
    bronze: 85,
    painting: 90,
    ceramic: 80,
    jade: 88,
    other: 70,
  };
  const sum = exhibits.reduce((acc, e) => acc + (baseScores[e.category] || 70), 0);
  return sum / exhibits.length;
}

router.get('/pricing', async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const weekend = isWeekend(targetDate);
  const hasSpecial = hasSpecialExhibition(targetDate);
  const avgHeat = getAverageHeatScore();

  const pricing = timeSlots.map((slot) => {
    const flowData = historicalFlow[slot] || [100, 100, 100, 100, 100];
    const avgFlow = flowData.reduce((a, b) => a + b, 0) / flowData.length;

    let price = 80;

    if (weekend) price *= 1.15;
    if (hasSpecial) price *= 1.2;

    const heatFactor = avgHeat / 80;
    price *= heatFactor;

    if (avgFlow > 200) price *= 1.15;
    else if (avgFlow > 150) price *= 1.08;
    else if (avgFlow < 100) price *= 0.9;

    price = Math.round(price);

    return {
      timeSlot: slot,
      basePrice: 80,
      finalPrice: price,
      historicalAvgFlow: Math.round(avgFlow),
      isWeekend: weekend,
      hasSpecialExhibition: hasSpecial,
      heatScore: Math.round(avgHeat),
    };
  });

  res.json({
    success: true,
    data: {
      date: targetDate,
      timeSlots: pricing,
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
