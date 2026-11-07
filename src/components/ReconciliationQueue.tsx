import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  CreditCard,
  User,
} from 'lucide-react';
import { SubscriptionTransaction, TransactionStatus } from '@/types';

interface ReconciliationQueueProps {
  transactions: SubscriptionTransaction[];
  onApprove: (txId: string, auditorNote?: string) => Promise<void>;
  onReject: (txId: string, auditorNote: string) => Promise<void>;
  onOpenManualModal: () => void;
  isLoading: boolean;
}

export const ReconciliationQueue: React.FC<ReconciliationQueueProps> = ({
  transactions,
  onApprove,
  onReject,
  onOpenManualModal,
  isLoading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [search, setSearch] = useState('');
  const [inspectProofTx, setInspectProofTx] = useState<SubscriptionTransaction | null>(null);
  const [rejectingTx, setRejectingTx] = useState<SubscriptionTransaction | null>(null);
  const [auditorNote, setAuditorNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus =
      selectedStatus === 'ALL' || tx.status === selectedStatus;

    const matchesSearch =
      search === '' ||
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      (tx.schoolName && tx.schoolName.toLowerCase().includes(search.toLowerCase())) ||
      (tx.depositorName && tx.depositorName.toLowerCase().includes(search.toLowerCase())) ||
      (tx.tellerNumber && tx.tellerNumber.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (tx: SubscriptionTransaction) => {
    setProcessingId(tx.id);
    try {
      await onApprove(tx.id, 'Verified and approved by platform auditor.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTx) return;
    setProcessingId(rejectingTx.id);
    try {
      await onReject(rejectingTx.id, auditorNote || 'Receipt could not be verified in platform bank account.');
      setRejectingTx(null);
      setAuditorNote('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'PENDING', label: 'Pending Approvals' },
            { id: 'SUCCESSFUL', label: 'Cleared Inflows' },
            { id: 'REJECTED', label: 'Rejected Proofs' },
            { id: 'ALL', label: 'All Transactions' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedStatus(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Manual trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, depositor..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Record Manual</span>
          </button>
        </div>
      </div>

      {/* Proofs Queue List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-5">Receipt / Reference</th>
                <th className="py-4 px-4">School & Depositor</th>
                <th className="py-4 px-4">Bank & Teller Info</th>
                <th className="py-4 px-4 text-right">Amount (₦)</th>
                <th className="py-4 px-4 text-center">Audit Status</th>
                <th className="py-4 px-5 text-right">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Receipt className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No offline payment proofs found in this view.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPending = tx.status === 'PENDING';
                  const isBusy = processingId === tx.id;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* 1. Reference & Proof Preview Button */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {tx.reference}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>

                          {tx.proofUrl && (
                            <button
                              onClick={() => setInspectProofTx(tx)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pt-0.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Uploaded Proof</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 2. School & Depositor */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-200 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {tx.schoolName || tx.school?.schoolName || 'Unknown School'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Depositor: <strong className="text-slate-800 dark:text-slate-300 font-semibold">{tx.depositorName || 'N/A'}</strong></span>
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {tx.term}
                          </span>
                        </div>
                      </td>

                      {/* 3. Bank & Teller Number */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <p className="text-slate-800 dark:text-slate-300 font-semibold">{tx.bankName || 'Direct Wire Transfer'}</p>
                          {tx.tellerNumber && (
                            <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                              Teller No: <span className="text-slate-800 dark:text-slate-200">{tx.tellerNumber}</span>
                            </p>
                          )}
                          {tx.accountNumber && (
                            <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                              Acct: {tx.accountNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 4. Amount */}
                      <td className="py-4 px-4 text-right font-mono">
                        <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ₦{tx.amount.toLocaleString()}
                        </p>
                        {tx.appliedUnitRate && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            ₦{tx.appliedUnitRate}/st ({tx.billedStudentCount ?? 'N/A'} seats)
                          </p>
                        )}
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {tx.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-mono">
                            <Clock className="w-3 h-3" />
                            Pending Audit
                          </span>
                        )}
                        {tx.status === 'SUCCESSFUL' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                              <CheckCircle2 className="w-3 h-3" />
                              Reconciled
                            </span>
                            {tx.verifiedAt && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {new Date(tx.verifiedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        {tx.status === 'REJECTED' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 font-mono">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                            {tx.auditorNote && (
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[140px] truncate mx-auto font-mono" title={tx.auditorNote}>
                                {tx.auditorNote}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 6. Reconciliation Actions */}
                      <td className="py-4 px-5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Reject Button */}
                            <button
                              onClick={() => setRejectingTx(tx)}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={() => handleApprove(tx)}
                              disabled={isBusy}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {isBusy ? 'Verifying...' : 'Approve & Activate'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {tx.auditorNote ? `Auditor Note: "${tx.auditorNote}"` : 'Audit Completed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {inspectProofTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Bank Teller / Transfer Proof: {inspectProofTx.reference}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {inspectProofTx.schoolName} • ₦{inspectProofTx.amount.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setInspectProofTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {inspectProofTx.proofUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                  <img
                    src={inspectProofTx.proofUrl}
                    alt="Proof of Payment"
                    className="max-h-[500px] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p>No visual receipt was attached.</p>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Bank:</span>
                  <p className="text-slate-900 dark:text-white font-semibold">{inspectProofTx.bankName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Teller / Ref:</span>
                  <p className="text-slate-900 dark:text-white font-semibold">{inspectProofTx.tellerNumber || inspectProofTx.reference}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Depositor:</span>
                  <p className="text-slate-900 dark:text-white font-semibold">{inspectProofTx.depositorName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Amount:</span>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">₦{inspectProofTx.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950/40">
              <button
                onClick={() => setInspectProofTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation & Auditor Note Modal */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              Reject Offline Payment Proof
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Enter an auditor note explaining why this proof ({rejectingTx.reference}) is being rejected. This note will be recorded in the platform ledger.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={auditorNote}
                onChange={(e) => setAuditorNote(e.target.value)}
                placeholder="e.g. Transaction reference not found in bank statement; amount mismatch."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingTx(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingTx.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
