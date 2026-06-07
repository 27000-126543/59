import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../shared/types.js';
import { users } from '../data/mockData.js';

// 扩展 Express Request 类型，添加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        name: string;
      };
    }
  }
}

// Mock Token 解析接口
interface MockTokenPayload {
  id: string;
  role: UserRole;
  name: string;
}

// 解析 Mock Token
// Token 格式: 'mock-{role}-{userId}'
function parseMockToken(token: string): MockTokenPayload | null {
  try {
    // 检查 token 前缀
    if (!token.startsWith('mock-')) {
      return null;
    }

    // 移除前缀并解析
    const tokenBody = token.slice(5); // 移除 'mock-'
    const parts = tokenBody.split('-');

    if (parts.length < 2) {
      return null;
    }

    const role = parts[0] as UserRole;
    const userId = parts.slice(1).join('-'); // 处理 id 中可能包含的 '-'

    // 验证角色是否合法
    const validRoles: UserRole[] = ['visitor', 'curator', 'conservator', 'security', 'director'];
    if (!validRoles.includes(role)) {
      return null;
    }

    // 在 mock 数据中查找用户
    const user = users.find((u) => u.id === userId || u.username === userId);
    if (!user) {
      // 如果找不到用户，使用 token 中的信息构建
      return {
        id: userId,
        role,
        name: role,
      };
    }

    return {
      id: user.id,
      role: user.role,
      name: user.name,
    };
  } catch {
    return null;
  }
}

// 从请求头中提取 Token
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // 支持 'Bearer {token}' 和直接 token 两种格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return authHeader;
}

// 必需认证中间件 - 未认证返回 401
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: '未提供认证 Token',
    });
    return;
  }

  const payload = parseMockToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: '认证 Token 无效或已过期',
    });
    return;
  }

  // 将用户信息挂载到 request 对象
  req.user = payload;
  next();
}

// 可选认证中间件 - 未认证也继续执行，req.user 为 undefined
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req);

  if (!token) {
    next();
    return;
  }

  const payload = parseMockToken(token);
  if (payload) {
    req.user = payload;
  }

  next();
}

export default {
  authMiddleware,
  optionalAuthMiddleware,
};
