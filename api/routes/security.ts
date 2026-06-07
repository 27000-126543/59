import { Router, type Request, type Response } from 'express';
import { halls, alerts, type Alert } from '../data/mockData.js';

const router = Router();

type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

function getDensityLevel(percentage: number): DensityLevel {
  if (percentage < 0.5) return 'low';
  if (percentage < 0.7) return 'medium';
  if (percentage < 0.9) return 'high';
  return 'critical';
}

router.get('/flow', async (_req: Request, res: Response): Promise<void> => {
  const flowData = halls.map((hall) => {
    const percentage = hall.currentCount / hall.maxCapacity;
    return {
      ...hall,
      occupancyRate: Math.round(percentage * 100),
      densityLevel: getDensityLevel(percentage),
    };
  });

  const totalCurrent = halls.reduce((sum, h) => sum + h.currentCount, 0);
  const totalMax = halls.reduce((sum, h) => sum + h.maxCapacity, 0);
  const overallPercentage = totalCurrent / totalMax;

  res.json({
    success: true,
    data: {
      totalCurrent,
      totalMax,
      overallOccupancy: Math.round(overallPercentage * 100),
      overallDensityLevel: getDensityLevel(overallPercentage),
      halls: flowData,
    },
  });
});

interface SetCapacityRequest {
  maxCapacity: number;
}

router.put('/halls/:id/capacity', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { maxCapacity }: SetCapacityRequest = req.body;

  if (!maxCapacity || maxCapacity <= 0) {
    res.status(400).json({
      success: false,
      error: '容量值无效',
    });
    return;
  }

  const hall = halls.find((h) => h.id === id);

  if (!hall) {
    res.status(404).json({
      success: false,
      error: '展厅不存在',
    });
    return;
  }

  hall.maxCapacity = maxCapacity;

  const percentage = hall.currentCount / hall.maxCapacity;
  res.json({
    success: true,
    data: {
      ...hall,
      occupancyRate: Math.round(percentage * 100),
      densityLevel: getDensityLevel(percentage),
    },
  });
});

router.get('/alerts', async (_req: Request, res: Response): Promise<void> => {
  const list = alerts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((alert) => {
      const hall = halls.find((h) => h.id === alert.hallId);
      return {
        ...alert,
        hallName: hall?.name || '',
      };
    });

  res.json({
    success: true,
    data: {
      total: alerts.length,
      unresolved: alerts.filter((a) => !a.resolved).length,
      list,
    },
  });
});

router.post('/alerts/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { resolvedBy } = req.body as { resolvedBy?: string };

  const alert = alerts.find((a) => a.id === id);

  if (!alert) {
    res.status(404).json({
      success: false,
      error: '预警不存在',
    });
    return;
  }

  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();

  const hall = halls.find((h) => h.id === alert.hallId);
  res.json({
    success: true,
    data: {
      ...alert,
      hallName: hall?.name || '',
      resolvedBy: resolvedBy || null,
    },
  });
});

interface LimitFlowRequest {
  reduceBy?: number;
  temporaryMax?: number;
}

router.put('/halls/:id/limit-flow', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reduceBy, temporaryMax }: LimitFlowRequest = req.body;

  const hall = halls.find((h) => h.id === id);

  if (!hall) {
    res.status(404).json({
      success: false,
      error: '展厅不存在',
    });
    return;
  }

  const originalMax = hall.maxCapacity;
  let newMax: number;

  if (temporaryMax) {
    newMax = Math.max(1, temporaryMax);
  } else if (reduceBy) {
    newMax = Math.max(1, hall.maxCapacity - reduceBy);
  } else {
    newMax = Math.floor(hall.maxCapacity * 0.7);
  }

  newMax = Math.min(newMax, hall.maxCapacity);

  if (hall.currentCount > newMax) {
    const newAlert: Alert = {
      id: 'a' + (alerts.length + 1),
      hallId: id,
      type: 'overcrowding',
      level: 'critical',
      message: `展厅 ${hall.name} 限流启动，当前人数 ${hall.currentCount} 超过临时容量 ${newMax}`,
      resolved: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    alerts.push(newAlert);
  }

  const percentage = hall.currentCount / newMax;

  res.json({
    success: true,
    data: {
      ...hall,
      originalMaxCapacity: originalMax,
      temporaryMaxCapacity: newMax,
      isFlowLimited: true,
      occupancyRate: Math.round(percentage * 100),
      densityLevel: getDensityLevel(percentage),
    },
  });
});

export default router;
