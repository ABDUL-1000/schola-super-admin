import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Building2,
  CreditCard,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { PaymentMethod, TenantSchool } from '@/types';

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

export const RecordManualPaymentModal: React.FC<RecordManualPaymentModalProps> = ({
  schools,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools[0]?.id || '',
  );
  const [amount, setAmount] = useState<string>('');
  const [term, setTerm] = useState<string>('First Term 2025/2026');
  const [academicSession, setAcademicSession] = useState<string>('2025/2026');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MANUAL_WIRE');
  const [bankName, setBankName] = useState<string>('First Bank of Nigeria');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [tellerNumber, setTellerNumber] = useState<string>('');
  const [depositorName, setDepositorName] = useState<string>('');
  const [auditorNote, setAuditorNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  // Auto-fill suggested amount based on school's computed bill
  const handleSchoolChange = (id: string) => {
    setSelectedSchoolId(id);
    const target = schools.find((s) => s.id === id);
    if (target && target.computedBilling?.totalAmount) {
      setAmount(String(target.computedBilling.totalAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId || !amount || !term) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        schoolId: selectedSchoolId,
        amount: parseFloat(amount),
        term,
        academicSession,
        paymentMethod,
        bankName,
        accountNumber,
        tellerNumber,
        depositorName,
        auditorNote,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-8 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Offline Bank / Cash Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Post transaction directly into platform financial ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target School */}
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
              Select Tenant School
            </label>
            <select
              required
              value={selectedSchoolId}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.schoolName} ({school.activeStudentCount} students • {school.subscriptionTier})
                </option>
              ))}
            </select>
          </div>

          {selectedSchool && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between font-mono">
              <span className="text-slate-500 dark:text-slate-400">Termly Computed Estimate:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ₦{selectedSchool.computedBilling.totalAmount.toLocaleString()} ({selectedSchool.computedBilling.billableStudentCount} seats × ₦{selectedSchool.computedBilling.appliedRate})
              </span>
            </div>
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Realized Amount (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono">₦</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium transition-colors"
              >
                <option value="MANUAL_WIRE">Direct Bank Wire / NIP</option>
                <option value="OFFLINE_BANK_TRANSFER">Bank Teller Deposit</option>
                <option value="MANUAL_CASH">Cash / Draft to Representative</option>
              </select>
            </div>
          </div>

          {/* Term & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Billed Term
              </label>
              <input
                type="text"
                required
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. First Term 2025/2026"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                placeholder="2025/2026"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Bank & Teller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="First Bank, GTB..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Teller / Ref No.
              </label>
              <input
                type="text"
                value={tellerNumber}
                onChange={(e) => setTellerNumber(e.target.value)}
                placeholder="Optional teller/cheque #"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Depositor / Sender Name
              </label>
              <input
                type="text"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="e.g. School Bursary"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Auditor Note */}
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
              Auditor Note / Ledger Reference
            </label>
            <textarea
              rows={2}
              value={auditorNote}
              onChange={(e) => setAuditorNote(e.target.value)}
              placeholder="e.g. Payment verified against Zenith Treasury Statement page 4, item 12."
              className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Ledger Entry...' : 'Post & Activate School'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
