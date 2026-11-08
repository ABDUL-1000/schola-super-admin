import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { APP_DOMAIN } from '@/lib/api';
import { Button, Modal } from '@/components/ui';

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

/** Where the school's app lives: its own subdomain in production, localhost in development. */
const schoolAppUrl = (slug: string) =>
  import.meta.env.VITE_SCHOOL_APP_URL || (import.meta.env.DEV ? 'http://localhost:3001' : `https://${slug}.${APP_DOMAIN}`);

export const ImpersonationModal: React.FC<ImpersonationModalProps> = ({ session, onClose }) => {
  if (!session) return null;
  const { targetSchool } = session;
  const auth = encodeURIComponent(btoa(JSON.stringify({ user: { ...targetSchool, role: 'SCHOOL' }, token: session.accessToken })));
  const url = `${schoolAppUrl(targetSchool.slug).replace(/\/$/, '')}/redirect?auth=${auth}`;

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={`Sign in as ${targetSchool.schoolName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<ExternalLink className="size-4" />}
            onClick={() => {
              window.open(url, '_blank', 'noopener');
              onClose();
            }}
          >
            Open school dashboard
          </Button>
        </>
      }
    >
      <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="space-y-2">
          <p>
            This opens <strong>{targetSchool.schoolName}</strong>'s dashboard in a new tab, signed in as the school ({targetSchool.email}).
          </p>
          <p>Use it to check a problem or help them. Anything you change is real and is recorded as you. Access ends after 2 hours.</p>
        </div>
      </div>
    </Modal>
  );
};
