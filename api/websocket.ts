import type { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { Message } from '../shared/types.js';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
}

const clients = new Map<string, ClientConnection[]>();

let wss: WebSocketServer | null = null;

function sendToClient(ws: WebSocket, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToUser(userId: string, payload: unknown) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  userClients.forEach((c) => sendToClient(c.ws, payload));
}

export function broadcastMessage(message: Message) {
  const payload = {
    type: 'new_message',
    data: message,
  };
  broadcastToUser(message.receiverId, payload);
}

export function broadcastNotification(userId: string, notification: {
  id: string;
  title: string;
  content: string;
  type: string;
}) {
  const payload = {
    type: 'notification',
    data: notification,
  };
  broadcastToUser(userId, payload);
}

export function broadcastSecurityAlert(hallName: string, level: string, message: string) {
  const payload = {
    type: 'security_alert',
    data: {
      hallName,
      level,
      message,
      timestamp: new Date().toISOString(),
    },
  };
  clients.forEach((_, userId) => {
    if (userId.startsWith('security') || userId.startsWith('director') || userId.startsWith('u-')) {
      broadcastToUser(userId, payload);
    }
  });
}

export function initWebSocketServer(server: HTTPServer) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    if (!userId || !token) {
      ws.close(4001, '缺少userId或token');
      return;
    }

    if (!clients.has(userId)) {
      clients.set(userId, []);
    }
    clients.get(userId)!.push({ ws, userId });

    console.log(`[WebSocket] 用户 ${userId} 已连接，当前连接数: ${clients.get(userId)!.length}`);

    sendToClient(ws, {
      type: 'connected',
      data: { userId, timestamp: new Date().toISOString() },
    });

    ws.on('close', () => {
      const userClients = clients.get(userId);
      if (userClients) {
        const filtered = userClients.filter((c) => c.ws !== ws);
        if (filtered.length === 0) {
          clients.delete(userId);
        } else {
          clients.set(userId, filtered);
        }
      }
      console.log(`[WebSocket] 用户 ${userId} 已断开`);
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'ping') {
          sendToClient(ws, { type: 'pong', timestamp: Date.now() });
        }
      } catch {
        // ignore malformed messages
      }
    });
  });

  console.log('[WebSocket] Server initialized on /ws');
}

export function getConnectedUserCount(): number {
  let total = 0;
  clients.forEach((arr) => (total += arr.length));
  return total;
}
