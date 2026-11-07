import React from 'react';
import {
  UserCheck,
  ExternalLink,
  X,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

interface ImpersonationModalProps {
  session: {
    accessToken: string;
    isImpersonated: boolean;
    impersonatedBy: any;
    targetSchool: { id: string; schoolName: string; email: string; slug: string };
    redirectUrl: string;
  } | null;
  onClose: () => void;
}

export const ImpersonationModal: React.FC<ImpersonationModalProps> = ({
  session,
  onClose,
}) => {
  if (!session) return null;

  const [copied, setCopied] = React.useState(false);

  const authPayload = encodeURIComponent(
    btoa(
      JSON.stringify({
        user: session.targetSchool,
        token: session.accessToken,
      })
    )
  );
  const schoolPortalUrl = `http://localhost:3001/redirect?auth=${authPayload}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.accessToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    window.open(schoolPortalUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 transition-colors">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                School Impersonation Session Ready
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Diagnostic access to: {session.targetSchool.schoolName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This is a short-lived audit session (2-hour TTL). All mutations performed in the school dashboard are cryptographically flagged with <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200">isImpersonated: true</code> and logged under your platform administrator ID.
            </p>
          </div>

          <div>
            <span className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
              Impersonation JWT Bearer Token:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={session.accessToken}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 font-mono text-[11px] select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
                title="Copy Token"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Dismiss
            </button>
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              <span>Launch School Portal</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
