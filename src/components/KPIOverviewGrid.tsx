import React from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Banknote,
  Receipt,
  Lock,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { OverviewMetrics } from '@/types';
import { useRouter } from '@/context/RouterContext';

interface KPIOverviewGridProps {
  metrics: OverviewMetrics;
  onNavigateToTab?: (tab: 'tenants' | 'reconciliation' | 'pricing') => void;
}

export const KPIOverviewGrid: React.FC<KPIOverviewGridProps> = ({
  metrics,
  onNavigateToTab,
}) => {
  const { navigate, setTab } = useRouter();
  const { kpis, platformPricing } = metrics;

  const handleNavigate = (path: string, tab: 'tenants' | 'reconciliation' | 'pricing') => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Active Schools */}
        <div
          onClick={() => handleNavigate('/tenants', 'tenants')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Schools
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/80 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {kpis.totalSchools}
            </p>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              {kpis.activeSchools} Active
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
              <Clock className="w-3 h-3" />
              {kpis.graceSchools} grace
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium text-[11px]">
              <Lock className="w-3 h-3" />
              {kpis.lockedSchools} locked
            </span>
          </div>
        </div>

        {/* 2. Total Active Students */}
        <div
          onClick={() => handleNavigate('/tenants', 'tenants')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 shadow-sm transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Live Students
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700/80 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950 transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {kpis.totalActiveStudents.toLocaleString()}
            </p>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Real-time
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Billable Seat Cap</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium font-mono">
              Floor ≥ {platformPricing.minimumStudentFloor}
            </span>
          </div>
        </div>

        {/* 3. Total Staff */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Platform Staff
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700/80">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {kpis.totalStaff.toLocaleString()}
            </p>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Teachers</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Staff Ratio</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium font-mono">
              1 : {kpis.totalStaff > 0 ? Math.round(kpis.totalActiveStudents / kpis.totalStaff) : 0}
            </span>
          </div>
        </div>

        {/* 4. Realized Gross Revenue */}
        <div
          onClick={() => handleNavigate('/reconciliation', 'reconciliation')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Gross Inflow
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
              <Banknote className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              ₦{kpis.realizedGrossRevenue.toLocaleString()}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Treasury Status</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold font-mono flex items-center gap-0.5 group-hover:underline">
              NGN Settled <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 5. Pending Offline Proofs */}
        <div
          onClick={() => handleNavigate('/reconciliation', 'reconciliation')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 shadow-sm transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Pending Audits
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {kpis.pendingOfflineReceiptsCount}
            </p>
            {kpis.pendingOfflineReceiptsCount > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                Action Required
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">All cleared</span>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Bank Receipts</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5 group-hover:underline">
              Review Queue <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Baseline Pricing Rates Quick Banner */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Platform Seat Pricing (v{platformPricing.version}):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              Default Seat Price: <strong className="text-indigo-600 dark:text-indigo-400">₦{platformPricing.standardRatePerStudent.toLocaleString()}</strong> / student / term
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              Default Floor: <strong className="text-amber-600 dark:text-amber-400">{platformPricing.minimumStudentFloor} seats</strong>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              Grace Period: <strong className="text-emerald-600 dark:text-emerald-400">{platformPricing.defaultGracePeriodDays} days</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => handleNavigate('/pricing', 'pricing')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Modify Default Pricing</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

