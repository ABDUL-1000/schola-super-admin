import React, { useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import type { OnboardingQueueItem, SubscriptionTier } from '@/types';
import { APP_DOMAIN } from '@/lib/api';
import { PLAN_LABEL } from '@/lib/school-status';
import { Avatar, Button, Field, Modal, MoneyInput, Select, Textarea, humanize, shortDate } from '@/components/ui';

interface OnboardingReviewModalProps {
  school: OnboardingQueueItem;
  onClose: () => void;
  onApprove: (id: string, options: { initialPlan: SubscriptionTier; trialDays: number; customRate?: number }) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex justify-between gap-4 py-2 text-sm">
    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="text-right font-medium text-slate-900 dark:text-white">{children}</dd>
  </div>
);

export const OnboardingReviewModal: React.FC<OnboardingReviewModalProps> = ({ school, onClose, onApprove, onReject }) => {
  const [plan, setPlan] = useState<SubscriptionTier>(school.subscriptionTier || 'STANDARD');
  const [trialDays, setTrialDays] = useState(14);
  const [customRate, setCustomRate] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const unverified = school.isVerified === false;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onClose();
    } catch {
      /* error already shown as a toast; keep the dialog open to retry */
    } finally {
      setBusy(false);
    }
  };

  const location = [school.city, school.state].filter(Boolean).join(', ');

  return (
    <Modal
      open
      onClose={onClose}
      busy={busy}
      title={rejecting ? `Decline ${school.schoolName}` : 'Review application'}
      description={rejecting ? 'The school will get an email with your reason.' : undefined}
      footer={
        rejecting ? (
          <>
            <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
              Back
            </Button>
            <Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={() => run(() => onReject(school.id, reason.trim()))}>
              Decline application
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="sm:mr-auto text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400" onClick={() => setRejecting(true)} disabled={busy}>
              Decline…
            </Button>
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={busy}
              disabled={unverified}
              title={unverified ? "The school hasn't verified its email yet" : undefined}
              onClick={() =>
                run(() => onApprove(school.id, { initialPlan: plan, trialDays, customRate: customRate.trim() ? Number(customRate) : undefined }))
              }
            >
              Approve school
            </Button>
          </>
        )
      }
    >
      {rejecting ? (
        <Field label="Reason">
          <Textarea
            rows={4}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. We couldn't confirm the school's registration details. Please reply with your CAC number."
          />
        </Field>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={school.schoolName} src={school.logo} />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{school.schoolName}</p>
              <p className="truncate text-sm text-slate-500">{school.slug}.{APP_DOMAIN}</p>
            </div>
          </div>

          {unverified ? (
            <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              This school hasn't confirmed its email yet, so it can't be approved. It may be a typo or an abandoned sign-up.
            </div>
          ) : (
            <div className="flex gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              Email verified. Approving emails the school a link to set up its branches, session and classes.
            </div>
          )}

          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 px-4 dark:divide-slate-800 dark:border-slate-800">
            <Row label="Contact person">{school.fullname}</Row>
            <Row label="Email">
              <a href={`mailto:${school.email}`} className="text-brand-600 hover:underline dark:text-brand-200">{school.email}</a>
            </Row>
            <Row label="Phone">{school.phone || '—'}</Row>
            <Row label="Location">{location || '—'}</Row>
            {school.schoolType && <Row label="Type">{humanize(school.schoolType)}</Row>}
            <Row label="Signed up">{shortDate(school.createdAt)}</Row>
          </dl>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan">
              <Select value={plan} onChange={(e) => setPlan(e.target.value as SubscriptionTier)}>
                {Object.entries(PLAN_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Free trial">
              <Select value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
              </Select>
            </Field>
            <Field label="Agreed price per student (optional)" hint="Leave empty to use your standard price." className="sm:col-span-2">
              <MoneyInput step="50" value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Standard price" />
            </Field>
          </div>
        </div>
      )}
    </Modal>
  );
};
