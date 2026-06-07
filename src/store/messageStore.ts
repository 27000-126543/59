import { create } from 'zustand';
import type { Message } from '@/types';
import { get as apiGet, put as apiPut } from '@/utils/request';
import { wsClient, type SecurityAlertData } from '@/utils/websocket';

interface MessageState {
  messages: Message[];
  unreadCount: number;
  pollingInterval: number | null;
  wsUnsubscribers: Array<() => void>;
  securityAlerts: SecurityAlertData[];
  fetchMessages: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  initWebSocketListeners: () => void;
  cleanupWebSocketListeners: () => void;
}

export const useMessageStore = create<MessageState>((set, getState) => ({
  messages: [],
  unreadCount: 0,
  pollingInterval: null,
  wsUnsubscribers: [],
  securityAlerts: [],

  fetchMessages: async () => {
    try {
      const data = (await apiGet('/messages')) as {
        total: number;
        unread: number;
        list: Message[];
      };
      if (data && Array.isArray(data.list)) {
        set({ messages: data.list, unreadCount: data.unread });
      }
    } catch {
      // ignore
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = (await apiGet('/messages/unread')) as { count: number };
      if (data && typeof data.count === 'number') {
        set({ unreadCount: data.count });
      }
    } catch {
      // ignore
    }
  },

  markRead: async (id: string) => {
    try {
      await apiPut(`/messages/${id}/read`);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, read: true } : m
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllRead: async () => {
    try {
      await apiPut('/messages/read-all');
      set((state) => ({
        messages: state.messages.map((m) => ({ ...m, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  startPolling: () => {
    if (getState().pollingInterval !== null) return;
    const interval = window.setInterval(() => {
      getState().fetchUnreadCount();
    }, 30000);
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const interval = getState().pollingInterval;
    if (interval !== null) {
      clearInterval(interval);
      set({ pollingInterval: null });
    }
  },

  initWebSocketListeners: () => {
    const state = getState();
    if (state.wsUnsubscribers.length > 0) return;

    const unsub1 = wsClient.on('new_message', (data) => {
      const message = data as Message;
      set((s) => ({
        messages: [message, ...s.messages],
        unreadCount: s.unreadCount + 1,
      }));
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(message.title, {
            body: message.content,
          });
        }
      } catch {
        // ignore
      }
    });

    const unsub2 = wsClient.on('notification', (data) => {
      const notification = data as { title: string; content: string };
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
          });
        }
      } catch {
        // ignore
      }
      getState().fetchUnreadCount();
    });

    const unsub3 = wsClient.on('security_alert', (data) => {
      const alert = data as SecurityAlertData;
      set((s) => ({
        securityAlerts: [alert, ...s.securityAlerts].slice(0, 50),
      }));
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`安全预警 - ${alert.hallName}`, {
            body: alert.message,
          });
        }
      } catch {
        // ignore
      }
      getState().fetchUnreadCount();
    });

    set({ wsUnsubscribers: [unsub1, unsub2, unsub3] });
  },

  cleanupWebSocketListeners: () => {
    const state = getState();
    state.wsUnsubscribers.forEach((unsub) => unsub());
    set({ wsUnsubscribers: [] });
  },
}));
