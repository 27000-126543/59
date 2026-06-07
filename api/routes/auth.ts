import { Router, type Request, type Response } from 'express';
import { users } from '../data/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

interface LoginRequest {
  username: string;
  password: string;
}

interface SafeUser extends Omit<User, 'password'> {}

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password }: LoginRequest = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: '用户名和密码不能为空',
    });
    return;
  }

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    res.status(401).json({
      success: false,
      error: '用户名或密码错误',
    });
    return;
  }

  const token = 'mock-token-' + user.id + '-' + Date.now();
  const { password: _pw, ...safeUser } = user;

  res.json({
    success: true,
    data: {
      token,
      user: safeUser as SafeUser,
    },
  });
});

router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: '登出成功',
  });
});

export default router;
