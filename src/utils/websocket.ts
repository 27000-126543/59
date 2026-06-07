import type { Message } from '@/types';

export type WSMessageType =
  | 'connected'
  | 'new_message'
  | 'notification'
  | 'security_alert'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  data: unknown;
  timestamp?: number;
}

export interface SecurityAlertData {
  hallName: string;
  level: string;
  message: string;
  timestamp: string;
}

type MessageHandler = (data: unknown) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private handlers = new Map<WSMessageType, Set<MessageHandler>>();
  private userId: string | null = null;
  private token: string | null = null;

  constructor() {
    this.url =
      import.meta.env.VITE_WS_URL ||
      `ws://${window.location.hostname}:3001/ws`;
  }

  connect(userId: string, token: string) {
    this.userId = userId;
    this.token = token;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const fullUrl = `${this.url}?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] 已连接');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          this.dispatch(msg);
        } catch (e) {
          console.error('[WebSocket] 消息解析失败:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] 连接已关闭');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WebSocket] 错误:', err);
      };
    } catch (e) {
      console.error('[WebSocket] 连接失败:', e);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(type: WSMessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  private dispatch(msg: WSMessage) {
    const handlers = this.handlers.get(msg.type);
    if (handlers) {
      handlers.forEach((h) => h(msg.data));
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocket] 达到最大重连次数，停止重连');
      return;
    }
    if (this.reconnectTimer) return;

    const delay = this.reconnectDelay * Math.min(2, this.reconnectAttempts + 1);
    console.log(`[WebSocket] ${delay / 1000}s 后尝试重连 (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      if (this.userId && this.token) {
        this.connect(this.userId, this.token);
      }
    }, delay);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();

export { type Message };
