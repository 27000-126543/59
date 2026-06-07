import { Bell, LogOut, User as UserIcon, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import Badge from '@/components/Common/Badge';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  visitor: '观众',
  curator: '策展人',
  conservator: '文物保护员',
  security: '安全管理员',
  director: '馆长',
};

const roleVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'brown'> = {
  visitor: 'info',
  curator: 'gold',
  conservator: 'success',
  security: 'danger',
  director: 'brown',
};

export default function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useMessageStore();

  const displayName = user?.name || user?.realName || user?.username || '用户';
  const roleLabel = user?.role ? roleLabels[user.role] : '';
  const roleBadgeVariant = user?.role ? roleVariant[user.role] : 'default';

  return (
    <header className="flex h-16 items-center justify-between border-b border-museum-brown-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-museum-gold-500 shadow-gold">
          <Building2 className="h-5 w-5 text-museum-brown-900" />
        </div>
        <div>
          <h1 className="text-base font-bold font-serif text-museum-brown-900">
            华夏博物馆智慧管理平台
          </h1>
          <p className="text-xs text-museum-brown-500">Huaxia Museum Smart Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/messages"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-museum-brown-600 transition-colors hover:bg-museum-brown-50 hover:text-museum-brown-900"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
                unreadCount > 99 ? 'bg-museum-crimson' : 'bg-museum-gold-500'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="h-6 w-px bg-museum-brown-100" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-museum-brown-100">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-museum-brown-600" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-museum-brown-900">{displayName}</p>
            <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-museum-brown-600 transition-colors hover:bg-museum-brown-50 hover:text-museum-crimson"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">登出</span>
        </button>
      </div>
    </header>
  );
}
