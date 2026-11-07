import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Layers,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  Server,
  Building2,
  Clock,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email, password);
  };

  const handleFillDemo = () => {
    setEmail('superadmin@schola.xyz');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-150">
      {/* LEFT HERO PANEL (Desktop Brand Authority) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-slate-900 text-white p-12 flex-col justify-between relative border-r border-slate-800">
        {/* Subtle structural architectural background grid (Zero Gradients) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">SCHOLA</span>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  CONTROL PLANE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Centralized Governance Architecture
              </p>
            </div>
          </div>
        </div>

        {/* Central Authority Value Proposition */}
        <div className="relative z-10 my-auto py-12 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Cluster Operational</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Master Institutional Oversight & Seat Governance.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Manage school onboarding gating, agreed per-student seat pricing, offline bank reconciliation ledgers, and emergency workspace security locks from a single command center.
            </p>
          </div>

          {/* Three Core Feature Pillars (Solid borders, zero gradients) */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Agreed Per-Seat Pricing Engine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Configure school-specific negotiated rates per student seat with real-time billable seat floor enforcement.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Audited Financial Reconciliation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Approve offline bank transfer proofs, reconcile gateway webhooks, and record manual treasury cash receipts.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-start gap-3.5 transition-colors hover:border-slate-700">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Zero-Trust Workspace Isolation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Instant kill-switch locks, grace period extensions, and audit-logged administrative impersonation tokens.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Authority Micro-Stats */}
        <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>256-Bit SSL/TLS Enclave</span>
          </div>
          <div>
            <span>Schola Platform v2.4</span>
          </div>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION PANEL */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          {/* Mobile Brand indicator */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">SCHOLA</span>
          </div>

          <div className="hidden lg:block">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Super Admin Gateway
            </span>
          </div>

          <ThemeToggle variant="pill" />
        </div>

        {/* Center Login Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 text-[11px] font-mono font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Strict Role: PLATFORM_SUPER_ADMIN</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Master Console Authentication
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your privileged credentials to initiate an audited platform administrative session.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@schola.xyz"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Master Password
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    Encrypted Auth
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Remember device session
                  </span>
                </label>

                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  12h Session TTL
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Super Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant (local development only) */}
            {import.meta.env.DEV && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    Super Admin Demo Access
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                    superadmin@schola.xyz • Admin@123456
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 dark:hover:border-indigo-500 text-[11px] font-semibold font-mono flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Auto Fill</span>
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Security footnote */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              End-to-End Auditing
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              IP Monitored
            </span>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono py-2">
          Protected multi-tenant platform enclave. Unauthorized access attempts are monitored and recorded.
        </div>
      </div>
    </div>
  );
};
