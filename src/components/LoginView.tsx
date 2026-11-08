import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email.trim(), password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">S</div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Sign in to Schola Admin</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">For the Schola team only.</p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@schola.com.ng" autoFocus />
            </Field>
            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
              Sign in
            </Button>
          </form>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                setEmail('superadmin@schola.com.ng');
                setPassword('Admin@123456');
              }}
              className="mt-4 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Development only: fill in the test admin account
            </button>
          )}
        </Card>
      </div>
    </div>
  );
};
