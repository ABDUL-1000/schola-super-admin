import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  School,
  UserCheck,
  Receipt,
  Tags,
  LogOut,
  Menu,
  Moon,
  Sun,
  RefreshCw,
  X,
} from 'lucide-react';
import type { AdminUser } from '@/types';
import type { NavTab } from '@/context/RouterContext';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/components/ui';

const NAV: Array<{ tab: NavTab; label: string; icon: React.ReactNode }> = [
  { tab: 'overview', label: 'Overview', icon: <LayoutDashboard className="size-4" /> },
  { tab: 'onboarding', label: 'Approvals', icon: <UserCheck className="size-4" /> },
  { tab: 'tenants', label: 'Schools', icon: <School className="size-4" /> },
  { tab: 'reconciliation', label: 'Payments', icon: <Receipt className="size-4" /> },
  { tab: 'pricing', label: 'Pricing', icon: <Tags className="size-4" /> },
];

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">S</div>
    <div className="leading-tight">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">Schola</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">Admin</div>
    </div>
  </div>
);

const SidebarBody: React.FC<{
  currentTab: NavTab;
  onSelect: (t: NavTab) => void;
  badges: Partial<Record<NavTab, number>>;
  admin: AdminUser;
  onLogout: () => void;
}> = ({ currentTab, onSelect, badges, admin, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((n) => {
          const active = currentTab === n.tab;
          const count = badges[n.tab] || 0;
          return (
            <button
              key={n.tab}
              type="button"
              onClick={() => onSelect(n.tab)}
              className={cx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white',
              )}
            >
              <span className={active ? 'text-brand-600 dark:text-brand-200' : 'text-slate-400'}>{n.icon}</span>
              <span className="flex-1 text-left">{n.label}</span>
              {count > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 tabular dark:bg-amber-500/20 dark:text-amber-300">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
        >
          {theme === 'dark' ? <Sun className="size-4 text-slate-400" /> : <Moon className="size-4 text-slate-400" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {(admin.fullname || admin.email).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{admin.fullname}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{admin.email}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/** Sidebar on desktop, slide-in drawer on phones, plus a slim top bar. */
export const AppLayout: React.FC<{
  currentTab: NavTab;
  onSelectTab: (t: NavTab) => void;
  badges: Partial<Record<NavTab, number>>;
  admin: AdminUser;
  onLogout: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  children: React.ReactNode;
}> = ({ currentTab, onSelectTab, badges, admin, onLogout, onRefresh, isLoading, children }) => {
  const [drawer, setDrawer] = useState(false);
  useEffect(() => setDrawer(false), [currentTab]);

  const select = (t: NavTab) => {
    onSelectTab(t);
    setDrawer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <SidebarBody currentTab={currentTab} onSelect={select} badges={badges} admin={admin} onLogout={onLogout} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarBody currentTab={currentTab} onSelect={select} badges={badges} admin={admin} onLogout={onLogout} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="-ml-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={cx('size-4', isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">{isLoading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
};
