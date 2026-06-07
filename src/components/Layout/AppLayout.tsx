import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, initialize } = useAuthStore();
  const { startPolling, stopPolling, fetchUnreadCount } = useMessageStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      startPolling();
    }
    return () => {
      stopPolling();
    };
  }, [isAuthenticated, fetchUnreadCount, startPolling, stopPolling]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-museum-cream">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-full rounded-xl bg-white p-6 shadow-museum">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
