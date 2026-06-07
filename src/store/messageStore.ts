import { create } from 'zustand';
import type { Message } from '@/types';
import { get as apiGet, put as apiPut } from '@/utils/request';

interface MessageState {
  messages: Message[];
  unreadCount: number;
  pollingInterval: number | null;
  fetchMessages: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useMessageStore = create<MessageState>((set, getState) => ({
  messages: [],
  unreadCount: 0,
  pollingInterval: null,

  fetchMessages: async () => {
    try {
      const data = await apiGet('/messages') as unknown as Message[];
      set({ messages: data });
      const unread = data.filter((m) => !m.read).length;
      set({ unreadCount: unread });
    } catch {
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await apiGet('/messages/unread');
      set({ unreadCount: (data as any).count });
    } catch {
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
}));
