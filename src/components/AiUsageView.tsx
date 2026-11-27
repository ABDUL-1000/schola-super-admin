import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Bot, Pencil, RotateCcw, Search, Sparkles, Table2, BarChart3, GraduationCap, PauseCircle } from 'lucide-react';
import type { AiDefaults, AiLimits, AiSchoolUsage, AiUsageOverview } from '@/types';
import { api } from '@/lib/api';
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, Segmented, StatCard, cx } from '@/components/ui';

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;
const fmt = (n: number) => n.toLocaleString('en-NG');
const tokens = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

/** Series colours (validated for colour-blind separation and 3:1 contrast on both surfaces). */
const TEACHER = 'bg-[#2a78d6] dark:bg-[#3987e5]';
const TUTOR = 'bg-[#eb6834] dark:bg-[#d95926]';

const LIMIT_FIELDS: Array<{ key: keyof Omit<AiLimits, 'enabled'>; label: string; hint: string }> = [
  { key: 'teacherPerSchool', label: 'Teacher AI per school / day', hint: 'Question and lesson-note generations for the whole school. Saved results don’t count.' },
  { key: 'teacherPerStaff', label: 'Teacher AI per staff / day', hint: 'For each staff member.' },
  { key: 'tutorPerSchool', label: 'AI Tutor per school / day', hint: 'All students’ questions together.' },
  { key: 'tutorPerStudent', label: 'AI Tutor per student / day (max)', hint: 'Schools choose their own number up to this.' },
];

