import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Calculator,
  Lock,
  Unlock,
  AlertTriangle,
  Building2,
  Calendar,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  BillingModel,
  SubscriptionStatus,
  SubscriptionTier,
  TenantSchool,
  PlatformPricingConfig,
} from '@/types';

interface DynamicFeeModalProps {
  school: TenantSchool | null;
  platformPricing: PlatformPricingConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    schoolId: string,
    data: {
      subscriptionTier: SubscriptionTier;
      billingModel: BillingModel;
      customStudentRate: number | null;
      customFlatTermRate: number | null;
      customStudentFloor: number | null;
      subscriptionStatus: SubscriptionStatus;
      isLocked: boolean;
      lockReason: string | null;
      subscriptionExpiresAt: string | null;
      gracePeriodEndsAt: string | null;
    },
  ) => Promise<void>;
}

export const DynamicFeeModal: React.FC<DynamicFeeModalProps> = ({
  school,
  platformPricing,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !school) return null;

  const [tier, setTier] = useState<SubscriptionTier>(school.subscriptionTier);
  const [billingModel, setBillingModel] = useState<BillingModel>(school.billingModel);
  const [customStudentRate, setCustomStudentRate] = useState<string>(
    school.customStudentRate ? String(school.customStudentRate) : '',
  );
  const [customFlatTermRate, setCustomFlatTermRate] = useState<string>(
    school.customFlatTermRate ? String(school.customFlatTermRate) : '',
  );
  const [customStudentFloor, setCustomStudentFloor] = useState<string>(
    school.customStudentFloor ? String(school.customStudentFloor) : '',
  );
  const [status, setStatus] = useState<SubscriptionStatus>(school.subscriptionStatus);
  const [isLocked, setIsLocked] = useState<boolean>(school.isLocked);
  const [lockReason, setLockReason] = useState<string>(school.lockReason || '');
  const [expiryDate, setExpiryDate] = useState<string>(
    school.subscriptionExpiresAt ? school.subscriptionExpiresAt.split('T')[0] : '',
  );
  const [graceDate, setGraceDate] = useState<string>(
    school.gracePeriodEndsAt ? school.gracePeriodEndsAt.split('T')[0] : '',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when school changes
  useEffect(() => {
    if (school) {
      setTier(school.subscriptionTier);
      setBillingModel(school.billingModel);
      setCustomStudentRate(school.customStudentRate ? String(school.customStudentRate) : '');
      setCustomFlatTermRate(school.customFlatTermRate ? String(school.customFlatTermRate) : '');
      setCustomStudentFloor(school.customStudentFloor ? String(school.customStudentFloor) : '');
      setStatus(school.subscriptionStatus);
      setIsLocked(school.isLocked);
      setLockReason(school.lockReason || '');
      setExpiryDate(school.subscriptionExpiresAt ? school.subscriptionExpiresAt.split('T')[0] : '');
      setGraceDate(school.gracePeriodEndsAt ? school.gracePeriodEndsAt.split('T')[0] : '');
    }
  }, [school]);

  // Real-time invoice simulator calculation
  const simulation = React.useMemo(() => {
    const activeCount = school.activeStudentCount;
    const customFloorNum = customStudentFloor ? parseInt(customStudentFloor, 10) : null;
    const effectiveFloor = customFloorNum ?? platformPricing.minimumStudentFloor;
    const billableStudents = Math.max(activeCount, effectiveFloor);

    const baselineRate = platformPricing.standardRatePerStudent;
    const customRateNum = customStudentRate ? parseFloat(customStudentRate) : null;
    const customFlatNum = customFlatTermRate ? parseFloat(customFlatTermRate) : null;

    let total = 0;
    let appliedRate = 0;
    let isOverride = false;
    let formulaDesc = '';

    if (billingModel === 'FLAT_FEE_TERM') {
      if (customFlatNum && customFlatNum > 0) {
        total = customFlatNum;
        appliedRate = customFlatNum;
        isOverride = true;
        formulaDesc = `Flat term rate agreement: ₦${customFlatNum.toLocaleString()}`;
      } else {
        total = baselineRate * effectiveFloor;
        appliedRate = total;
        formulaDesc = `Baseline flat estimate: ${effectiveFloor} seats × ₦${baselineRate.toLocaleString()} = ₦${total.toLocaleString()}`;
      }
    } else if (billingModel === 'CUSTOM_CONTRACT') {
      if (customFlatNum && customFlatNum > 0) {
        total = customFlatNum;
        appliedRate = customFlatNum;
        isOverride = true;
        formulaDesc = `Bespoke contract flat: ₦${customFlatNum.toLocaleString()}`;
      } else if (customRateNum && customRateNum > 0) {
        appliedRate = customRateNum;
        total = billableStudents * appliedRate;
        isOverride = true;
        formulaDesc = `${billableStudents} billable seats × ₦${appliedRate.toLocaleString()} (agreed school rate)`;
      } else {
        appliedRate = baselineRate;
        total = billableStudents * appliedRate;
        formulaDesc = `${billableStudents} billable seats × ₦${appliedRate.toLocaleString()} (platform default)`;
      }
    } else {
      // PER_STUDENT_TERM
      if (customRateNum && customRateNum > 0) {
        appliedRate = customRateNum;
        isOverride = true;
        formulaDesc = `${billableStudents} billable seats × ₦${appliedRate.toLocaleString()}/seat (Agreed School Price)`;
      } else {
        appliedRate = baselineRate;
        isOverride = false;
        formulaDesc = `${billableStudents} billable seats × ₦${appliedRate.toLocaleString()}/seat (Platform Default Price)`;
      }
      total = billableStudents * appliedRate;
    }

    return {
      billableStudents,
      effectiveFloor,
      appliedRate,
      isOverride,
      total,
      formulaDesc,
    };
  }, [
    school.activeStudentCount,
    billingModel,
    customStudentRate,
    customFlatTermRate,
    customStudentFloor,
    platformPricing,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(school.id, {
        subscriptionTier: tier,
        billingModel,
        customStudentRate: customStudentRate ? parseFloat(customStudentRate) : null,
        customFlatTermRate: customFlatTermRate ? parseFloat(customFlatTermRate) : null,
        customStudentFloor: customStudentFloor ? parseInt(customStudentFloor, 10) : null,
        subscriptionStatus: status,
        isLocked,
        lockReason: isLocked ? lockReason || 'Locked by Platform Super Admin' : null,
        subscriptionExpiresAt: expiryDate ? new Date(expiryDate).toISOString() : null,
        gracePeriodEndsAt: graceDate ? new Date(graceDate).toISOString() : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearCustomRates = () => {
    setCustomStudentRate('');
    setCustomFlatTermRate('');
    setCustomStudentFloor('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Configure Pricing & Access: {school.schoolName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {school.activeStudentCount} Live Students • {school.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Agreed Rate Per Student Seat */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Agreed Price Per Student Seat (₦)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Termly fee per student seat agreed with this school. If empty, the platform default rate of{' '}
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ₦{platformPricing.standardRatePerStudent.toLocaleString()}
                  </span>{' '}
                  applies automatically.
                </p>
              </div>
              {customStudentRate && (
                <button
                  type="button"
                  onClick={() => setCustomStudentRate('')}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Use Default Rate
                </button>
              )}
            </div>

            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono text-sm font-semibold">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={customStudentRate}
                onChange={(e) => setCustomStudentRate(e.target.value)}
                placeholder={`Platform Default: ${platformPricing.standardRatePerStudent}`}
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Billing Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Billing Model
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'PER_STUDENT_TERM', label: 'Per Student Seat / Term' },
                { id: 'FLAT_FEE_TERM', label: 'Flat Fee / Term' },
                { id: 'CUSTOM_CONTRACT', label: 'Custom Contract' },
              ].map((model) => (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => setBillingModel(model.id as BillingModel)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    billingModel === model.id
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Terms (Floor & Flat Fee) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              Special Contract Terms (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Custom Student Floor */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Agreed Minimum Seat Floor
                </label>
                <input
                  type="number"
                  min="0"
                  value={customStudentFloor}
                  onChange={(e) => setCustomStudentFloor(e.target.value)}
                  placeholder={`Platform Default: ${platformPricing.minimumStudentFloor}`}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>

              {/* Custom Flat Term Rate */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Custom Flat Term Fee (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-mono">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={customFlatTermRate}
                    onChange={(e) => setCustomFlatTermRate(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Invoice Simulation Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Live Invoice Calculation Simulator
              </span>
              {simulation.isOverride ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  Dynamic Override Applied
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                  Platform Baseline Active
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Active Students</p>
                <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">{school.activeStudentCount}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Applied Floor</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">{simulation.effectiveFloor}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Billable Students</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">{simulation.billableStudents}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Computed Termly Sum</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                  ₦{simulation.total.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 font-mono">
              {simulation.formulaDesc}
            </p>
          </div>

          {/* Lifecycle & Emergency Lock Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Subscription State
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium transition-colors"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="GRACE_PERIOD">GRACE_PERIOD</option>
                <option value="TRIAL">TRIAL</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="LOCKED">LOCKED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Subscription Expiry
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              >
              </input>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Grace Period Ends
              </label>
              <input
                type="date"
                value={graceDate}
                onChange={(e) => setGraceDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              >
              </input>
            </div>
          </div>

          {/* Emergency Tenant Lockout Switch */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Emergency Workspace Lockout
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLocked(!isLocked)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLocked
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'WORKSPACE LOCKED' : 'UNLOCKED'}</span>
              </button>
            </div>

            {isLocked && (
              <div>
                <label className="block text-[11px] font-medium text-rose-700 dark:text-rose-300 mb-1">
                  Lock Reason (Displayed to School Admin upon login)
                </label>
                <textarea
                  rows={2}
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="e.g. Account suspended due to overdue term payment. Contact finance@schola.xyz."
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Configuration...' : 'Save Tenant Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
