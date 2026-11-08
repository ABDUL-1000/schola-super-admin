import React, { useMemo, useState } from 'react';
import { CalendarClock, Mail, MessageCircle, Phone, Search, Trash2 } from 'lucide-react';
import type { DemoRequest, DemoRequestStatus } from '@/types';
import { Badge, Button, Card, EmptyState, Input, Modal, Segmented, Select, shortDate, type Tone } from '@/components/ui';

export const DEMO_STATUS: Record<DemoRequestStatus, { label: string; tone: Tone }> = {
  NEW: { label: 'New', tone: 'warning' },
  CONTACTED: { label: 'Contacted', tone: 'brand' },
  SCHEDULED: { label: 'Demo booked', tone: 'brand' },
  COMPLETED: { label: 'Done', tone: 'success' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

type Filter = 'OPEN' | DemoRequestStatus | 'ALL';
const OPEN: DemoRequestStatus[] = ['NEW', 'CONTACTED', 'SCHEDULED'];

/** WhatsApp link for a Nigerian number written as 080…, +234… or 234…. */
const whatsapp = (phone: string) => {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) d = '234' + d.slice(1);
  return `https://wa.me/${d}`;
};

const when = (r: DemoRequest) =>
  r.preferredDate ? `${shortDate(r.preferredDate)}${r.preferredTime ? `, ${r.preferredTime}` : ''}` : 'Any time';

export const DemoRequestsView: React.FC<{
  requests: DemoRequest[];
  isLoading: boolean;
  onStatus: (r: DemoRequest, status: DemoRequestStatus) => Promise<void>;
  onDelete: (r: DemoRequest) => Promise<void>;
}> = ({ requests, isLoading, onStatus, onDelete }) => {
  const [filter, setFilter] = useState<Filter>('OPEN');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<DemoRequest | null>(null);

  const count = (f: Filter) =>
    f === 'ALL' ? requests.length : f === 'OPEN' ? requests.filter((r) => OPEN.includes(r.status)).length : requests.filter((r) => r.status === f).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (filter === 'OPEN' ? !OPEN.includes(r.status) : filter !== 'ALL' && r.status !== filter) return false;
      return !q || [r.schoolName, r.fullName, r.email, r.phone, r.state, r.city].some((v) => v?.toLowerCase().includes(q));
    });
  }, [requests, filter, search]);

  const change = async (r: DemoRequest, s: DemoRequestStatus) => {
    setBusyId(r.id);
    try {
      await onStatus(r, s);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'OPEN', label: 'To follow up', count: count('OPEN') },
            { value: 'NEW', label: 'New', count: count('NEW') },
            { value: 'COMPLETED', label: 'Done', count: count('COMPLETED') },
            { value: 'CLOSED', label: 'Closed', count: count('CLOSED') },
            { value: 'ALL', label: 'All', count: count('ALL') },
          ]}
        />
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school, name, phone" className="pl-9" />
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="size-5" />}
            title={isLoading ? 'Loading…' : requests.length ? 'Nothing here' : 'No demo requests yet'}
            text={!isLoading && !requests.length ? 'Requests from the "Book a demo" form on the website appear here.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((r) => {
              const st = DEMO_STATUS[r.status];
              const place = [r.city, r.state].filter(Boolean).join(', ');
              return (
                <li key={r.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{r.schoolName}</span>
                      <Badge tone={st.tone} dot>{st.label}</Badge>
                      <span className="text-xs text-slate-400">#{r.reference} · {shortDate(r.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {r.fullName}
                      {r.role ? `, ${r.role}` : ''}
                      {place ? ` · ${place}` : ''}
                      {r.studentPopulation ? ` · ${r.studentPopulation}${/student/i.test(r.studentPopulation) ? '' : ' students'}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-200">
                        <Phone className="size-3.5" /> {r.phone}
                      </a>
                      <a href={whatsapp(r.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-200">
                        <MessageCircle className="size-3.5" /> WhatsApp
                      </a>
                      <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your Schola demo for ${r.schoolName}`)}`} className="inline-flex min-w-0 items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-200">
                        <Mail className="size-3.5 shrink-0" /> <span className="truncate">{r.email}</span>
                      </a>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-200">Preferred time:</span> {when(r)}
                    </p>
                    {r.modules.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.modules.map((m) => (
                          <Badge key={m}>{m}</Badge>
                        ))}
                      </div>
                    )}
                    {r.notes && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">“{r.notes}”</p>}
                  </div>
                  <div className="flex items-start gap-2 lg:flex-col lg:items-end">
                    <Select
                      aria-label="Status"
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => change(r, e.target.value as DemoRequestStatus)}
                      className="h-9 w-40"
                    >
                      {(Object.keys(DEMO_STATUS) as DemoRequestStatus[]).map((s) => (
                        <option key={s} value={s}>{DEMO_STATUS[s].label}</option>
                      ))}
                    </Select>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(r)} className="text-slate-500">
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        busy={busyId === deleting?.id}
        size="sm"
        title="Delete this request?"
        description={deleting ? `${deleting.schoolName} · ${deleting.fullName}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busyId === deleting?.id}
              onClick={async () => {
                if (!deleting) return;
                setBusyId(deleting.id);
                try {
                  await onDelete(deleting);
                  setDeleting(null);
                } finally {
                  setBusyId(null);
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Use this for spam or duplicates. To keep a record, set the status to Closed instead.</p>
      </Modal>
    </div>
  );
};
