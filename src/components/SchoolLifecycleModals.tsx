import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { DeletionPreview, TenantSchool } from '@/types';
import { api } from '@/lib/api';
import { Button, Field, Input, Modal, Textarea } from '@/components/ui';

/** Suspend: the school and all its staff, students and parents are blocked until reactivated. */
export const SuspendSchoolModal: React.FC<{
  school: TenantSchool | null;
  onClose: () => void;
  onConfirm: (school: TenantSchool, reason: string) => Promise<void>;
}> = ({ school, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setReason(''), [school?.id]);
  if (!school) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm(school, reason.trim());
      onClose();
    } catch {
      /* error already shown */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      busy={busy}
      size="sm"
      title={`Suspend ${school.schoolName}?`}
      description="You can reactivate the school at any time."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={busy}>
            Suspend school
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <li>• The school admin, teachers, students and parents can't sign in.</li>
          <li>• Nothing is deleted; all data stays as it is.</li>
          <li>• We'll email the school the reason below.</li>
        </ul>
        <Field label="Reason" hint="Shown to the school and included in the email.">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. First term invoice is unpaid." autoFocus />
        </Field>
      </div>
    </Modal>
  );
};

/** Permanently delete a school. Shows what will be removed and asks for the school's name. */
export const DeleteSchoolModal: React.FC<{
  school: TenantSchool | null;
  onClose: () => void;
  onConfirm: (school: TenantSchool, confirmName: string) => Promise<void>;
}> = ({ school, onClose, onConfirm }) => {
  const [preview, setPreview] = useState<DeletionPreview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTyped('');
    setPreview(null);
    setPreviewError('');
    if (!school) return;
    let live = true;
    api
      .getDeletionPreview(school.id)
      .then((p) => live && setPreview(p))
      .catch((e) => live && setPreviewError(e?.response?.data?.message || 'Could not load what will be deleted.'));
    return () => {
      live = false;
    };
  }, [school?.id]);

  if (!school) return null;
  const matches = typed.trim() === school.schoolName.trim();

  const submit = async () => {
    if (!matches) return;
    setBusy(true);
    try {
      await onConfirm(school, typed.trim());
      onClose();
    } catch {
      /* error already shown */
    } finally {
      setBusy(false);
    }
  };

  const c = preview?._count;
  const rows: Array<[string, number | undefined]> = [
    ['Students', c?.students],
    ['Staff', c?.staffs],
    ['Classes', c?.classes],
    ['Branches', c?.branches],
    ['Fee payments', c?.feePayments],
    ['Uploaded files', preview?.fileCount],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      busy={busy}
      size="sm"
      title="Delete school permanently"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={busy} disabled={!matches}>
            Delete forever
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            This removes <strong>{school.schoolName}</strong> and everything in it: staff, students, parents' access,
            classes, results, exams, attendance, fees, payments and uploaded files. <strong>It can't be undone.</strong>
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-800">What will be deleted</div>
          {previewError ? (
            <p className="px-3 py-3 text-sm text-red-600">{previewError}</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-3 py-3 text-sm sm:grid-cols-3">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900 tabular dark:text-white">{v === undefined ? '…' : v.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <Field label={`Type "${school.schoolName}" to confirm`}>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" placeholder={school.schoolName} />
        </Field>
      </div>
    </Modal>
  );
};
