import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  BarChart3, Settings, LogOut, Boxes, ChevronRight,
  Layers
} from 'lucide-react';

import { Building2 } from 'lucide-react';

const businessNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Categories', path: '/categories', icon: Tag },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const adminNavItems = [
  { label: 'Businesses', path: '/admin/businesses', icon: Building2 },
  { label: 'System Users', path: '/admin/users', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, business, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 z-30 flex flex-col',
        'bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">InvenTrack</h1>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Business Suite</p>
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="px-4 py-3 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-violet-300">
                {business?.name ? getInitials(business.name) : 'BZ'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{business?.name || 'My Business'}</p>
              <p className="text-white/40 text-[10px] truncate">{business?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 pt-2 pb-1">Menu</p>
          {(user?.role === 'admin' ? adminNavItems : businessNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  'transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white shadow-lg shadow-violet-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80')} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="p-3 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{user?.name ? getInitials(user.name) : 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-white/40 text-[10px] capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
