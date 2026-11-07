import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { OnboardingQueueItem, SubscriptionTier } from '@/types';
import { APP_DOMAIN } from '@/lib/api';

interface OnboardingReviewModalProps {
  school: OnboardingQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, options: {
    initialPlan: SubscriptionTier;
    trialDays: number;
    customRate?: number;
  }) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const OnboardingReviewModal: React.FC<OnboardingReviewModalProps> = ({
  school,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !school) return null;

  // Form State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    school.subscriptionTier || 'STANDARD'
  );
  const [trialDays, setTrialDays] = useState<number>(14);
  const [customRate, setCustomRate] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleApproveSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(school.id, {
        initialPlan: selectedPlan,
        trialDays: Number(trialDays) || 14,
        customRate: customRate.trim() ? Number(customRate) : undefined,
      });
      onClose();
    } catch {
      // Error already shown as a toast; keep the modal open so they can retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason for the school administrator.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(school.id, rejectionReason.trim());
      onClose();
    } catch {
      // Error already shown as a toast; keep the modal open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{school.schoolName}</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Subdomain: {school.slug}.{APP_DOMAIN} • Registered on{' '}
                {new Date(school.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Signup checklist */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-2">
            {school.logo && (
              <img src={school.logo} alt="School logo" className="w-10 h-10 rounded object-contain bg-white border border-slate-200 dark:border-slate-700" />
            )}
            {[
              { label: 'Email verified (OTP)', ok: school.isVerified !== false },
              { label: 'School profile', ok: !!school.setup?.profile },
              { label: 'Branches', ok: !!school.setup?.branches },
              { label: 'Academic session', ok: !!school.setup?.academic },
            ].map((s) => (
              <span key={s.label} className={`flex items-center gap-1 font-medium ${s.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {s.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {s.label}
              </span>
            ))}
            {school.isVerified === false && (
              <p className="w-full text-[11px] text-rose-600 dark:text-rose-400">
                This school hasn't confirmed its email yet, so it can't be approved. It may be a typo or an abandoned signup.
              </p>
            )}
          </div>
          {/* Section 1: School & Administrator Identity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Primary Contact Person */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Primary School Admin</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{school.fullname}</p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${school.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {school.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{school.phone}</span>
                </div>
              </div>
            </div>

            {/* Geographical & Campus Details */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location & Campus</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {school.state || 'State Unspecified'}, {school.city || school.country || 'Nigeria'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {school.address || 'Address not provided during registration'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {school.schoolType || 'SINGLE_BRANCH'}
                </span>
                {school.curriculumType && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {school.curriculumType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Expected Student Population Banner */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Proposed Student Seats</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  ~{school.proposedStudentPopulation.toLocaleString()} Students
                </p>
              </div>
            </div>
            <div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-slate-800 px-2.5 py-1 rounded border border-indigo-200 dark:border-slate-700 font-semibold">
                Model: {school.billingModel || 'PER_STUDENT_TERM'}
              </span>
            </div>
          </div>

          {/* Section 3: Decision Flow (Approve Form vs Reject Box) */}
          {!isRejecting ? (
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                  Approval Options
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Emails the school when approved
                </span>
              </div>              {/* Agreed Price Per Student Seat */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                    Agreed Price Per Student Seat (₦)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Optional — Leave blank for platform default
                  </span>
                </div>
                <div className="relative max-w-sm">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-semibold">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder="Platform default applied (₦500)"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-600 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Initial per-seat pricing agreed with the school. Can be updated anytime after onboarding.
                </p>
              </div>

              {/* Trial Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Trial Period Duration
                </label>
                <select
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  <option value={7}>7 Days (1 Week Trial)</option>
                  <option value={14}>14 Days (Standard Recommended)</option>
                  <option value={30}>30 Days (Full Month)</option>
                  <option value={60}>60 Days (Extended Enterprise)</option>
                </select>
              </div>
            </div>
          ) : (
            /* Rejection Reason Form */
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 font-mono uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Specify Rejection Reason (Sent to School Admin)</span>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain why this school registration cannot be approved..."
                className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This notice will be recorded and sent to {school.email}.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          {!isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 transition-colors"
              >
                Reject Application...
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || school.isVerified === false}
                  title={school.isVerified === false ? "The school hasn't verified its email (OTP) yet" : undefined}
                  onClick={handleApproveSubmit}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Approving...' : 'Approve & Activate School'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Back to Approval Options
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

