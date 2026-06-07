import { Router, type Request, type Response } from 'express';
import {
  tickets,
  exhibitions,
  ratings,
  halls,
  exhibits,
  workOrders,
} from '../data/mockData.js';

const router = Router();

router.get('/revenue', async (_req: Request, res: Response): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(today + 'T00:00:00Z').getTime();
  const weekAgo = todayStart - 6 * 24 * 60 * 60 * 1000;
  const monthAgo = todayStart - 29 * 24 * 60 * 60 * 1000;
  const lastWeekAgo = todayStart - 13 * 24 * 60 * 60 * 1000;
  const lastMonthAgo = todayStart - 59 * 24 * 60 * 60 * 1000;

  const todayRevenue = tickets
    .filter((t) => new Date(t.createdAt).getTime() >= todayStart)
    .reduce((sum, t) => sum + t.price, 0);

  const weekRevenue = tickets
    .filter((t) => new Date(t.createdAt).getTime() >= weekAgo)
    .reduce((sum, t) => sum + t.price, 0);

  const monthRevenue = tickets
    .filter((t) => new Date(t.createdAt).getTime() >= monthAgo)
    .reduce((sum, t) => sum + t.price, 0);

  const lastWeekRevenue = tickets
    .filter(
      (t) =>
        new Date(t.createdAt).getTime() >= lastWeekAgo &&
        new Date(t.createdAt).getTime() < weekAgo,
    )
    .reduce((sum, t) => sum + t.price, 0) || weekRevenue * 0.85;

  const lastMonthRevenue = tickets
    .filter(
      (t) =>
        new Date(t.createdAt).getTime() >= lastMonthAgo &&
        new Date(t.createdAt).getTime() < monthAgo,
    )
    .reduce((sum, t) => sum + t.price, 0) || monthRevenue * 0.78;

  const weekChange =
    lastWeekRevenue > 0
      ? Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : 15;

  const monthChange =
    lastMonthRevenue > 0
      ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 22;

  const dailyTrend: Array<{ date: string; revenue: number; ticketCount: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayTickets = tickets.filter(
      (t) => t.visitDate === dateStr,
    );
    const revenue = dayTickets.reduce((sum, t) => sum + t.price, 0);
    const baseRevenue = 3200 + Math.round(Math.sin(i) * 800) + i * 200;
    dailyTrend.push({
      date: dateStr,
      revenue: revenue || baseRevenue,
      ticketCount: dayTickets.length || Math.floor(baseRevenue / 80),
    });
  }

  res.json({
    success: true,
    data: {
      today: {
        revenue: todayRevenue || 4280,
        ticketCount: tickets.filter((t) => new Date(t.createdAt).getTime() >= todayStart).length || 53,
      },
      week: {
        revenue: weekRevenue || 28560,
        ticketCount: tickets.filter((t) => new Date(t.createdAt).getTime() >= weekAgo).length || 356,
        changePercent: weekChange,
      },
      month: {
        revenue: monthRevenue || 128450,
        ticketCount: tickets.filter((t) => new Date(t.createdAt).getTime() >= monthAgo).length || 1602,
        changePercent: monthChange,
      },
      dailyTrend,
    },
  });
});

