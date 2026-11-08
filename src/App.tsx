import React, { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Plus } from 'lucide-react';
import type {
  AdminUser,
  BillingModel,
  DemoRequest,
  DemoRequestStatus,
  OnboardingQueueItem,
  OverviewMetrics,
  PlatformPricingConfig,
  SubscriptionStatus,
  SubscriptionTier,
  SubscriptionTransaction,
  TenantSchool,
} from '@/types';
import { api, clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { isKnownRoute, useRouter, type NavTab } from '@/context/RouterContext';
import { AppLayout } from '@/components/Layout';
import { Button, PageHeader } from '@/components/ui';
import { LoginView } from '@/components/LoginView';
import { OverviewView } from '@/components/OverviewView';
import { SchoolsView, type SchoolActions } from '@/components/SchoolsView';
import { OnboardingQueue } from '@/components/OnboardingQueue';
import { ReconciliationQueue } from '@/components/ReconciliationQueue';
import { GlobalPricingView } from '@/components/GlobalPricingView';
import { DynamicFeeModal } from '@/components/DynamicFeeModal';
import { RecordManualPaymentModal } from '@/components/RecordManualPaymentModal';
import { ImpersonationModal } from '@/components/ImpersonationBanner';
import { DeleteSchoolModal, SuspendSchoolModal } from '@/components/SchoolLifecycleModals';
import { DemoRequestsView } from '@/components/DemoRequestsView';

const DEFAULT_PRICING: PlatformPricingConfig = {
  version: 0,
  standardRatePerStudent: 0,
  cbtProRatePerStudent: 0,
  aiEliteRatePerStudent: 0,
  minimumStudentFloor: 0,
  defaultGracePeriodDays: 14,
};

// Start empty: sample data would look like real schools and hide connection problems.
const EMPTY_OVERVIEW: OverviewMetrics = {
  kpis: {
    totalSchools: 0,
    activeSchools: 0,
    graceSchools: 0,
    lockedSchools: 0,
    expiredSchools: 0,
    totalActiveStudents: 0,
    totalStaff: 0,
    realizedGrossRevenue: 0,
    pendingOfflineReceiptsCount: 0,
    pendingOnboardingApprovalsCount: 0,
  },
  platformPricing: DEFAULT_PRICING,
  recentTransactions: [],
};

const PAGES: Record<NavTab, { title: string; description: string; doc: string }> = {
  overview: { title: 'Overview', description: 'How Schola is doing today.', doc: 'Overview' },
  onboarding: { title: 'Approvals', description: 'New schools waiting for you. Approving emails them a link to finish setting up.', doc: 'Approvals' },
  demos: { title: 'Demo requests', description: 'Schools that asked for a demo on the website. Call or WhatsApp them, then update the status.', doc: 'Demo requests' },
  tenants: { title: 'Schools', description: 'Every school on Schola: plans, billing, suspension and deletion.', doc: 'Schools' },
  reconciliation: { title: 'Payments', description: 'Confirm bank transfers and record payments you received.', doc: 'Payments' },
  pricing: { title: 'Pricing', description: 'The standard price schools pay.', doc: 'Pricing' },
};

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;

export const App: React.FC = () => {
  const { theme } = useTheme();
  const { currentPath, currentTab, navigate, setTab } = useRouter();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const user = getStoredUser();
    return user && getStoredToken() ? user : null;
  });

  const [overview, setOverview] = useState<OverviewMetrics>(EMPTY_OVERVIEW);
  const [tenants, setTenants] = useState<TenantSchool[]>([]);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [queue, setQueue] = useState<OnboardingQueueItem[]>([]);
  const [pricing, setPricing] = useState<PlatformPricingConfig>(DEFAULT_PRICING);
  const [demos, setDemos] = useState<DemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialogs
  const [editing, setEditing] = useState<TenantSchool | null>(null);
  const [suspending, setSuspending] = useState<TenantSchool | null>(null);
  const [deleting, setDeleting] = useState<TenantSchool | null>(null);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);
  const [impersonation, setImpersonation] = useState<any | null>(null);

  useEffect(() => {
    const onLogout = () => {
      setAdminUser(null);
      toast.error('Your session ended. Please sign in again.');
      navigate('/login');
    };
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, [navigate]);

  useEffect(() => {
    if (!adminUser) {
      if (currentPath !== '/login') navigate('/login', { replace: true });
    } else if (currentPath === '/login' || currentPath === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [adminUser, currentPath, navigate]);

  useEffect(() => {
    document.title = !adminUser ? 'Sign in · Schola Admin' : `${PAGES[currentTab]?.doc || 'Schola'} · Schola Admin`;
  }, [currentTab, adminUser]);

  const fetchData = useCallback(async () => {
    if (!adminUser) return;
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([api.getOverview(), api.getTenants({ limit: 500 }), api.getTransactions({ limit: 500 }), api.getPricing(), api.getOnboardingQueue(), api.getDemoRequests()]);
      const [o, t, tx, p, q, d] = results;
      if (o.status === 'fulfilled' && o.value) setOverview(o.value);
      if (t.status === 'fulfilled' && t.value?.tenants) setTenants(t.value.tenants);
      if (tx.status === 'fulfilled' && tx.value?.transactions) setTransactions(tx.value.transactions);
      if (p.status === 'fulfilled' && p.value) setPricing(p.value);
      if (q.status === 'fulfilled' && q.value?.queue) setQueue(q.value.queue);
      if (d.status === 'fulfilled' && d.value?.requests) setDemos(d.value.requests);
      const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failed) {
        const e: any = failed.reason;
        toast.error(e?.response?.data?.message || (e?.response ? `Some data didn't load (error ${e.response.status}).` : "Can't reach the Schola server. Check your connection."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    if (adminUser) fetchData();
  }, [adminUser, fetchData]);

  // ── Auth ──
  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setStoredAuth(data.accessToken, data.admin);
      setAdminUser(data.admin);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(errMsg(err, 'Wrong email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAdminUser(null);
    navigate('/login');
  };

  // ── School actions ──
  const saveRates = async (
    schoolId: string,
    data: {
      subscriptionTier: SubscriptionTier;
      billingModel: BillingModel;
      customStudentRate: number | null;
      customFlatTermRate: number | null;
      customStudentFloor: number | null;
      subscriptionStatus: SubscriptionStatus;
      isLocked: boolean;
      lockReason: string | null;
      subscriptionExpiresAt: string | null;
      gracePeriodEndsAt: string | null;
    },
  ) => {
    try {
      const res = await api.updateTenant(schoolId, data);
      toast.success(`Saved changes for ${res.school.schoolName}.`);
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't save the changes."));
      throw err;
    }
  };

  const schoolActions: SchoolActions = {
    onEditPlan: setEditing,
    onSuspend: setSuspending,
    onDelete: setDeleting,
    onReactivate: async (s) => {
      try {
        const res = await api.reactivateTenant(s.id);
        toast.success(res.message);
        await fetchData();
      } catch (err: any) {
        toast.error(errMsg(err, "Couldn't reactivate the school."));
      }
    },
    onImpersonate: async (s) => {
      try {
        setImpersonation(await api.impersonateTenant(s.id));
      } catch (err: any) {
        toast.error(errMsg(err, "Couldn't open the school's dashboard."));
      }
    },
    onExtendGrace: async (s) => {
      const until = new Date();
      until.setDate(until.getDate() + 14);
      try {
        await api.updateTenant(s.id, { subscriptionStatus: 'GRACE_PERIOD', isLocked: false, lockReason: null, gracePeriodEndsAt: until.toISOString() });
        toast.success(`${s.schoolName} has 14 more days.`);
        await fetchData();
      } catch (err: any) {
        toast.error(errMsg(err, "Couldn't extend the grace period."));
      }
    },
  };

  const suspend = async (s: TenantSchool, reason: string) => {
    try {
      const res = await api.suspendTenant(s.id, reason);
      toast.success(res.message);
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't suspend the school."));
      throw err;
    }
  };

  const remove = async (s: TenantSchool, confirmName: string) => {
    try {
      const res = await api.deleteTenant(s.id, confirmName);
      toast.success(res.message);
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't delete the school."));
      throw err;
    }
  };

  // ── Payments, pricing, approvals ──
  const approvePayment = async (id: string, note?: string) => {
    try {
      await api.verifyTransaction({ transactionId: id, action: 'APPROVE', auditorNote: note });
      toast.success("Payment confirmed. The school's subscription is active.");
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't confirm the payment."));
    }
  };

  const rejectPayment = async (id: string, note: string) => {
    try {
      await api.verifyTransaction({ transactionId: id, action: 'REJECT', auditorNote: note });
      toast.info('Payment rejected.');
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't reject the payment."));
    }
  };

  const savePricing = async (data: any) => {
    try {
      const res = await api.updatePricing(data);
      setPricing(res);
      toast.success('Prices saved.');
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't save the prices."));
    }
  };

  const recordPayment = async (data: any) => {
    try {
      await api.recordManualTransaction(data);
      toast.success('Payment recorded.');
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't record the payment."));
      throw err;
    }
  };

  const approveSchool = async (id: string, options: { initialPlan: SubscriptionTier; trialDays: number; customRate?: number }) => {
    try {
      const res = await api.actionOnboarding(id, { action: 'APPROVE', ...options });
      if (res.emailSent) toast.success(res.message);
      else toast.warning(res.message, { duration: 10000 });
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't approve the school."));
      throw err;
    }
  };

  const rejectSchool = async (id: string, reason: string) => {
    try {
      const res = await api.actionOnboarding(id, { action: 'REJECT', rejectionReason: reason });
      if (res.emailSent) toast.info(res.message);
      else toast.warning(res.message, { duration: 10000 });
      await fetchData();
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't decline the school."));
      throw err;
    }
  };

  const setDemoStatus = async (r: DemoRequest, status: DemoRequestStatus) => {
    try {
      const updated = await api.updateDemoRequest(r.id, status);
      setDemos((list) => list.map((x) => (x.id === r.id ? { ...x, ...updated, reference: x.reference } : x)));
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't update the request."));
    }
  };

  const deleteDemo = async (r: DemoRequest) => {
    try {
      await api.deleteDemoRequest(r.id);
      setDemos((list) => list.filter((x) => x.id !== r.id));
      toast.success('Request deleted.');
    } catch (err: any) {
      toast.error(errMsg(err, "Couldn't delete the request."));
      throw err;
    }
  };

  const toaster = <Toaster position="top-right" theme={theme} richColors closeButton />;

  if (!adminUser) {
    return (
      <>
        {toaster}
        <LoginView onLogin={handleLogin} isLoading={isLoading} />
      </>
    );
  }

  const pendingPayments = transactions.filter((t) => t.status === 'PENDING').length;
  const page = PAGES[currentTab];
  const known = isKnownRoute(currentPath);

  return (
    <>
      {toaster}
      <AppLayout
        currentTab={currentTab}
        onSelectTab={setTab}
        badges={{ onboarding: queue.length, reconciliation: pendingPayments, demos: demos.filter((d) => d.status === 'NEW').length }}
        admin={adminUser}
        onLogout={handleLogout}
        onRefresh={fetchData}
        isLoading={isLoading}
      >
        {!known ? (
          <div className="py-20 text-center">
            <h1 className="text-lg font-semibold">Page not found</h1>
            <p className="mt-1 text-sm text-slate-500">There's nothing at {currentPath}.</p>
            <Button className="mt-5" variant="primary" onClick={() => navigate('/dashboard')}>
              Go to overview
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <PageHeader
              title={page.title}
              description={page.description}
              actions={
                currentTab === 'reconciliation' || currentTab === 'tenants' ? (
                  <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => setManualPaymentOpen(true)}>
                    Record payment
                  </Button>
                ) : undefined
              }
            />

            {currentTab === 'overview' && (
              <OverviewView overview={overview} schools={tenants} queue={queue} transactions={transactions} newDemos={demos.filter((d) => d.status === 'NEW').map((d) => d.schoolName)} actions={schoolActions} isLoading={isLoading} go={setTab} />
            )}
            {currentTab === 'onboarding' && (
              <OnboardingQueue queue={queue} isLoading={isLoading} onApprove={approveSchool} onReject={rejectSchool} onRefresh={fetchData} />
            )}
            {currentTab === 'demos' && <DemoRequestsView requests={demos} isLoading={isLoading} onStatus={setDemoStatus} onDelete={deleteDemo} />}
            {currentTab === 'tenants' && <SchoolsView schools={tenants} actions={schoolActions} isLoading={isLoading} />}
            {currentTab === 'reconciliation' && (
              <ReconciliationQueue transactions={transactions} onApprove={approvePayment} onReject={rejectPayment} onOpenManualModal={() => setManualPaymentOpen(true)} isLoading={isLoading} />
            )}
            {currentTab === 'pricing' && <GlobalPricingView pricing={pricing} onSavePricing={savePricing} isLoading={isLoading} />}
          </div>
        )}
      </AppLayout>

      <DynamicFeeModal school={editing} platformPricing={pricing} isOpen={!!editing} onClose={() => setEditing(null)} onSave={saveRates} />
      <SuspendSchoolModal school={suspending} onClose={() => setSuspending(null)} onConfirm={suspend} />
      <DeleteSchoolModal school={deleting} onClose={() => setDeleting(null)} onConfirm={remove} />
      <RecordManualPaymentModal schools={tenants} isOpen={manualPaymentOpen} onClose={() => setManualPaymentOpen(false)} onSubmit={recordPayment} />
      <ImpersonationModal session={impersonation} onClose={() => setImpersonation(null)} />
    </>
  );
};

export default App;
