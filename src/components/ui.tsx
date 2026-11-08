/**
 * Small, consistent building blocks for the admin app. Every page uses these so
 * spacing, colours and wording stay the same everywhere.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MoreHorizontal, X } from 'lucide-react';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

// ── Buttons ─────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'sm' | 'md';
    loading?: boolean;
    icon?: React.ReactNode;
  }
> = ({ variant = 'secondary', size = 'md', loading, icon, children, className, disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
      size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
      buttonStyles[variant],
      className,
    )}
  >
    {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
    {children}
  </button>
);

// ── Badges ──────────────────────────────────────────────────

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
const badgeTones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-200',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};
const dotTones: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export const Badge: React.FC<{ tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  dot,
  children,
  className,
}) => (
  <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', badgeTones[tone], className)}>
    {dot && <span className={cx('size-1.5 rounded-full', dotTones[tone])} />}
    {children}
  </span>
);

// ── Surfaces ────────────────────────────────────────────────

export const Card: React.FC<{ children: React.ReactNode; className?: string; padded?: boolean }> = ({ children, className, padded = true }) => (
  <div
    className={cx(
      'rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900',
      padded && 'p-5',
      className,
    )}
  >
    {children}
  </div>
);

export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}> = ({ label, value, hint, icon, onClick }) => {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular dark:text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </>
  );
  const base = 'block w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900';
  return onClick ? (
    <button type="button" onClick={onClick} className={cx(base, 'transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/60')}>
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }> = ({ icon, title, text, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    {icon && <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">{icon}</div>}
    <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Avatar: React.FC<{ name: string; src?: string | null; size?: 'sm' | 'md' }> = ({ name, src, size = 'md' }) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const dim = size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm';
  return src ? (
    <img src={src} alt="" className={cx(dim, 'shrink-0 rounded-lg border border-slate-200 bg-white object-contain dark:border-slate-700')} />
  ) : (
    <div className={cx(dim, 'flex shrink-0 items-center justify-center rounded-lg bg-brand-50 font-semibold text-brand-700 dark:bg-brand-700/20 dark:text-brand-200')}>
      {initials || '?'}
    </div>
  );
};

// ── Form fields ─────────────────────────────────────────────

const fieldBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';

export const Field: React.FC<{ label: string; hint?: React.ReactNode; htmlFor?: string; children: React.ReactNode; className?: string }> = ({
  label,
  hint,
  htmlFor,
  children,
  className,
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...rest }, ref) => (
  <input ref={ref} {...rest} className={cx(fieldBase, 'h-10', className)} />
));
Input.displayName = 'Input';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...rest }) => (
  <select {...rest} className={cx(fieldBase, 'h-10 pr-8', className)}>
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...rest }) => (
  <textarea {...rest} className={cx(fieldBase, 'py-2', className)} />
);

/** Money input with a ₦ prefix. */
export const MoneyInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...rest }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₦</span>
    <Input type="number" min="0" {...rest} className={cx('pl-7 tabular', className)} />
  </div>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
}) => (
  <div className="inline-flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800/70">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={cx(
          'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          value === o.value
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
        )}
      >
        {o.label}
        {o.count !== undefined && (
          <span className={cx('rounded-full px-1.5 text-xs tabular', value === o.value ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-200/70 dark:bg-slate-700')}>
            {o.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── Dialog ──────────────────────────────────────────────────

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
}> = ({ open, onClose, title, description, children, footer, size = 'md', busy }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, busy]);

  if (!open) return null;
  const width = size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60" onClick={() => !busy && onClose()} />
      <div className={cx('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-slate-900 sm:rounded-2xl', width)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="-m-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Row action menu ─────────────────────────────────────────

export type MenuItem =
  | { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }
  | 'divider';

export const ActionMenu: React.FC<{ items: MenuItem[]; label?: string }> = ({ items, label = 'Actions' }) => {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const toggle = () => {
    // Open upwards when there isn't room below (last rows of a table).
    const r = ref.current?.getBoundingClientRect();
    setUp(!!r && window.innerHeight - r.bottom < 260);
    setOpen((o) => !o);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute right-0 z-30 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900',
            up ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {items.map((it, i) =>
            it === 'divider' ? (
              <div key={i} className="my-1 border-t border-slate-100 dark:border-slate-800" />
            ) : (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40',
                  it.danger
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
                )}
              >
                <span className="[&_svg]:size-4 opacity-80">{it.icon}</span>
                {it.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

// ── Formatting ──────────────────────────────────────────────

export const naira = (n: number | null | undefined) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

export const shortDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const humanize = (s?: string | null) =>
  (s || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