router.get('/visitors', async (_req: Request, res: Response): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(today + 'T00:00:00Z').getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekAgo = todayStart - 6 * 24 * 60 * 60 * 1000;
  const lastWeekAgo = todayStart - 13 * 24 * 60 * 60 * 1000;

  const hourlyToday: Array<{ hour: string; count: number }> = [];
  const hourlyYesterday: Array<{ hour: string; count: number }> = [];

  for (let h = 9; h <= 20; h++) {
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;
    const baseToday = Math.round(30 + 50 * Math.sin((h - 9) / 5));
    const baseYesterday = Math.round(25 + 45 * Math.sin((h - 9) / 5));
    hourlyToday.push({ hour: hourLabel, count: baseToday + Math.floor(Math.random() * 15) });
    hourlyYesterday.push({ hour: hourLabel, count: baseYesterday + Math.floor(Math.random() * 15) });
  }

  const todayTotal = hourlyToday.reduce((s, d) => s + d.count, 0);
  const yesterdayTotal = hourlyYesterday.reduce((s, d) => s + d.count, 0);
  const dayChange = Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100);

  const weeklyTrend: Array<{ date: string; count: number; week: 'this' | 'last' }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const ld = new Date(lastWeekAgo + (6 - i) * 24 * 60 * 60 * 1000);
    const lastDateStr = ld.toISOString().split('T')[0];
    weeklyTrend.push({
      date: dateStr,
      count: 320 + Math.round(Math.sin(i) * 80) + Math.floor(Math.random() * 40),
      week: 'this',
    });
    weeklyTrend.push({
      date: lastDateStr,
      count: 280 + Math.round(Math.sin(i) * 60) + Math.floor(Math.random() * 40),
      week: 'last',
    });
  }

  const thisWeekTotal = weeklyTrend
    .filter((w) => w.week === 'this')
    .reduce((s, d) => s + d.count, 0);
  const lastWeekTotal = weeklyTrend
    .filter((w) => w.week === 'last')
    .reduce((s, d) => s + d.count, 0);
  const weekChange = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

  const totalCurrent = halls.reduce((sum, h) => sum + h.currentCount, 0);

  res.json({
    success: true,
    data: {
      today: {
        total: todayTotal,
        current: totalCurrent,
        changePercent: dayChange,
        hourly: hourlyToday,
      },
      yesterday: {
        total: yesterdayTotal,
        hourly: hourlyYesterday,
      },
      week: {
        thisWeekTotal,
        lastWeekTotal,
        changePercent: weekChange,
        trend: weeklyTrend,
      },
    },
  });
});

router.get('/exhibition-conversion', async (_req: Request, res: Response): Promise<void> => {
  const data = exhibitions.map((ex) => {
    const ratingCount = ratings.filter((r) => r.exhibitionId === ex.id).length;
    return {
      id: ex.id,
      title: ex.title,
      status: ex.status,
      visitorCount: ex.visitorCount,
      targetVisitorCount: ex.targetVisitorCount,
      rated: ratingCount,
      visitRate:
        ex.targetVisitorCount > 0
          ? Math.round((ex.visitorCount / ex.targetVisitorCount) * 100)
          : 0,
      ratingRate:
        ex.visitorCount > 0
          ? Math.round((ratingCount / ex.visitorCount) * 100)
          : 0,
    };
  });

  const totalBooked = data.reduce((s, d) => s + d.targetVisitorCount, 0);
  const totalVisited = data.reduce((s, d) => s + d.visitorCount, 0);
  const totalRated = data.reduce((s, d) => s + d.rated, 0);

  const funnel = [
    { stage: '目标参观', value: totalBooked, rate: 100 },
    {
      stage: '实际参观',
      value: totalVisited,
      rate: totalBooked > 0 ? Math.round((totalVisited / totalBooked) * 100) : 0,
    },
    {
      stage: '参与评分',
      value: totalRated,
      rate: totalVisited > 0 ? Math.round((totalRated / totalVisited) * 100) : 0,
    },
  ];

  res.json({
    success: true,
    data: {
      overall: funnel,
      exhibitions: data,
    },
  });
});

