import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BadgeCheck,
  Sliders,
  LogOut,
  ShieldCheck,
  Layers,
  ChevronRight,
  UserCheck,
  Activity,
  CreditCard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AdminUser } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import { Link, tabToPath } from '@/context/RouterContext';

export type NavTab = 'overview' | 'onboarding' | 'tenants' | 'reconciliation' | 'pricing';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  adminUser: AdminUser | null;
  pendingCount: number;
  pendingOnboardingCount?: number;
  onLogout: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: NavTab;
    label: string;
    subtitle?: string;
    icon: React.ReactNode;
    badge?: {
      count: number;
      variant: 'amber' | 'indigo' | 'emerald';
    };
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  pendingCount,
  pendingOnboardingCount = 0,
  onLogout,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Core Management',
      items: [
        {
          id: 'overview',
          label: 'Platform Overview',
          subtitle: 'Metrics & inflows',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'tenants',
          label: 'Tenant Schools',
          subtitle: 'Active seat directory',
          icon: <Building2 className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Operations & Auditing',
      items: [
        {
          id: 'onboarding',
          label: 'Onboarding Queue',
          subtitle: 'New school gating',
          icon: <UserCheck className="w-4 h-4" />,
          badge:
            pendingOnboardingCount > 0
              ? { count: pendingOnboardingCount, variant: 'amber' }
              : undefined,
        },
        {
          id: 'reconciliation',
          label: 'Payment Approvals',
          subtitle: 'Bank proof verification',
          icon: <BadgeCheck className="w-4 h-4" />,
          badge:
            pendingCount > 0
              ? { count: pendingCount, variant: 'amber' }
              : undefined,
        },
      ],
    },
    {
      title: 'Platform Config',
      items: [
        {
          id: 'pricing',
          label: 'Global Seat Pricing',
          subtitle: 'Default seat rate & floor',
          icon: <Sliders className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-colors duration-150 shrink-0">
      {/* Top Brand & Cluster Health Area */}
      <div>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
          {/* Logo & Brand Identity */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0 font-bold transition-transform group-hover:scale-105">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-slate-900 dark:text-white font-sans">
                  SCHOLA
                </span>
                <span className="text-[10px] uppercase font-bold font-mono tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                Centralized Control Plane
              </p>
            </div>
          </Link>

          {/* Real-time Enclave Health Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                Multi-Tenant Enclave
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              100% ONLINE
            </span>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-270px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                {section.title}
              </p>

              <div className="space-y-1 pt-1">
                {section.items.map((item) => {
                   const isActive = currentTab === item.id;
                   return (
                     <Link
                       key={item.id}
                       to={tabToPath(item.id)}
                       onClick={() => onSelectTab(item.id)}
                       className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group relative ${
                         isActive
                           ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-900 dark:text-white border border-indigo-200 dark:border-slate-800 font-semibold shadow-xs'
                           : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent font-medium'
                       }`}
                     >
                       {/* Left accent bar on active item */}
                       {isActive && (
                         <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-indigo-600 dark:bg-indigo-500" />
                       )}

                       <div className="flex items-center gap-3 min-w-0">
                         <span
                           className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                             isActive
                               ? 'bg-indigo-600 text-white border-indigo-600'
                               : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                           }`}
                         >
                           {item.icon}
                         </span>
                         <div className="text-left min-w-0">
                           <p className="truncate text-xs">{item.label}</p>
                           {item.subtitle && (
                             <p
                               className={`text-[10px] truncate ${
                                 isActive
                                   ? 'text-indigo-600 dark:text-indigo-400'
                                   : 'text-slate-400 dark:text-slate-500'
                               }`}
                             >
                               {item.subtitle}
                             </p>
                           )}
                         </div>
                       </div>

                       <div className="flex items-center gap-1.5 shrink-0">
                         {item.badge && (
                           <span
                             className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md font-mono ${
                               item.badge.variant === 'amber'
                                 ? 'bg-amber-500 text-slate-950 font-bold'
                                 : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                             }`}
                           >
                             {item.badge.count}
                           </span>
                         )}
                         {isActive && (
                           <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                         )}
                       </div>
                     </Link>
                   );
                 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Session Management */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 space-y-3">
        {/* Compact Theme Switcher */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
            Interface Appearance
          </span>
          <ThemeToggle variant="pill" />
        </div>

        {/* Administrator Profile Card */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              {adminUser?.fullname?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {adminUser?.fullname || 'Platform Super Admin'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>SUPER_ADMIN</span>
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={onLogout}
            title="Terminate privileged session"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
