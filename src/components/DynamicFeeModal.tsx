import React, { useMemo, useState } from 'react';
import type { BillingModel, PlatformPricingConfig, SubscriptionStatus, SubscriptionTier, TenantSchool } from '@/types';
import { Button, Field, Input, Modal, MoneyInput, Segmented, Select, Textarea, naira } from '@/components/ui';

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
      planLimits: { students?: number | null; staff?: number | null } | null;
    },
  ) => Promise<void>;
}

const day = (iso?: string | null) => (iso ? iso.split('T')[0] : '');

const Form: React.FC<{ school: TenantSchool } & Omit<DynamicFeeModalProps, 'school' | 'isOpen'>> = ({ school, platformPricing, onClose, onSave }) => {
  const [model, setModel] = useState<BillingModel>(school.billingModel);
  const [rate, setRate] = useState(school.customStudentRate ? String(school.customStudentRate) : '');
  const [flat, setFlat] = useState(school.customFlatTermRate ? String(school.customFlatTermRate) : '');
  const [floor, setFloor] = useState(school.customStudentFloor ? String(school.customStudentFloor) : '');
  const [status, setStatus] = useState<SubscriptionStatus>(school.subscriptionStatus);
  const [expiry, setExpiry] = useState(day(school.subscriptionExpiresAt));
  const [grace, setGrace] = useState(day(school.gracePeriodEndsAt));
  const [locked, setLocked] = useState(school.isLocked);
  const [lockReason, setLockReason] = useState(school.lockReason || '');
  const [maxStudents, setMaxStudents] = useState(school.planLimits?.students != null ? String(school.planLimits.students) : '');
  const [maxStaff, setMaxStaff] = useState(school.planLimits?.staff != null ? String(school.planLimits.staff) : '');
  const [busy, setBusy] = useState(false);

  // Live bill, same rules as the server.
  const bill = useMemo(() => {
    const base = platformPricing.standardRatePerStudent;
    const effFloor = floor ? parseInt(floor, 10) : platformPricing.minimumStudentFloor;
    // Same rules as the server: at least the minimum, at most the cap (never below the minimum).
    const cap = platformPricing.maximumBilledStudents > 0 ? Math.max(platformPricing.maximumBilledStudents, effFloor) : 0;
    const floored = Math.max(school.activeStudentCount, effFloor);
    const capped = cap > 0 && floored > cap;
    const billable = capped ? cap : floored;
    const r = rate ? parseFloat(rate) : 0;
    const f = flat ? parseFloat(flat) : 0;
    if (model === 'FLAT_FEE_TERM') {
      return f > 0
        ? { total: f, how: `Agreed flat fee of ${naira(f)} a term` }
        : { total: base * effFloor, how: `No flat fee set: ${effFloor} students × ${naira(base)}` };
    }
    if (model === 'CUSTOM_CONTRACT' && f > 0) return { total: f, how: `Contract amount of ${naira(f)} a term` };
    const used = r > 0 ? r : base;
    return {
      total: billable * used,
      how: `${billable} students × ${naira(used)} ${r > 0 ? '(agreed price)' : '(standard price)'}${
        capped ? `, capped at ${cap} (${school.activeStudentCount} active)` : billable > school.activeStudentCount ? `, minimum of ${effFloor}` : ''
      }`,
    };
  }, [model, rate, flat, floor, platformPricing, school.activeStudentCount]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(school.id, {
        subscriptionTier: 'STANDARD',
        billingModel: model,
        customStudentRate: rate ? parseFloat(rate) : null,
        customFlatTermRate: flat ? parseFloat(flat) : null,
        customStudentFloor: floor ? parseInt(floor, 10) : null,
        subscriptionStatus: status,
        isLocked: locked,
        lockReason: locked ? lockReason.trim() || 'Locked by the Schola team.' : null,
        subscriptionExpiresAt: expiry ? new Date(expiry).toISOString() : null,
        gracePeriodEndsAt: grace ? new Date(grace).toISOString() : null,
        planLimits:
          maxStudents || maxStaff
            ? { students: maxStudents ? parseInt(maxStudents, 10) : null, staff: maxStaff ? parseInt(maxStaff, 10) : null }
            : null,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      busy={busy}
      size="lg"
      title={`Plan & billing: ${school.schoolName}`}
      description={`${school.activeStudentCount} active students`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="plan-form" loading={busy}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="plan-form" onSubmit={submit} className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Price</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">How they pay</span>
              <Segmented<BillingModel>
                value={model}
                onChange={setModel}
                options={[
                  { value: 'PER_STUDENT_TERM', label: 'Per student' },
                  { value: 'FLAT_FEE_TERM', label: 'Flat fee' },
                  { value: 'CUSTOM_CONTRACT', label: 'Contract' },
                ]}
              />
            </div>
            {model !== 'FLAT_FEE_TERM' && (
              <Field label="Agreed price per student" hint={`Empty = standard price (${naira(platformPricing.standardRatePerStudent)}).`}>
                <MoneyInput step="50" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={String(platformPricing.standardRatePerStudent)} />
              </Field>
            )}
            {model !== 'PER_STUDENT_TERM' && (
              <Field label={model === 'FLAT_FEE_TERM' ? 'Flat fee per term' : 'Contract amount per term (optional)'}>
                <MoneyInput step="1000" value={flat} onChange={(e) => setFlat(e.target.value)} placeholder="0" />
              </Field>
            )}
            <Field label="Minimum students billed" hint={`Empty = standard minimum (${platformPricing.minimumStudentFloor}).`}>
              <Input type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder={String(platformPricing.minimumStudentFloor)} className="tabular" />
            </Field>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">Bill per term</span>
              <span className="text-xl font-semibold text-slate-900 tabular dark:text-white">{naira(bill.total)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{bill.how}</p>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Subscription</h3>
          {school.plan && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              Right now: <strong className="text-slate-900 dark:text-white">{school.plan.label}</strong>
              {school.plan.state === 'TRIAL' && ' (every feature unlocked)'}
              {school.plan.state === 'FREE' && ` (up to ${school.plan.limits.students} students and ${school.plan.limits.staff} staff, watermarked report cards, no publishing or AI)`}
              {school.plan.state === 'PAID' && ' (every feature)'}
              . To give them a paid plan, set Status to Active and the Paid until date.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}>
                <option value="TRIAL">Free trial</option>
                <option value="ACTIVE">Active (paid)</option>
                <option value="GRACE_PERIOD">Payment overdue</option>
                <option value="EXPIRED">Expired</option>
                <option value="LOCKED">Locked</option>
              </Select>
            </Field>
            <Field label={status === 'TRIAL' ? 'Trial ends' : 'Paid until'}>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </Field>
            <Field label="Grace period ends">
              <Input type="date" value={grace} onChange={(e) => setGrace(e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Free plan limits</h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Applies only when the school isn't on a trial or a paid plan. Empty = standard (100 students, 10 staff).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Students allowed">
              <Input type="number" min="0" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} placeholder="100" className="tabular" />
            </Field>
            <Field label="Staff allowed">
              <Input type="number" min="0" value={maxStaff} onChange={(e) => setMaxStaff(e.target.value)} placeholder="10" className="tabular" />
            </Field>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="mt-0.5 size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block text-sm font-medium text-slate-900 dark:text-white">Lock the school admin out (billing)</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">
                Only the school admin is blocked; teachers and students keep working. To stop everyone, use <em>Suspend school</em> instead.
              </span>
            </span>
          </label>
          {locked && (
            <Field label="Message shown to the school admin">
              <Textarea rows={2} value={lockReason} onChange={(e) => setLockReason(e.target.value)} placeholder="e.g. Your subscription has expired. Please renew to continue." />
            </Field>
          )}
        </section>
      </form>
    </Modal>
  );
};

export const DynamicFeeModal: React.FC<DynamicFeeModalProps> = ({ school, isOpen, ...rest }) =>
  isOpen && school ? <Form key={school.id} school={school} {...rest} /> : null;
