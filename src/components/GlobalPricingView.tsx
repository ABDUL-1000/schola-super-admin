import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PlatformPricingConfig } from '@/types';

interface GlobalPricingViewProps {
  pricing: PlatformPricingConfig;
  onSavePricing: (data: {
    standardRatePerStudent: number;
    cbtProRatePerStudent: number;
    aiEliteRatePerStudent: number;
    minimumStudentFloor: number;
    defaultGracePeriodDays: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export const GlobalPricingView: React.FC<GlobalPricingViewProps> = ({
  pricing,
  onSavePricing,
  isLoading,
}) => {
  const [standardRate, setStandardRate] = useState<number>(
    pricing.standardRatePerStudent,
  );
  const [cbtProRate, setCbtProRate] = useState<number>(
    pricing.cbtProRatePerStudent,
  );
  const [aiEliteRate, setAiEliteRate] = useState<number>(
    pricing.aiEliteRatePerStudent,
  );
  const [minFloor, setMinFloor] = useState<number>(
    pricing.minimumStudentFloor,
  );
  const [graceDays, setGraceDays] = useState<number>(
    pricing.defaultGracePeriodDays,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      await onSavePricing({
        standardRatePerStudent: Number(standardRate),
        cbtProRatePerStudent: Number(cbtProRate),
        aiEliteRatePerStudent: Number(aiEliteRate),
        minimumStudentFloor: Number(minFloor),
        defaultGracePeriodDays: Number(graceDays),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Platform Default Seat Pricing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Global baseline price per student seat. Individual schools can be assigned specific agreed rates directly in their tenant settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-semibold">
              Active Config: v{pricing.version}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Main Default Rate Per Student */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Default Price Per Student Seat (₦)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Termly fee charged per student seat when no custom agreed rate is specified for a school.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-medium">
                Baseline / Student / Term
              </span>
            </div>

            <div className="relative max-w-sm pt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono text-sm font-semibold">₦</span>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={standardRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStandardRate(val);
                  setCbtProRate(val);
                  setAiEliteRate(val);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="500"
              />
            </div>
          </div>

          {/* Seat Floor & Grace Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Minimum Student Headcount Floor
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Any school with fewer active students than this floor will be billed for at least this minimum seat threshold unless custom floor is overridden.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  min="1"
                  required
                  value={minFloor}
                  onChange={(e) => setMinFloor(Number(e.target.value))}
                  className="w-36 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">active student floor</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Default Grace Period Window (Days)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Number of buffer days granted after term subscription expires before automatic lockouts engage.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={graceDays}
                  onChange={(e) => setGraceDays(Number(e.target.value))}
                  className="w-36 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">days grace period</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Updating creates a new versioned pricing record in the database.</span>
            </div>

            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Baseline rates published!
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Publishing Version...' : 'Publish Global Rates'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
