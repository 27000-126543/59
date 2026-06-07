import { Router, type Request, type Response } from 'express';
import { exhibitions, exhibits, users } from '../data/mockData.js';
import type { Exhibition } from '../../shared/types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: exhibitions,
  });
});

interface CheckConflictRequest {
  exhibitIds: string[];
  startDate: string;
  endDate: string;
}

router.post('/check-conflict', async (req: Request, res: Response): Promise<void> => {
  const { exhibitIds, startDate, endDate }: CheckConflictRequest = req.body;

  if (!exhibitIds || !startDate || !endDate) {
    res.status(400).json({
      success: false,
      error: '缺少必要参数',
    });
    return;
  }

  const conflicts: Array<{
    exhibitId: string;
    exhibitName: string;
    conflictExhibition: {
      id: string;
      title: string;
      startDate: string;
      endDate: string;
    };
  }> = [];

  exhibitIds.forEach((exhibitId) => {
    const exhibit = exhibits.find((e) => e.id === exhibitId);
    if (!exhibit) return;

    exhibitions.forEach((ex) => {
      const hasExhibit = ex.exhibitIds.includes(exhibitId);
      if (!hasExhibit) return;

      const dateConflict =
        (startDate >= ex.startDate && startDate <= ex.endDate) ||
        (endDate >= ex.startDate && endDate <= ex.endDate) ||
        (startDate <= ex.startDate && endDate >= ex.endDate);

      if (dateConflict) {
        conflicts.push({
          exhibitId,
          exhibitName: exhibit.name,
          conflictExhibition: {
            id: ex.id,
            title: ex.title,
            startDate: ex.startDate,
            endDate: ex.endDate,
          },
        });
      }
    });
  });

  res.json({
    success: true,
    data: {
      hasConflict: conflicts.length > 0,
      conflicts,
    },
  });
});

interface CreateExhibitionRequest {
  title: string;
  subtitle?: string;
  description: string;
  startDate: string;
  endDate: string;
  hallId: string;
  exhibitIds: string[];
  coverImage?: string;
  curatorId?: string;
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    subtitle,
    description,
    startDate,
    endDate,
    hallId,
    exhibitIds,
    coverImage,
    curatorId,
  }: CreateExhibitionRequest = req.body;

  if (!title || !description || !startDate || !endDate || !hallId || !exhibitIds?.length) {
      res.status(400).json({
        success: false,
        error: '缺少必要参数',
      });
      return;
    }

  const curators = users.filter((u) => u.role === 'curator');
  const today = new Date().toISOString().split('T')[0];
  let status: Exhibition['status'] = 'upcoming';
  if (startDate <= today && today <= endDate) status = 'ongoing';
  if (today > endDate) status = 'ended';

  const newExhibition: Exhibition = {
    id: 'exhibition-' + (exhibitions.length + 1),
    title,
    subtitle: subtitle || '',
    description,
    coverImage: coverImage || `https://picsum.photos/800/400?random=${Date.now()}`,
    startDate,
    endDate,
    status,
    hallId,
    curatorId: curatorId || (curators.length > 0 ? curators[0].id : 'user-002'),
    exhibitIds,
    visitorCount: 0,
    targetVisitorCount: 100000,
    createdAt: new Date().toISOString(),
  };

  exhibitions.push(newExhibition);

  res.json({
    success: true,
    data: newExhibition,
  });
});

router.get('/exhibits', async (_req: Request, res: Response): Promise<void> => {
  const list = exhibits.map((ex) => {
    const exhibition = exhibitions.find((e) => e.exhibitIds.includes(ex.id));
    return {
      ...ex,
      exhibitionTitle: exhibition?.title || null,
    };
  });

  res.json({
    success: true,
    data: list,
  });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const exhibition = exhibitions.find((e) => e.id === id);

  if (!exhibition) {
    res.status(404).json({
      success: false,
      error: '展览不存在',
    });
    return;
  }

  const exhibitionExhibits = exhibits.filter((e) =>
    exhibition.exhibitIds.includes(e.id),
  );

  res.json({
    success: true,
    data: {
      ...exhibition,
      exhibits: exhibitionExhibits,
    },
  });
});

export default router;