export const AiUsageView: React.FC = () => {
  const [data, setData] = useState<AiUsageOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AiSchoolUsage | null>(null);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'custom'>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getAiUsage());
    } catch (e) {
      toast.error(errMsg(e, "Couldn't load AI usage."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const schools = useMemo(() => {
    const t = search.trim().toLowerCase();
    return (data?.schools ?? []).filter(
      (s) =>
        (filter === 'all' || (filter === 'active' ? s.teacher.month + s.tutor.month > 0 : s.custom)) &&
        (!t || s.schoolName.toLowerCase().includes(t) || s.slug.toLowerCase().includes(t)),
    );
  }, [data, filter, search]);

  if (loading && !data) {
    return (
      <Card>
        <div className="h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </Card>
    );
  }
  if (!data) return <EmptyState title="AI usage couldn't load" action={<Button onClick={load}>Try again</Button>} />;

  const { platform, totals, defaults } = data;
  const capPct = platform.cap ? Math.min(100, Math.round((platform.usedToday / platform.cap) * 100)) : 0;

  return (
    <div className="space-y-6">
      {!data.ai.configured && (
        <Card className="border-amber-300 bg-amber-50 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          The AI key isn't set on the server, so AI features are off for every school. Add GEMINI_API_KEY (or AI_API_KEY) to the API environment.
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Platform today"
          icon={<Sparkles className="size-4" />}
          value={
            <span>
              {fmt(platform.usedToday)}
              <span className="text-base font-normal text-slate-400"> / {platform.cap ? fmt(platform.cap) : 'no cap'}</span>
            </span>
          }
          hint={
            platform.cap ? (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cx('h-full rounded-full', capPct >= 90 ? 'bg-red-500' : capPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${capPct}%` }} />
              </div>
            ) : (
              'Set a daily cap in Defaults'
            )
          }
        />
        <StatCard label="Teacher AI today" icon={<Bot className="size-4" />} value={fmt(totals.teacherToday)} hint="Questions and lesson notes generated" />
        <StatCard label="AI Tutor today" icon={<GraduationCap className="size-4" />} value={fmt(totals.tutorToday)} hint="Questions students asked" />
        <StatCard label="Last 30 days" icon={<BarChart3 className="size-4" />} value={fmt(totals.month)} hint={`${tokens(totals.tokensMonth)} AI Tutor tokens · ${data.ai.provider} / ${data.ai.model}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DailyChart days={platform.days} cap={platform.cap} />
        <DefaultsCard defaults={defaults} onEdit={() => setDefaultsOpen(true)} />
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All schools', count: data.schools.length },
              { value: 'active', label: 'Using AI', count: data.schools.filter((s) => s.teacher.month + s.tutor.month > 0).length },
              { value: 'custom', label: 'Custom limits', count: data.schools.filter((s) => s.custom).length },
            ]}
          />
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schools" className="pl-9" />
          </div>
        </div>
        {!schools.length ? (
          <EmptyState title="No schools here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Teacher AI today</th>
                  <th className="px-4 py-3">AI Tutor today</th>
                  <th className="px-4 py-3 text-right">30 days</th>
                  <th className="px-4 py-3 text-right">Students (7 days)</th>
                  <th className="px-4 py-3">Limits</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schools.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.schoolName} src={s.logo} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900 dark:text-white">{s.schoolName}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            {s.plan.label}
                            {!s.plan.aiIncluded && <span className="text-slate-400">· AI not in plan</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Meter used={s.teacher.today} limit={s.limits.teacherPerSchool} />
                    </td>
                    <td className="px-4 py-3">
                      <Meter used={s.tutor.today} limit={s.limits.tutorPerSchool} />
                      {!s.tutorSwitchedOnBySchool && <div className="mt-0.5 text-[11px] text-slate-400">Switched off by the school</div>}
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {fmt(s.teacher.month + s.tutor.month)}
                      {s.tutorTokensMonth > 0 && <div className="text-[11px] text-slate-400">{tokens(s.tutorTokensMonth)} tokens</div>}
                    </td>
                    <td className="px-4 py-3 text-right tabular">{fmt(s.studentsThisWeek)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {!s.limits.enabled ? (
                          <Badge tone="danger">
                            <PauseCircle className="size-3" /> AI paused
                          </Badge>
                        ) : s.custom ? (
                          <Badge tone="brand" dot>
                            Custom
                          </Badge>
                        ) : (
                          <Badge>Default</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(s)}>
                        Limits
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SchoolLimitsModal school={editing} defaults={defaults} onClose={() => setEditing(null)} onSaved={setData} />
      <DefaultsModal open={defaultsOpen} defaults={defaults} onClose={() => setDefaultsOpen(false)} onSaved={setData} />
    </div>
  );
};

// ---------------------------------------------------------------------------

const Meter: React.FC<{ used: number; limit: number }> = ({ used, limit }) => {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div className="w-36">
      <div className="flex justify-between text-xs tabular">
        <span className="font-medium text-slate-900 dark:text-white">{fmt(used)}</span>
        <span className="text-slate-400">of {fmt(limit)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={cx('h-full rounded-full', pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/** Last 14 days, stacked: teacher generations under AI Tutor questions, with the daily cap as a line. */
const DailyChart: React.FC<{ days: AiUsageOverview['platform']['days']; cap: number }> = ({ days, cap }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const peak = Math.max(1, ...days.map((d) => d.teacher + d.tutor));
  const top = Math.max(peak, cap && cap <= peak * 3 ? cap : 0) * 1.1;
  const H = 180;
  const label = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const total = days.reduce((a, d) => a + d.teacher + d.tutor, 0);
  const showCap = cap > 0 && cap <= top;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI calls, last 14 days</h3>
          <p className="text-xs text-slate-500">{fmt(total)} real AI calls across all schools</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className={cx('size-2.5 rounded-sm', TEACHER)} /> Teacher AI
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cx('size-2.5 rounded-sm', TUTOR)} /> AI Tutor
          </span>
          {showCap && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-slate-400" /> Daily cap
            </span>
          )}
          <button type="button" onClick={() => setAsTable((v) => !v)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={asTable ? 'Show chart' : 'Show table'}>
            {asTable ? <BarChart3 className="size-3.5" /> : <Table2 className="size-3.5" />} {asTable ? 'Chart' : 'Table'}
          </button>
        </div>
      </div>

      {asTable ? (
        <div className="mt-4 max-h-[220px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1.5">Day</th>
                <th className="py-1.5 text-right">Teacher AI</th>
                <th className="py-1.5 text-right">AI Tutor</th>
                <th className="py-1.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5">{label(d.date)}</td>
                  <td className="py-1.5 text-right">{fmt(d.teacher)}</td>
                  <td className="py-1.5 text-right">{fmt(d.tutor)}</td>
                  <td className="py-1.5 text-right font-medium">{fmt(d.teacher + d.tutor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-5" onMouseLeave={() => setHover(null)}>
          {/* recessive grid */}
          {[0.5, 1].map((f) => (
            <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-slate-100 dark:border-slate-800" style={{ bottom: 20 + H * f }}>
              <span className="absolute -top-2 right-0 bg-white pl-1 text-[10px] text-slate-400 tabular dark:bg-slate-900">{fmt(Math.round(top * f))}</span>
            </div>
          ))}
          {showCap && (
            <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-slate-400/70" style={{ bottom: 20 + (cap / top) * H }}>
              <span className="absolute -top-4 left-0 text-[10px] font-medium text-slate-500">cap {fmt(cap)}</span>
            </div>
          )}
          <div className="relative flex items-end gap-1.5" style={{ height: H + 20 }}>
            {days.map((d, i) => {
              const t = (d.teacher / top) * H;
              const u = (d.tutor / top) * H;
              return (
                <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)}>
                  {/* hit target: full column */}
                  <div className={cx('absolute inset-x-0 bottom-5 top-0 rounded-md transition-colors', hover === i && 'bg-slate-100/70 dark:bg-slate-800/50')} />
                  <div className="relative mx-auto flex w-full max-w-[28px] flex-col justify-end" style={{ height: H }}>
                    {u > 0 && <div className={cx('rounded-t-[4px]', TUTOR)} style={{ height: Math.max(2, u) }} />}
                    {u > 0 && t > 0 && <div className="h-[2px] bg-white dark:bg-slate-900" />}
                    {t > 0 && <div className={cx(u > 0 ? '' : 'rounded-t-[4px]', TEACHER)} style={{ height: Math.max(2, t) }} />}
                  </div>
                  <div className="relative h-5 pt-1 text-center text-[10px] text-slate-400">{i % 2 === days.length % 2 ? label(d.date) : ''}</div>
                  {hover === i && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-36 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <div className="font-semibold text-slate-900 dark:text-white">{label(d.date)}</div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cx('size-2 rounded-sm', TEACHER)} /> Teacher AI
                        </span>
                        <span className="tabular">{fmt(d.teacher)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cx('size-2 rounded-sm', TUTOR)} /> AI Tutor
                        </span>
                        <span className="tabular">{fmt(d.tutor)}</span>
                      </div>
                      <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-medium text-slate-900 dark:border-slate-800 dark:text-white">
                        <span>Total</span>
                        <span className="tabular">{fmt(d.teacher + d.tutor)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

const DefaultsCard: React.FC<{ defaults: AiDefaults; onEdit: () => void }> = ({ defaults, onEdit }) => (
  <Card>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Default limits</h3>
        <p className="text-xs text-slate-500">Every school gets these unless you set its own.</p>
      </div>
      <Button size="sm" icon={<Pencil className="size-3.5" />} onClick={onEdit}>
        Edit
      </Button>
    </div>
    <dl className="mt-4 space-y-2.5 text-sm">
      <Row label="Daily cap, all schools together" value={defaults.platformDaily ? fmt(defaults.platformDaily) : 'No cap'} strong />
      {LIMIT_FIELDS.map((f) => (
        <Row key={f.key} label={f.label} value={fmt(defaults[f.key])} />
      ))}
      <Row label="AI for new schools" value={defaults.enabled ? 'On' : 'Paused'} />
    </dl>
  </Card>
);

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className={cx('tabular', strong ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200')}>{value}</dd>
  </div>
);

const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void; label: string; text: string }> = ({ on, onChange, label, text }) => (
  <button type="button" onClick={() => onChange(!on)} aria-pressed={on} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left dark:border-slate-700">
    <span className={cx('relative h-6 w-10 shrink-0 rounded-full transition-colors', on ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700')}>
      <span className={cx('absolute top-1 size-4 rounded-full bg-white shadow transition-all', on ? 'left-5' : 'left-1')} />
    </span>
    <span>
      <span className="block text-sm font-medium text-slate-900 dark:text-white">{label}</span>
      <span className="block text-xs text-slate-500">{text}</span>
    </span>
  </button>
);

const DefaultsModal: React.FC<{ open: boolean; defaults: AiDefaults; onClose: () => void; onSaved: (d: AiUsageOverview) => void }> = ({ open, defaults, onClose, onSaved }) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(Object.fromEntries([...LIMIT_FIELDS.map((f) => [f.key, String(defaults[f.key])]), ['platformDaily', String(defaults.platformDaily)]]));
    setEnabled(defaults.enabled);
  }, [open, defaults]);
  const save = async () => {
    setBusy(true);
    try {
      const body: Partial<AiDefaults> = { enabled };
      for (const [k, v] of Object.entries(form)) if (v.trim() !== '') (body as Record<string, number>)[k] = Number(v);
      onSaved(await api.saveAiDefaults(body));
      toast.success('Default AI limits saved. They apply to every school without its own limits.');
      onClose();
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={busy}
      title="Default AI limits"
      description="Every school gets these unless you give it its own. Changes apply within a minute."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" loading={busy} onClick={save}>
            Save defaults
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Daily cap, all schools together" hint="Real AI calls per day across every school. Keep it under your AI account's daily allowance. 0 = no cap.">
          <Input type="number" min={0} value={form.platformDaily ?? ''} onChange={(e) => setForm((f) => ({ ...f, platformDaily: e.target.value }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {LIMIT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Input type="number" min={0} value={form[f.key] ?? ''} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} />
            </Field>
          ))}
        </div>
        <Toggle on={enabled} onChange={setEnabled} label="AI switched on for schools" text="Turn off to pause AI for every school that doesn't have its own setting." />
      </div>
    </Modal>
  );
};

const SchoolLimitsModal: React.FC<{ school: AiSchoolUsage | null; defaults: AiDefaults; onClose: () => void; onSaved: (d: AiUsageOverview) => void }> = ({ school, defaults, onClose, onSaved }) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!school) return;
    setForm(Object.fromEntries(LIMIT_FIELDS.map((f) => [f.key, school.overrides[f.key] !== undefined ? String(school.overrides[f.key]) : ''])));
    setEnabled(school.overrides.enabled ?? null);
  }, [school]);
  if (!school) return null;

  const submit = async (limits: Partial<AiLimits> | null) => {
    setBusy(true);
    try {
      onSaved(await api.saveSchoolAiLimits(school.id, limits));
      toast.success(limits ? `Saved AI limits for ${school.schoolName}.` : `${school.schoolName} now uses the default limits.`);
      onClose();
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save."));
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    const limits: Partial<AiLimits> = {};
    for (const [k, v] of Object.entries(form)) if (v.trim() !== '') (limits as Record<string, number>)[k] = Number(v);
    if (enabled !== null && enabled !== defaults.enabled) limits.enabled = enabled;
    void submit(Object.keys(limits).length ? limits : null);
  };
  const isOn = enabled ?? defaults.enabled;

  return (
    <Modal
      open
      onClose={onClose}
      busy={busy}
      title={`AI limits · ${school.schoolName}`}
      description="Leave a box empty to use the default (shown in grey)."
      footer={
        <>
          {school.custom && (
            <Button variant="ghost" icon={<RotateCcw className="size-4" />} disabled={busy} onClick={() => void submit(null)} className="sm:mr-auto">
              Use defaults
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" loading={busy} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
          <div>
            <div className="text-slate-500">Teacher AI · 30 days</div>
            <div className="text-base font-semibold tabular text-slate-900 dark:text-white">{fmt(school.teacher.month)}</div>
          </div>
          <div>
            <div className="text-slate-500">AI Tutor · 30 days</div>
            <div className="text-base font-semibold tabular text-slate-900 dark:text-white">{fmt(school.tutor.month)}</div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LIMIT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Input type="number" min={0} placeholder={`Default: ${fmt(defaults[f.key])}`} value={form[f.key] ?? ''} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} />
            </Field>
          ))}
        </div>
        <Toggle
          on={isOn}
          onChange={setEnabled}
          label={isOn ? 'AI is on for this school' : 'AI is paused for this school'}
          text="Pausing stops teacher AI tools and the student AI Tutor for this school only."
        />
        {!school.plan.aiIncluded && <p className="text-xs text-amber-600">This school's plan ({school.plan.label}) doesn't include AI, so these limits only matter after it upgrades.</p>}
      </div>
    </Modal>
  );
};
