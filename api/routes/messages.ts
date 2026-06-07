import { Router, type Request, type Response } from 'express';
import { messages } from '../data/mockData.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { receiverId, type } = req.query;

  if (!receiverId) {
    res.status(400).json({
      success: false,
      error: '缺少用户ID',
    });
    return;
  }

  let userMessages = messages.filter((m) => m.receiverId === receiverId);

  if (type) {
    userMessages = userMessages.filter((m) => m.type === type);
  }

  userMessages = userMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  res.json({
    success: true,
    data: {
      total: userMessages.length,
      unread: userMessages.filter((m) => !m.read).length,
      list: userMessages,
    },
  });
});

router.get('/unread', async (req: Request, res: Response): Promise<void> => {
  const { receiverId } = req.query;

  if (!receiverId) {
    res.status(400).json({
      success: false,
      error: '缺少用户ID',
    });
    return;
  }

  const count = messages.filter((m) => m.receiverId === receiverId && !m.read).length;

  res.json({
    success: true,
    data: {
      count,
    },
  });
});

router.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const message = messages.find((m) => m.id === id);

  if (!message) {
    res.status(404).json({
      success: false,
      error: '消息不存在',
    });
    return;
  }

  message.read = true;

  res.json({
    success: true,
    data: message,
  });
});

router.put('/read-all', async (req: Request, res: Response): Promise<void> => {
  const { receiverId } = req.body as { receiverId?: string };

  if (!receiverId) {
    res.status(400).json({
      success: false,
      error: '缺少用户ID',
    });
    return;
  }

  let updated = 0;
  messages.forEach((m) => {
    if (m.receiverId === receiverId && !m.read) {
      m.read = true;
      updated++;
    }
  });

  const remaining = messages.filter((m) => m.receiverId === receiverId && !m.read).length;

  res.json({
    success: true,
    data: {
      updatedCount: updated,
      remainingUnread: remaining,
    },
  });
});

export default router;
