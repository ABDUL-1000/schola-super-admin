import React, { useState } from 'react';
import type { PaymentMethod, TenantSchool } from '@/types';
import { Button, Field, Input, Modal, MoneyInput, Select, Textarea, naira } from '@/components/ui';

interface RecordManualPaymentModalProps {
  schools: TenantSchool[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    schoolId: string;
    amount: number;
    term: string;
    academicSession: string;
    paymentMethod: PaymentMethod;
    bankName?: string;
    accountNumber?: string;
    tellerNumber?: string;
    depositorName?: string;
    auditorNote?: string;
  }) => Promise<void>;
}

/** Default to the current Nigerian school session (Sept → July). */
const currentSession = () => {
  const d = new Date();
  const start = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}/${start + 1}`;
};

const Form: React.FC<Omit<RecordManualPaymentModalProps, 'isOpen'>> = ({ schools, onClose, onSubmit }) => {
  const billable = schools.filter((s) => s.onboardingStatus === 'APPROVED');
  const [schoolId, setSchoolId] = useState(billable[0]?.id || '');
  const school = billable.find((s) => s.id === schoolId);
  const [amount, setAmount] = useState(school?.computedBilling?.totalAmount ? String(school.computedBilling.totalAmount) : '');
  const [session, setSession] = useState(currentSession());
  const [term, setTerm] = useState(`First Term ${currentSession()}`);
  const [method, setMethod] = useState<PaymentMethod>('MANUAL_WIRE');
  const [bankName, setBankName] = useState('');
  const [teller, setTeller] = useState('');
  const [depositor, setDepositor] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = (id: string) => {
    setSchoolId(id);
    const s = billable.find((x) => x.id === id);
    if (s?.computedBilling?.totalAmount) setAmount(String(s.computedBilling.totalAmount));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !amount || !term) return;
    setBusy(true);
    try {
      await onSubmit({
        schoolId,
        amount: parseFloat(amount),
        term,
        academicSession: session,
        paymentMethod: method,
        bankName: bankName || undefined,
        tellerNumber: teller || undefined,
        depositorName: depositor || undefined,
        auditorNote: note || undefined,
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
      title="Record a payment"
      description="For a bank transfer or cash payment you've already received. The school's subscription is activated."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="manual-payment" loading={busy} disabled={!schoolId}>
            Record payment
          </Button>
        </>
      }
    >
      <form id="manual-payment" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="School" className="sm:col-span-2" hint={school ? `This term's bill: ${naira(school.computedBilling.totalAmount)} (${school.computedBilling.billableStudentCount} students × ${naira(school.computedBilling.appliedRate)})` : undefined}>
          <Select required value={schoolId} onChange={(e) => pick(e.target.value)}>
            {billable.length === 0 && <option value="">No approved schools</option>}
            {billable.map((s) => (
              <option key={s.id} value={s.id}>{s.schoolName}</option>
            ))}
          </Select>
        </Field>
        <Field label="Amount received">
          <MoneyInput required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Paid by">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            <option value="MANUAL_WIRE">Bank transfer</option>
            <option value="OFFLINE_BANK_TRANSFER">Bank deposit (teller)</option>
            <option value="MANUAL_CASH">Cash</option>
          </Select>
        </Field>
        <Field label="Term">
          <Input required value={term} onChange={(e) => setTerm(e.target.value)} placeholder="First Term 2026/2027" />
        </Field>
        <Field label="Session">
          <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="2026/2027" />
        </Field>
        <Field label="Bank (optional)">
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank" />
        </Field>
        <Field label="Reference / teller no. (optional)">
          <Input value={teller} onChange={(e) => setTeller(e.target.value)} />
        </Field>
        <Field label="Sender's name (optional)" className="sm:col-span-2">
          <Input value={depositor} onChange={(e) => setDepositor(e.target.value)} placeholder="e.g. School bursar" />
        </Field>
        <Field label="Note (optional)" className="sm:col-span-2">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
};

export const RecordManualPaymentModal: React.FC<RecordManualPaymentModalProps> = ({ isOpen, ...rest }) =>
  isOpen ? <Form {...rest} /> : null;
