import React, { useMemo } from 'react';
import { ArrowRight, CircleDollarSign, GraduationCap, Receipt, School, UserCheck } from 'lucide-react';
import type { OnboardingQueueItem, OverviewMetrics, SubscriptionTransaction, TenantSchool } from '@/types';
import type { NavTab } from '@/context/RouterContext';
import { schoolState } from '@/lib/school-status';
import { Badge, Button, Card, EmptyState, StatCard, naira, shortDate } from '@/components/ui';
import { SchoolsTable, type SchoolActions } from '@/components/SchoolsView';

export const OverviewView: React.FC<{
  overview: OverviewMetrics;
  schools: TenantSchool[];
  queue: OnboardingQueueItem[];
  transactions: SubscriptionTransaction[];
  actions: SchoolActions;
  isLoading: boolean;
  go: (t: NavTab) => void;
}> = ({ overview, schools, queue, transactions, actions, isLoading, go }) => {
  const k = overview.kpis;
  const pendingPayments = transactions.filter((t) => t.status === 'PENDING');

  const states = useMemo(() => schools.map((s) => ({ s, st: schoolState(s) })), [schools]);
  const live = states.filter((x) => x.st.key === 'active' || x.st.key === 'trial').length;
  const overdue = states.filter((x) => x.st.key === 'grace' || x.st.key === 'expired' || x.st.key === 'locked');
  const suspended = states.filter((x) => x.st.key === 'suspended');

  const todo: Array<{ title: string; text: string; tone: 'warning' | 'danger' | 'brand'; action: () => void; cta: string }> = [];
  if (queue.length)
    todo.push({
      title: `${queue.length} school${queue.length === 1 ? '' : 's'} waiting for approval`,
      text: queue.slice(0, 3).map((q) => q.schoolName).join(', ') + (queue.length > 3 ? '…' : ''),
      tone: 'warning',
      action: () => go('onboarding'),
      cta: 'Review',
    });
  if (pendingPayments.length)
    todo.push({
      title: `${pendingPayments.length} payment${pendingPayments.length === 1 ? '' : 's'} to confirm`,
      text: `${naira(pendingPayments.reduce((a, t) => a + t.amount, 0))} in bank transfers waiting to be checked`,
      tone: 'warning',
      action: () => go('reconciliation'),
      cta: 'Check',
    });
  if (overdue.length)
    todo.push({
      title: `${overdue.length} school${overdue.length === 1 ? '' : 's'} overdue or expired`,
      text: overdue.slice(0, 3).map((x) => x.s.schoolName).join(', '),
      tone: 'danger',
      action: () => go('tenants'),
      cta: 'View',
    });
  if (suspended.length)
    todo.push({
      title: `${suspended.length} suspended school${suspended.length === 1 ? '' : 's'}`,
      text: suspended.slice(0, 3).map((x) => x.s.schoolName).join(', '),
      tone: 'brand',
      action: () => go('tenants'),
      cta: 'View',
    });

  const newest = [...schools].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  const recentPayments = overview.recentTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active schools" value={live} hint={`${k.totalSchools} schools in total`} icon={<School className="size-4" />} onClick={() => go('tenants')} />
        <StatCard label="Students" value={k.totalActiveStudents.toLocaleString()} hint={`${k.totalStaff.toLocaleString()} staff`} icon={<GraduationCap className="size-4" />} />
        <StatCard label="Awaiting approval" value={queue.length} hint="New school sign-ups" icon={<UserCheck className="size-4" />} onClick={() => go('onboarding')} />
        <StatCard label="Revenue collected" value={naira(k.realizedGrossRevenue)} hint={`${pendingPayments.length} payment${pendingPayments.length === 1 ? '' : 's'} to confirm`} icon={<CircleDollarSign className="size-4" />} onClick={() => go('reconciliation')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3" padded={false}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Needs your attention</h2>
          </div>
          {todo.length === 0 ? (
            <EmptyState title="You're all caught up" text="No approvals, payments or overdue schools need action right now." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {todo.map((t) => (
                <li key={t.title} className="flex items-center gap-4 px-5 py-4">
                  <span className={`size-2 shrink-0 rounded-full ${t.tone === 'danger' ? 'bg-red-500' : t.tone === 'warning' ? 'bg-amber-500' : 'bg-brand-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{t.text}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={t.action}>
                    {t.cta}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="min-w-0 lg:col-span-2" padded={false}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent payments</h2>
            <button type="button" onClick={() => go('reconciliation')} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-200">
              View all
            </button>
          </div>
          {recentPayments.length === 0 ? (
            <EmptyState icon={<Receipt className="size-5" />} title="No payments yet" />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{t.schoolName}</p>
                    <p className="text-xs text-slate-500">{shortDate(t.createdAt)} · {t.term}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 tabular dark:text-white">{naira(t.amount)}</p>
                    <Badge tone={t.status === 'SUCCESSFUL' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'}>
                      {t.status === 'SUCCESSFUL' ? 'Confirmed' : t.status === 'PENDING' ? 'To confirm' : 'Rejected'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Newest schools</h2>
          <button type="button" onClick={() => go('tenants')} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-200">
            All schools <ArrowRight className="size-4" />
          </button>
        </div>
        <SchoolsTable schools={newest} actions={actions} isLoading={isLoading} compact />
      </div>
    </div>
  );
};
