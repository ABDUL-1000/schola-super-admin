import React, { useMemo, useState } from 'react';
import { Ban, CalendarPlus, LogIn, PlayCircle, Search, School, Settings2, Trash2 } from 'lucide-react';
import type { TenantSchool } from '@/types';
import { APP_DOMAIN } from '@/lib/api';
import { schoolState, PLAN_LABEL, type SchoolStateKey } from '@/lib/school-status';
import { ActionMenu, Avatar, Badge, Card, EmptyState, Input, Segmented, naira, type MenuItem } from '@/components/ui';

export interface SchoolActions {
  onEditPlan: (s: TenantSchool) => void;
  onSuspend: (s: TenantSchool) => void;
  onReactivate: (s: TenantSchool) => void;
  onDelete: (s: TenantSchool) => void;
  onImpersonate: (s: TenantSchool) => void;
  onExtendGrace: (s: TenantSchool) => void;
}

type Filter = 'all' | 'live' | 'pending' | 'attention' | 'suspended';
const inFilter = (k: SchoolStateKey, f: Filter) =>
  f === 'all' ||
  (f === 'live' && (k === 'active' || k === 'trial')) ||
  (f === 'pending' && k === 'pending') ||
  (f === 'attention' && (k === 'grace' || k === 'expired' || k === 'locked')) ||
  (f === 'suspended' && k === 'suspended');

function menuFor(s: TenantSchool, a: SchoolActions): MenuItem[] {
  const st = schoolState(s);
  const approved = s.onboardingStatus === 'APPROVED';
  const items: MenuItem[] = [];
  if (approved) {
    items.push({ label: 'Edit plan & billing', icon: <Settings2 />, onClick: () => a.onEditPlan(s) });
    items.push({ label: 'Sign in as this school', icon: <LogIn />, onClick: () => a.onImpersonate(s), disabled: st.key === 'suspended' });
    if (st.key === 'expired' || st.key === 'grace' || st.key === 'locked') {
      items.push({ label: 'Give 14 more days', icon: <CalendarPlus />, onClick: () => a.onExtendGrace(s) });
    }
    items.push('divider');
    items.push(
      st.key === 'suspended'
        ? { label: 'Reactivate school', icon: <PlayCircle />, onClick: () => a.onReactivate(s) }
        : { label: 'Suspend school', icon: <Ban />, onClick: () => a.onSuspend(s) },
    );
  }
  items.push({ label: 'Delete school…', icon: <Trash2 />, onClick: () => a.onDelete(s), danger: true });
  return items;
}

const StatusCell: React.FC<{ s: TenantSchool }> = ({ s }) => {
  const st = schoolState(s);
  return (
    <div className="min-w-0">
      <Badge tone={st.tone} dot>
        {st.label}
      </Badge>
      {st.detail && <p className="mt-1 max-w-[16rem] truncate text-xs text-slate-500 dark:text-slate-400" title={st.detail}>{st.detail}</p>}
    </div>
  );
};

export const SchoolsTable: React.FC<{
  schools: TenantSchool[];
  actions: SchoolActions;
  isLoading?: boolean;
  compact?: boolean;
}> = ({ schools, actions, isLoading, compact }) => {
  if (!schools.length) {
    return (
      <Card padded={false}>
        <EmptyState
          icon={<School className="size-5" />}
          title={isLoading ? 'Loading schools…' : 'No schools to show'}
          text={isLoading ? undefined : 'Try a different search or filter.'}
        />
      </Card>
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <th className="px-5 py-3 font-medium">School</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {!compact && <th className="px-4 py-3 font-medium">Plan</th>}
              <th className="px-4 py-3 text-right font-medium">Students</th>
              {!compact && <th className="px-4 py-3 text-right font-medium">Staff</th>}
              <th className="px-4 py-3 text-right font-medium">Bill per term</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {schools.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.schoolName} src={s.logo} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900 dark:text-white">{s.schoolName}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {s.slug}.{APP_DOMAIN} · {s.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusCell s={s} />
                </td>
                {!compact && (
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {PLAN_LABEL[s.subscriptionTier] || s.subscriptionTier}
                    {s.customStudentRate ? <div className="text-xs text-slate-500">Agreed rate</div> : null}
                  </td>
                )}
                <td className="px-4 py-3.5 text-right text-slate-700 tabular dark:text-slate-300">{s.activeStudentCount.toLocaleString()}</td>
                {!compact && <td className="px-4 py-3.5 text-right text-slate-700 tabular dark:text-slate-300">{s.activeStaffCount.toLocaleString()}</td>}
                <td className="px-4 py-3.5 text-right">
                  {s.onboardingStatus === 'APPROVED' ? (
                    <>
                      <div className="font-medium text-slate-900 tabular dark:text-white">{naira(s.computedBilling?.totalAmount)}</div>
                      <div className="text-xs text-slate-500 tabular">{naira(s.computedBilling?.appliedRate)} / student</div>
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-right">
                  <ActionMenu items={menuFor(s, actions)} label={`Actions for ${s.schoolName}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone cards */}
      <ul className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
        {schools.map((s) => (
          <li key={s.id} className="flex items-start gap-3 p-4">
            <Avatar name={s.schoolName} src={s.logo} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900 dark:text-white">{s.schoolName}</div>
                  <div className="truncate text-xs text-slate-500">{s.email}</div>
                </div>
                <ActionMenu items={menuFor(s, actions)} label={`Actions for ${s.schoolName}`} />
              </div>
              <div className="mt-2">
                <StatusCell s={s} />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-slate-500 tabular">
                <span>{s.activeStudentCount} students</span>
                <span>{s.activeStaffCount} staff</span>
                {s.onboardingStatus === 'APPROVED' && <span>{naira(s.computedBilling?.totalAmount)}/term</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

/** The Schools page: search + filters + table. */
export const SchoolsView: React.FC<{ schools: TenantSchool[]; actions: SchoolActions; isLoading: boolean }> = ({ schools, actions, isLoading }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: schools.length, live: 0, pending: 0, attention: 0, suspended: 0 };
    for (const s of schools) {
      const k = schoolState(s).key;
      (['live', 'pending', 'attention', 'suspended'] as Filter[]).forEach((f) => inFilter(k, f) && c[f]++);
    }
    return c;
  }, [schools]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schools.filter((s) => {
      if (!inFilter(schoolState(s).key, filter)) return false;
      if (!q) return true;
      return [s.schoolName, s.email, s.slug, s.fullname, s.state, s.city].some((v) => v?.toLowerCase().includes(q));
    });
  }, [schools, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'live', label: 'Active & trial', count: counts.live },
            { value: 'pending', label: 'Awaiting approval', count: counts.pending },
            { value: 'attention', label: 'Needs attention', count: counts.attention },
            { value: 'suspended', label: 'Suspended', count: counts.suspended },
          ]}
        />
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or state" className="pl-9" />
        </div>
      </div>
      <SchoolsTable schools={visible} actions={actions} isLoading={isLoading} />
    </div>
  );
};
