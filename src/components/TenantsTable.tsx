import React, { useState, useMemo } from 'react';
import {
  Search,
  Lock,
  Unlock,
  UserCheck,
  Edit3,
  Calendar,
  AlertCircle,
  Sparkles,
  Zap,
  Building2,
  X,
} from 'lucide-react';
import {
  BillingModel,
  SubscriptionStatus,
  SubscriptionTier,
  TenantSchool,
} from '@/types';

interface TenantsTableProps {
  tenants: TenantSchool[];
  onEditRates: (school: TenantSchool) => void;
  onImpersonate: (school: TenantSchool) => void;
  onToggleLock: (school: TenantSchool) => void;
  onExtendGracePeriod: (school: TenantSchool) => void;
  isLoading: boolean;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  onEditRates,
  onImpersonate,
  onToggleLock,
  onExtendGracePeriod,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRateType, setSelectedRateType] = useState<string>('ALL');
  const [selectedBillingModel, setSelectedBillingModel] = useState<string>('ALL');

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Search filter
      const matchesSearch =
        search === '' ||
        tenant.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        tenant.email.toLowerCase().includes(search.toLowerCase()) ||
        (tenant.state && tenant.state.toLowerCase().includes(search.toLowerCase())) ||
        tenant.fullname.toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'LOCKED'
          ? tenant.isLocked || tenant.subscriptionStatus === 'LOCKED'
          : tenant.subscriptionStatus === selectedStatus && !tenant.isLocked);

      // Rate Type filter
      const hasAgreedRate =
        tenant.customStudentRate !== null &&
        tenant.customStudentRate !== undefined &&
        Number(tenant.customStudentRate) > 0;
      const matchesRate =
        selectedRateType === 'ALL' ||
        (selectedRateType === 'AGREED' ? hasAgreedRate : !hasAgreedRate);

      // Billing model filter
      const matchesModel =
        selectedBillingModel === 'ALL' || tenant.billingModel === selectedBillingModel;

      return matchesSearch && matchesStatus && matchesRate && matchesModel;
    });
  }, [tenants, search, selectedStatus, selectedRateType, selectedBillingModel]);

  const hasActiveFilters =
    search !== '' ||
    selectedStatus !== 'ALL' ||
    selectedRateType !== 'ALL' ||
    selectedBillingModel !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('ALL');
    setSelectedRateType('ALL');
    setSelectedBillingModel('ALL');
  };

  const getStatusBadge = (tenant: TenantSchool) => {
    if (tenant.isLocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <Lock className="w-3 h-3 shrink-0" />
          Locked
        </span>
      );
    }

    switch (tenant.subscriptionStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Active
          </span>
        );
      case 'GRACE_PERIOD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <AlertCircle className="w-3 h-3 shrink-0" />
            Grace Period
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
            <Sparkles className="w-3 h-3 shrink-0" />
            Trial Access
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Expired
          </span>
        );
      case 'SUSPENDED':
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <Lock className="w-3 h-3 shrink-0" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {tenant.subscriptionStatus}
          </span>
        );
    }
  };

  const getSeatRateBadge = (tenant: TenantSchool) => {
    const isAgreed =
      tenant.customStudentRate !== null &&
      tenant.customStudentRate !== undefined &&
      Number(tenant.customStudentRate) > 0;
    const rate = isAgreed ? Number(tenant.customStudentRate) : tenant.computedBilling.appliedRate;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            ₦{Number(rate).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">/seat</span>
        </div>
        <div>
          {isAgreed ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-mono">
              <Zap className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Agreed Rate
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
              Platform Default
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Search & Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search school name, email, or state..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        {/* Filter Dropdowns & Counters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All</option>
              <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Active</option>
              <option value="GRACE_PERIOD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Grace</option>
              <option value="TRIAL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Trial</option>
              <option value="LOCKED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Locked</option>
              <option value="EXPIRED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Expired</option>
            </select>
          </div>

          {/* Seat Rate Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pricing:</span>
            <select
              value={selectedRateType}
              onChange={(e) => setSelectedRateType(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Pricing</option>
              <option value="AGREED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Agreed Seat Rate</option>
              <option value="DEFAULT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Platform Default</option>
            </select>
          </div>

          {/* Billing Model Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Model:</span>
            <select
              value={selectedBillingModel}
              onChange={(e) => setSelectedBillingModel(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Models</option>
              <option value="PER_STUDENT_TERM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Per Student</option>
              <option value="FLAT_FEE_TERM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Flat Fee</option>
              <option value="CUSTOM_CONTRACT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Contract</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1 font-mono">
            {filteredTenants.length} of {tenants.length}
          </span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">School & Administrator</th>
                <th className="py-3 px-3">Subscription</th>
                <th className="py-3 px-3">Rate / Seat</th>
                <th className="py-3 px-3 text-center">Live Students</th>
                <th className="py-3 px-3 text-center">Staff</th>
                <th className="py-3 px-4 text-right">Computed Bill</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">No tenant schools match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  return (
                    <tr
                      key={tenant.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        tenant.isLocked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* 1. School Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs overflow-hidden shrink-0">
                            {tenant.logo ? (
                              <img
                                src={tenant.logo}
                                alt={tenant.schoolName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              tenant.schoolName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                              {tenant.schoolName}
                              {tenant.isLocked && (
                                <Lock className="w-3 h-3 text-rose-500 shrink-0" />
                              )}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{tenant.email}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px]">
                              {tenant.city || tenant.state ? `${tenant.city ? tenant.city + ', ' : ''}${tenant.state || ''}` : 'Location Unset'} • {tenant.branchCount} Branch{tenant.branchCount !== 1 ? 'es' : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Subscription Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div>{getStatusBadge(tenant)}</div>
                          {tenant.isLocked && tenant.lockReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[160px] truncate" title={tenant.lockReason}>
                              {tenant.lockReason}
                            </p>
                          )}
                          {!tenant.isLocked && tenant.subscriptionStatus === 'GRACE_PERIOD' && tenant.gracePeriodEndsAt && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                              Ends {new Date(tenant.gracePeriodEndsAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Rate Per Seat */}
                      <td className="py-3 px-3">
                        {getSeatRateBadge(tenant)}
                      </td>

                      {/* 4. Live Students */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono">
                          <span className="text-slate-900 dark:text-white font-bold text-xs">
                            {tenant.activeStudentCount}
                          </span>
                          {tenant.computedBilling.breakdown.floorAdjustedStudents > 0 && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                              (Floor: {tenant.computedBilling.billableStudentCount})
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 5. Staff */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-slate-700 dark:text-slate-300 font-medium font-mono text-xs">
                          {tenant.activeStaffCount}
                        </span>
                      </td>

                      {/* 6. Computed Termly Invoice */}
                      <td className="py-3 px-4 text-right font-mono">
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          ₦{tenant.computedBilling.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          ₦{tenant.computedBilling.appliedRate.toLocaleString()}/seat
                        </p>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Edit Rates & Plan */}
                          <button
                            onClick={() => onEditRates(tenant)}
                            title="Edit Dynamic Rates & Plan Settings"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Impersonate School Admin */}
                          <button
                            onClick={() => onImpersonate(tenant)}
                            title="Impersonate School Admin Portal"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Extend Grace Period */}
                          <button
                            onClick={() => onExtendGracePeriod(tenant)}
                            title="Extend Grace Period (+14 Days)"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Emergency Lock / Unlock Switch */}
                          <button
                            onClick={() => onToggleLock(tenant)}
                            title={tenant.isLocked ? "Unlock School Workspace" : "Emergency Lock School Workspace"}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              tenant.isLocked
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                                : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {tenant.isLocked ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

