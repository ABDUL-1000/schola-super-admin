import type { TenantSchool } from '@/types';
import type { Tone } from '@/components/ui';

export type SchoolStateKey = 'suspended' | 'pending' | 'rejected' | 'locked' | 'trial' | 'active' | 'grace' | 'expired' | 'free';

export interface SchoolState {
  key: SchoolStateKey;
  label: string;
  tone: Tone;
  /** One short line explaining the state (shown under the badge). */
  detail?: string;
}

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

/** The one status that matters most for a school, in plain words. */
export function schoolState(s: TenantSchool): SchoolState {
  if (s.accountStatus === 'SUSPENDED') return { key: 'suspended', label: 'Suspended', tone: 'danger', detail: s.lockReason || undefined };
  if (s.onboardingStatus === 'PENDING_APPROVAL') return { key: 'pending', label: 'Awaiting approval', tone: 'warning' };
  if (s.onboardingStatus === 'REJECTED') return { key: 'rejected', label: 'Not approved', tone: 'neutral', detail: s.rejectionReason || undefined };
  if (s.isLocked) return { key: 'locked', label: 'Locked', tone: 'danger', detail: s.lockReason || undefined };
  // Trial over / not paid: the school keeps working on the free plan (capped, watermarked).
  if (s.plan?.state === 'FREE') {
    const lim = s.plan.limits;
    const over = [
      lim.students !== null && s.activeStudentCount > lim.students ? `${s.activeStudentCount}/${lim.students} students` : null,
      lim.staff !== null && s.activeStaffCount > lim.staff ? `${s.activeStaffCount}/${lim.staff} staff` : null,
    ].filter(Boolean);
    return {
      key: 'free',
      label: 'Free plan',
      tone: 'warning',
      detail: over.length
        ? `Over the free limit: ${over.join(', ')}`
        : s.subscriptionStatus === 'TRIAL' && fmt(s.subscriptionExpiresAt)
          ? `Trial ended ${fmt(s.subscriptionExpiresAt)}`
          : 'Not paid',
    };
  }
  switch (s.subscriptionStatus) {
    case 'TRIAL':
      return {
        key: 'trial',
        label: 'Free trial',
        tone: 'brand',
        detail: fmt(s.subscriptionExpiresAt)
          ? `Ends ${fmt(s.subscriptionExpiresAt)}${s.plan?.daysLeft != null ? ` (${s.plan.daysLeft} day${s.plan.daysLeft === 1 ? '' : 's'} left)` : ''}`
          : undefined,
      };
    case 'GRACE_PERIOD':
      return { key: 'grace', label: 'Payment overdue', tone: 'warning', detail: fmt(s.gracePeriodEndsAt) ? `Grace until ${fmt(s.gracePeriodEndsAt)}` : undefined };
    case 'EXPIRED':
      return { key: 'expired', label: 'Expired', tone: 'danger', detail: fmt(s.subscriptionExpiresAt) ? `Ended ${fmt(s.subscriptionExpiresAt)}` : undefined };
    case 'LOCKED':
    case 'SUSPENDED':
      return { key: 'locked', label: 'Locked', tone: 'danger', detail: s.lockReason || undefined };
    default:
      return { key: 'active', label: 'Active', tone: 'success', detail: fmt(s.subscriptionExpiresAt) ? `Paid until ${fmt(s.subscriptionExpiresAt)}` : undefined };
  }
}

/** One paid plan: Standard. Older schools saved as CBT Pro / AI Elite are Standard too. */
export const PLAN_LABEL: Record<string, string> = {
  STANDARD: 'Standard',
  CBT_PRO: 'Standard',
  AI_ELITE: 'Standard',
};

export const BILLING_LABEL: Record<string, string> = {
  PER_STUDENT_TERM: 'Per student, per term',
  FLAT_FEE_TERM: 'Flat fee per term',
  CUSTOM_CONTRACT: 'Custom contract',
};
