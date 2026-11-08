import React, { useMemo, useState } from 'react';
import { Eye, Plus, Receipt, Search } from 'lucide-react';
import type { SubscriptionTransaction } from '@/types';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Segmented, Textarea, humanize, naira, shortDate } from '@/components/ui';

interface ReconciliationQueueProps {
  transactions: SubscriptionTransaction[];
  onApprove: (txId: string, auditorNote?: string) => Promise<void>;
  onReject: (txId: string, auditorNote: string) => Promise<void>;
  onOpenManualModal: () => void;
  isLoading: boolean;
}

type StatusFilter = 'PENDING' | 'SUCCESSFUL' | 'REJECTED' | 'ALL';

const StatusBadge: React.FC<{ tx: SubscriptionTransaction }> = ({ tx }) =>
  tx.status === 'PENDING' ? (
    <Badge tone="warning" dot>To confirm</Badge>
  ) : tx.status === 'SUCCESSFUL' ? (
    <Badge tone="success" dot>Confirmed</Badge>
  ) : (
    <Badge tone="danger" dot>Rejected</Badge>
  );

export const ReconciliationQueue: React.FC<ReconciliationQueueProps> = ({ transactions, onApprove, onReject, onOpenManualModal, isLoading }) => {
  const [status, setStatus] = useState<StatusFilter>('PENDING');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<SubscriptionTransaction | null>(null);
  const [rejecting, setRejecting] = useState<SubscriptionTransaction | null>(null);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      PENDING: transactions.filter((t) => t.status === 'PENDING').length,
      SUCCESSFUL: transactions.filter((t) => t.status === 'SUCCESSFUL').length,
      REJECTED: transactions.filter((t) => t.status === 'REJECTED').length,
      ALL: transactions.length,
    }),
    [transactions],
  );

  const visible = transactions.filter((t) => {
    if (status !== 'ALL' && t.status !== status) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [t.reference, t.schoolName, t.school?.schoolName, t.depositorName, t.tellerNumber].some((v) => v?.toLowerCase().includes(q));
  });

  const approve = async (tx: SubscriptionTransaction) => {
    setBusyId(tx.id);
    try {
      await onApprove(tx.id, 'Confirmed against the bank statement.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await onReject(rejecting.id, note.trim() || "We couldn't find this payment in our bank account.");
      setRejecting(null);
      setNote('');
    } finally {
      setBusyId(null);
    }
  };

  const schoolName = (t: SubscriptionTransaction) => t.schoolName || t.school?.schoolName || 'Unknown school';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: 'PENDING', label: 'To confirm', count: counts.PENDING },
            { value: 'SUCCESSFUL', label: 'Confirmed', count: counts.SUCCESSFUL },
            { value: 'REJECTED', label: 'Rejected', count: counts.REJECTED },
            { value: 'ALL', label: 'All', count: counts.ALL },
          ]}
        />
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school or reference" className="pl-9" />
          </div>
          <Button variant="secondary" icon={<Plus className="size-4" />} onClick={onOpenManualModal}>
            <span className="hidden sm:inline">Record payment</span>
          </Button>
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-5" />}
            title={isLoading ? 'Loading…' : status === 'PENDING' ? 'No payments to confirm' : 'No payments here'}
            text={status === 'PENDING' && !isLoading ? 'Bank transfers schools upload will appear here.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{schoolName(t)}</span>
                    <StatusBadge tx={t} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {t.term} · {humanize(t.paymentMethod)}
                    {t.bankName ? ` · ${t.bankName}` : ''}
                    {t.depositorName ? ` · from ${t.depositorName}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Ref {t.tellerNumber || t.reference} · {shortDate(t.createdAt)}
                    {t.status !== 'PENDING' && t.auditorNote ? ` · “${t.auditorNote}”` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right">
                    <div className="font-semibold text-slate-900 tabular dark:text-white">{naira(t.amount)}</div>
                    {t.appliedUnitRate ? (
                      <div className="text-xs text-slate-500 tabular">{t.billedStudentCount ?? '—'} students × {naira(t.appliedUnitRate)}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {t.proofUrl && (
                      <Button size="sm" variant="ghost" icon={<Eye className="size-4" />} onClick={() => setViewing(t)}>
                        Proof
                      </Button>
                    )}
                    {t.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="secondary" disabled={busyId === t.id} onClick={() => setRejecting(t)}>
                          Reject
                        </Button>
                        <Button size="sm" variant="success" loading={busyId === t.id} onClick={() => approve(t)}>
                          Confirm
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Payment proof"
        description={viewing ? `${schoolName(viewing)} · ${naira(viewing.amount)}` : undefined}
        footer={<Button onClick={() => setViewing(null)}>Close</Button>}
      >
        {viewing?.proofUrl ? (
          <div className="space-y-4">
            <a href={viewing.proofUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <img src={viewing.proofUrl} alt="Payment proof" className="mx-auto max-h-[60vh] w-auto object-contain" />
            </a>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Bank', viewing.bankName || '—'],
                ['Teller / reference', viewing.tellerNumber || viewing.reference],
                ['Paid by', viewing.depositorName || '—'],
                ['Amount', naira(viewing.amount)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        busy={busyId === rejecting?.id}
        size="sm"
        title="Reject this payment?"
        description={rejecting ? `${schoolName(rejecting)} · ${naira(rejecting.amount)}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busyId === rejecting?.id} onClick={reject}>
              Reject payment
            </Button>
          </>
        }
      >
        <Field label="Reason" hint="Saved with the payment record.">
          <Textarea rows={3} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Not found on the bank statement; amount doesn't match." />
        </Field>
      </Modal>
    </div>
  );
};
