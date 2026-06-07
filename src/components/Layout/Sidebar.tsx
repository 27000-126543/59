import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Ticket,
  MapPin,
  Star,
  MessageSquare,
  LayoutDashboard,
  Palette,
  ClipboardList,
  Search,
  Wrench,
  FileText,
  Users,
  AlertTriangle,
  BarChart3,
  FileBarChart,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const menuConfig: Record<UserRole, MenuItem[]> = {
  visitor: [
    { label: '首页', path: '/visitor/home', icon: Home },
    { label: '预约门票', path: '/visitor/booking', icon: Ticket },
    { label: '我的门票', path: '/visitor/ticket', icon: Ticket },
    { label: '智能导览', path: '/visitor/guide', icon: MapPin },
    { label: '评分反馈', path: '/visitor/feedback', icon: Star },
    { label: '消息中心', path: '/messages', icon: MessageSquare },
  ],
  curator: [
    { label: '工作台', path: '/curator/home', icon: LayoutDashboard },
    { label: '展览管理', path: '/curator/exhibitions', icon: Palette },
    { label: '工单审批', path: '/curator/workorders', icon: ClipboardList },
    { label: '消息中心', path: '/messages', icon: MessageSquare },
  ],
  conservator: [
    { label: '工作台', path: '/conservator/home', icon: LayoutDashboard },
    { label: '巡检任务', path: '/conservator/inspections', icon: Search },
    { label: '保养计划', path: '/conservator/maintenance', icon: Wrench },
    { label: '修复工单', path: '/conservator/workorders', icon: FileText },
    { label: '消息中心', path: '/messages', icon: MessageSquare },
  ],
  security: [
    { label: '工作台', path: '/security/home', icon: LayoutDashboard },
    { label: '容量设置', path: '/security/capacity', icon: Users },
    { label: '预警中心', path: '/security/alerts', icon: AlertTriangle },
    { label: '消息中心', path: '/messages', icon: MessageSquare },
  ],
  director: [
    { label: '数据看板', path: '/director/home', icon: BarChart3 },
    { label: '运营报告', path: '/director/reports', icon: FileBarChart },
    { label: '消息中心', path: '/messages', icon: MessageSquare },
  ],
};

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const menuItems = menuConfig[role] || [];

  return (
    <aside className="flex h-screen w-60 flex-col bg-museum-brown-900">
      <div className="flex h-16 items-center justify-center border-b border-museum-brown-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-museum-gold-500">
            <Palette className="h-5 w-5 text-museum-brown-900" />
          </div>
          <span className="text-lg font-bold font-serif text-museum-gold-300">
            智慧博物馆
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-museum-gold-500/20 text-museum-gold-300 shadow-gold'
                      : 'text-museum-brown-200 hover:bg-museum-brown-800 hover:text-museum-gold-200'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-museum-gold-400'
                        : 'text-museum-brown-300 group-hover:text-museum-gold-300'
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-museum-gold-400 animate-pulse-gold" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-museum-brown-800 p-4">
        <p className="text-xs text-museum-brown-400">华夏博物馆 © 2026</p>
      </div>
    </aside>
  );
}