router.get('/satisfaction', async (_req: Request, res: Response): Promise<void> => {
  const hallScores = halls.map((hall) => {
    const hallRatings = ratings.filter((r) => r.hallId === hall.id);
    const avgScore =
      hallRatings.length > 0
        ? hallRatings.reduce((s, r) => s + r.score, 0) / hallRatings.length
        : 0;
    return {
      hallId: hall.id,
      hallName: hall.name,
      score: Math.round(avgScore * 10) / 10 || 4.3,
      ratingCount: hallRatings.length,
    };
  }).sort((a, b) => b.score - a.score);

  const exhibitionScores = exhibitions.map((ex) => {
    const exRatings = ratings.filter((r) => r.exhibitionId === ex.id);
    const avgScore =
      exRatings.length > 0
        ? exRatings.reduce((s, r) => s + r.score, 0) / exRatings.length
        : 0;
    return {
      exhibitionId: ex.id,
      exhibitionTitle: ex.title,
      score: Math.round(avgScore * 10) / 10 || 4.2,
      ratingCount: exRatings.length,
    };
  });

  const allComments = ratings.map((r) => r.comment).join(' ');
  const keywords = [
    { word: '精美', count: (allComments.match(/精美/g) || []).length + 15 },
    { word: '震撼', count: (allComments.match(/震撼/g) || []).length + 12 },
    { word: '专业', count: (allComments.match(/专业/g) || []).length + 10 },
    { word: '值得', count: (allComments.match(/值得/g) || []).length + 18 },
    { word: '教育', count: (allComments.match(/教育/g) || []).length + 8 },
    { word: '历史', count: (allComments.match(/历史/g) || []).length + 14 },
    { word: '文化', count: (allComments.match(/文化/g) || []).length + 11 },
    { word: '推荐', count: (allComments.match(/推荐/g) || []).length + 9 },
    { word: '讲解', count: (allComments.match(/讲解/g) || []).length + 7 },
    { word: '难忘', count: (allComments.match(/难忘/g) || []).length + 5 },
  ].sort((a, b) => b.count - a.count);

  const overallScore =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
      : 4.4;

  const scoreDistribution = [
    { score: 5, count: ratings.filter((r) => r.score === 5).length + 18 },
    { score: 4, count: ratings.filter((r) => r.score === 4).length + 12 },
    { score: 3, count: ratings.filter((r) => r.score === 3).length + 5 },
    { score: 2, count: ratings.filter((r) => r.score === 2).length + 2 },
    { score: 1, count: ratings.filter((r) => r.score === 1).length + 1 },
  ];

  res.json({
    success: true,
    data: {
      overallScore,
      totalRatings: ratings.length + 38,
      scoreDistribution,
      hallRanking: hallScores,
      exhibitionScores,
      wordCloud: keywords,
    },
  });
});

function getHeatScore(category: string): number {
  const baseScores: Record<string, number> = {
    bronze: 85,
    painting: 92,
    ceramic: 78,
    jade: 88,
    other: 70,
  };
  return baseScores[category] || 70;
}

router.get('/monthly-report', async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const totalRevenue = 128450;
  const totalTickets = 1602;
  const totalVisitors = 2358;
  const avgTicketPrice = Math.round((totalRevenue / totalTickets) * 100) / 100;

  const revenueChange = 12.5;
  const visitorChange = 8.3;

  const exhibitionStats = exhibitions.map((ex) => ({
    id: ex.id,
    title: ex.title,
    visitorCount: ex.visitorCount,
    targetVisitorCount: ex.targetVisitorCount,
    revenue: ex.visitorCount * 80,
  }));

  const topExhibits = exhibits
    .slice()
    .sort((a, b) => getHeatScore(b.category) - getHeatScore(a.category))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      heatScore: getHeatScore(e.category),
    }));

  const conservationStats = {
    totalInspections: 45,
    completedInspections: 38,
    pendingWorkOrders: workOrders.filter((w) => w.status === 'pending_approval').length,
    activeWorkOrders: workOrders.filter((w) => w.status === 'in_progress').length,
    completedWorkOrders: workOrders.filter((w) => w.status === 'completed').length,
  };

  const securityStats = {
    totalAlerts: 12,
    unresolvedAlerts: 3,
    avgDensity: 62,
    criticalCount: 1,
  };

  const satisfactionAvg = 4.4;

  res.json({
    success: true,
    data: {
      month: `${year}年${month + 1}月`,
      revenue: {
        total: totalRevenue,
        ticketCount: totalTickets,
        avgPrice: avgTicketPrice,
        changePercent: revenueChange,
      },
      visitors: {
        total: totalVisitors,
        changePercent: visitorChange,
      },
      exhibitions: exhibitionStats,
      topExhibits,
      conservation: conservationStats,
      security: securityStats,
      satisfaction: satisfactionAvg,
    },
  });
});

export default router;
