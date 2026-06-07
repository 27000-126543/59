import { create } from 'zustand';
import type { User, UserRole, LoginResponse } from '@/types';
import { post } from '@/utils/request';
import { wsClient } from '@/utils/websocket';
import { useMessageStore } from './messageStore';

const STORAGE_KEY = 'auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (role: UserRole, username: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

interface StoredAuth {
  user: User;
  token: string;
}

function getInitialState(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredAuth = JSON.parse(stored);
      if (parsed.user && parsed.token) {
        return {
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true,
        };
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
}

const initial = getInitialState();

if (initial.user && initial.token) {
  try {
    wsClient.connect(initial.user.id, initial.token);
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initial,
  initialized: true,

  login: async (role: UserRole, username: string, password: string) => {
    const data = await post<LoginResponse>('/auth/login', { role, username, password }, { skipAuth: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      initialized: true,
    });
    try {
      wsClient.connect(data.user.id, data.token);
    } catch {
      // ignore
    }
    try {
      useMessageStore.getState().fetchUnreadCount();
    } catch {
      // ignore
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    wsClient.disconnect();
    useMessageStore.getState().stopPolling();
    useMessageStore.setState({ messages: [], unreadCount: 0 });
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initialize: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredAuth = JSON.parse(stored);
        if (parsed.user && parsed.token) {
          set({
            user: parsed.user,
            token: parsed.token,
            isAuthenticated: true,
            initialized: true,
          });
          try {
            wsClient.connect(parsed.user.id, parsed.token);
          } catch {
            // ignore
          }
          return;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      initialized: true,
    });
  },
}));
