import React, { useMemo, useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import type { OnboardingQueueItem, SubscriptionTier } from '@/types';
import { APP_DOMAIN } from '@/lib/api';
import { Avatar, Badge, Button, Card, EmptyState, Input, shortDate } from '@/components/ui';
import { OnboardingReviewModal } from '@/components/OnboardingReviewModal';

interface OnboardingQueueProps {
  queue: OnboardingQueueItem[];
  isLoading: boolean;
  onApprove: (id: string, options: { initialPlan: SubscriptionTier; trialDays: number; customRate?: number }) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

const VerifiedBadge: React.FC<{ item: OnboardingQueueItem }> = ({ item }) =>
  item.isVerified === false ? <Badge tone="neutral">Email not verified</Badge> : <Badge tone="success" dot>Email verified</Badge>;

export const OnboardingQueue: React.FC<OnboardingQueueProps> = ({ queue, isLoading, onApprove, onReject }) => {
  const [search, setSearch] = useState('');
  const [reviewing, setReviewing] = useState<OnboardingQueueItem | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Verified applications first, newest first within each group.
    return [...queue]
      .filter((i) => !q || [i.schoolName, i.fullname, i.email, i.phone, i.state].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => Number(b.isVerified !== false) - Number(a.isVerified !== false) || +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [queue, search]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school, name or email" className="pl-9" />
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="size-5" />}
            title={isLoading ? 'Loading…' : queue.length ? 'No matches' : 'No schools waiting'}
            text={isLoading || queue.length ? undefined : 'New sign-ups will appear here.'}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    <th className="px-5 py-3 font-medium">School</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Signed up</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visible.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={i.schoolName} src={i.logo} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900 dark:text-white">{i.schoolName}</div>
                            <div className="truncate text-xs text-slate-500">{i.slug}.{APP_DOMAIN}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-900 dark:text-white">{i.fullname}</div>
                        <div className="text-xs text-slate-500">{i.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="truncate text-slate-700 dark:text-slate-300">{i.email}</div>
                        <div className="mt-1"><VerifiedBadge item={i} /></div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{shortDate(i.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button size="sm" variant={i.isVerified === false ? 'secondary' : 'primary'} onClick={() => setReviewing(i)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {visible.map((i) => (
                <li key={i.id} className="flex items-start gap-3 p-4">
                  <Avatar name={i.schoolName} src={i.logo} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900 dark:text-white">{i.schoolName}</div>
                    <div className="truncate text-xs text-slate-500">{i.fullname} · {i.email}</div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <VerifiedBadge item={i} />
                      <Button size="sm" variant={i.isVerified === false ? 'secondary' : 'primary'} onClick={() => setReviewing(i)}>
                        Review
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {reviewing && (
        <OnboardingReviewModal key={reviewing.id} school={reviewing} onClose={() => setReviewing(null)} onApprove={onApprove} onReject={onReject} />
      )}
    </div>
  );
};
