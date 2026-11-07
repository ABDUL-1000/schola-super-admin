import React from 'react';
import {
  RotateCw,
  PlusCircle,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  Clock,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useRouter, Link } from '@/context/RouterContext';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenManualPayment: () => void;
  currentTab?: string;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  onRefresh,
  isLoading,
  onOpenManualPayment,
  currentTab,
  pendingCount = 0,
}) => {
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between transition-colors duration-150">
      {/* Left: Breadcrumbs & Page Heading */}
      <div className="space-y-1">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Super Admin</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            {title}
          </span>
        </div>

        {/* Title and Clearance Badge */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            Privileged Console
          </span>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{subtitle}</p>
        )}
      </div>

      {/* Right: Operational Tooling & Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Active Academic Term Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-mono text-[11px]">
            Term: <strong className="text-slate-900 dark:text-white font-semibold">1st Term 2025/2026</strong>
          </span>
        </div>

        {/* Treasury Settlement Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
            NGN Treasury Active
          </span>
        </div>

        {/* Global Data Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh real-time data from backend cluster"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <RotateCw
            className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden sm:inline">Sync Data</span>
        </button>

        {/* Primary Action Button: Record Manual Bank Payment */}
        <button
          onClick={onOpenManualPayment}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record Bank Payment</span>
        </button>
      </div>
    </header>
  );
};
