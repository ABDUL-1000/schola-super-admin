import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import {
  AdminUser,
  BillingModel,
  OnboardingQueueItem,
  OverviewMetrics,
  PlatformPricingConfig,
  SubscriptionStatus,
  SubscriptionTier,
  SubscriptionTransaction,
  TenantSchool,
} from '@/types';
import {
  api,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
} from '@/lib/api';
import {
  MOCK_OVERVIEW,
  MOCK_PRICING,
  MOCK_TENANTS,
  MOCK_TRANSACTIONS,
  MOCK_ONBOARDING_QUEUE,
} from '@/lib/mockData';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { KPIOverviewGrid } from '@/components/KPIOverviewGrid';
import { TenantsTable } from '@/components/TenantsTable';
import { DynamicFeeModal } from '@/components/DynamicFeeModal';
import { ReconciliationQueue } from '@/components/ReconciliationQueue';
import { GlobalPricingView } from '@/components/GlobalPricingView';
import { RecordManualPaymentModal } from '@/components/RecordManualPaymentModal';
import { ImpersonationModal } from '@/components/ImpersonationBanner';
import { OnboardingQueue } from '@/components/OnboardingQueue';
import { LoginView } from '@/components/LoginView';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, isKnownRoute } from '@/context/RouterContext';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const { currentPath, currentTab, navigate, setTab } = useRouter();

  // Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const user = getStoredUser();
    const token = getStoredToken();
    return user && token ? user : null;
  });

  // Data States
  const [overview, setOverview] = useState<OverviewMetrics>(MOCK_OVERVIEW);
  const [tenants, setTenants] = useState<TenantSchool[]>(MOCK_TENANTS);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(MOCK_TRANSACTIONS);
  const [onboardingQueue, setOnboardingQueue] = useState<OnboardingQueueItem[]>(MOCK_ONBOARDING_QUEUE);
  const [pricing, setPricing] = useState<PlatformPricingConfig>(MOCK_PRICING);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [selectedSchoolForRates, setSelectedSchoolForRates] = useState<TenantSchool | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState<boolean>(false);
  const [impersonationSession, setImpersonationSession] = useState<any | null>(null);

  // Listen for auth-logout event triggered by 401 response interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setAdminUser(null);
      toast.error('Session expired. Please sign in again.');
      navigate('/login');
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [navigate]);

  // Sync unauthenticated / authenticated routing
  useEffect(() => {
    if (!adminUser) {
      if (currentPath !== '/login') {
        navigate('/login', { replace: true });
      }
    } else {
      if (currentPath === '/login' || currentPath === '/') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [adminUser, currentPath, navigate]);

  // Dynamically update document title based on active route
  useEffect(() => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard | Schola Super Admin',
      '/tenants': 'Tenant Schools & Billing | Schola Super Admin',
      '/onboarding': 'Onboarding Queue | Schola Super Admin',
      '/reconciliation': 'Payment Approvals | Schola Super Admin',
      '/pricing': 'Global Seat Pricing | Schola Super Admin',
      '/login': 'Admin Login | Schola Super Admin',
    };
    document.title = titles[currentPath] || 'Schola Super Admin';
  }, [currentPath]);

  // Fetch all master data
  const fetchData = useCallback(async () => {
    if (!adminUser) return;
    setIsLoading(true);
    try {
      const [overviewRes, tenantsRes, transactionsRes, pricingRes, onboardingRes] = await Promise.allSettled([
        api.getOverview(),
        api.getTenants(),
        api.getTransactions(),
        api.getPricing(),
        api.getOnboardingQueue(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        setOverview(overviewRes.value);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.tenants) {
        setTenants(tenantsRes.value.tenants);
      }
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.transactions) {
        setTransactions(transactionsRes.value.transactions);
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value) {
        setPricing(pricingRes.value);
      }
      if (onboardingRes.status === 'fulfilled' && onboardingRes.value?.queue) {
        setOnboardingQueue(onboardingRes.value.queue);
      }
    } catch (err: any) {
      console.warn('API sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    if (adminUser) {
      fetchData();
    }
  }, [adminUser, fetchData]);

  // Auth Handler
  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setStoredAuth(data.accessToken, data.admin);
      setAdminUser(data.admin);
      toast.success(`Welcome back, ${data.admin.fullname}! Master session active.`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAdminUser(null);
    toast.info('Platform Master Backoffice session terminated.');
    navigate('/login');
  };

  // Actions
  const handleEditRates = (school: TenantSchool) => {
    setSelectedSchoolForRates(school);
    setIsRateModalOpen(true);
  };

  const handleSaveRates = async (
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
      toast.success(`Tenant billing configuration updated for ${res.school.schoolName}!`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update tenant rates.');
    }
  };

  const handleToggleLock = async (school: TenantSchool) => {
    const nextLocked = !school.isLocked;
    const lockReason = nextLocked ? 'Emergency lockout engaged by Platform Super Admin.' : null;

    try {
      await api.updateTenant(school.id, {
        isLocked: nextLocked,
        lockReason,
        subscriptionStatus: nextLocked ? 'LOCKED' : 'ACTIVE',
      });
      toast.success(nextLocked ? `School workspace locked!` : `School workspace unlocked.`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update lock status.');
    }
  };

  const handleExtendGracePeriod = async (school: TenantSchool) => {
    const extendedDate = new Date();
    extendedDate.setDate(extendedDate.getDate() + 14);
    const dateStr = extendedDate.toISOString();

    try {
      await api.updateTenant(school.id, {
        subscriptionStatus: 'GRACE_PERIOD',
        isLocked: false,
        lockReason: null,
        gracePeriodEndsAt: dateStr,
      });
      toast.success(`14 days grace period extended for ${school.schoolName}!`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to extend grace period.');
    }
  };

  const handleImpersonate = async (school: TenantSchool) => {
    try {
      const session = await api.impersonateTenant(school.id);
      setImpersonationSession(session);
      toast.info(`Audit impersonation session generated for ${school.schoolName}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate audit impersonation session.');
    }
  };

  const handleApprovePayment = async (txId: string, note?: string) => {
    try {
      await api.verifyTransaction({
        transactionId: txId,
        action: 'APPROVE',
        auditorNote: note,
      });
      toast.success('Offline bank payment approved! School subscription activated.');
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve payment.');
    }
  };

  const handleRejectPayment = async (txId: string, note: string) => {
    try {
      await api.verifyTransaction({
        transactionId: txId,
        action: 'REJECT',
        auditorNote: note,
      });
      toast.info('Payment proof rejected.');
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject payment.');
    }
  };

  const handleSavePricing = async (data: any) => {
    try {
      const res = await api.updatePricing(data);
      setPricing(res);
      toast.success(`Platform baseline pricing version ${res.version} published!`);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish pricing.');
    }
  };

  const handleRecordManualPayment = async (data: any) => {
    try {
      await api.recordManualTransaction(data);
      toast.success('Manual payment successfully posted to platform ledger!');
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record manual payment.');
    }
  };

  // 8. Onboarding Review Handlers
  const handleApproveOnboarding = async (
    id: string,
    options: {
      initialPlan: SubscriptionTier;
      trialDays: number;
      customRate?: number;
    }
  ) => {
    try {
      await api.actionOnboarding(id, {
        action: 'APPROVE',
        initialPlan: options.initialPlan,
        trialDays: options.trialDays,
        customRate: options.customRate,
      });
      toast.success('School application approved! Tenant activated with trial access.');
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve school registration.');
    }
  };

  const handleRejectOnboarding = async (id: string, reason: string) => {
    try {
      await api.actionOnboarding(id, {
        action: 'REJECT',
        rejectionReason: reason,
      });
      toast.info('School application rejected. Rejection notice email sent.');
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject school registration.');
    }
  };

  if (!adminUser) {
    return (
      <>
        <Toaster position="top-right" theme={theme} richColors />
        <LoginView onLogin={handleLogin} isLoading={isLoading} />
      </>
    );
  }

  const pendingProofsCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
      <Toaster position="top-right" theme={theme} richColors />

      {/* 1. Isolated Shell: Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setTab}
        adminUser={adminUser}
        pendingCount={pendingProofsCount}
        pendingOnboardingCount={onboardingQueue.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          title={
            !isKnownRoute(currentPath)
              ? 'Page Not Found'
              : currentTab === 'overview'
              ? 'Platform Overview'
              : currentTab === 'onboarding'
              ? 'Onboarding Approvals & Verification'
              : currentTab === 'tenants'
              ? 'Tenant Schools & Billing'
              : currentTab === 'reconciliation'
              ? 'Offline Payment Reconciliation'
              : 'Global Baseline Pricing'
          }
          subtitle={
            !isKnownRoute(currentPath)
              ? 'The requested URL does not match any active backoffice route'
              : currentTab === 'overview'
              ? 'Multi-tenant health metrics, headcount, and cleared gross inflows'
              : currentTab === 'onboarding'
              ? 'Review pending self-registered schools, assign trial plans, and activate workspaces'
              : currentTab === 'tenants'
              ? 'Search, audit, and configure dynamic per-school rates & system locks'
              : currentTab === 'reconciliation'
              ? 'Review uploaded bank transfer slips, wire receipts, and instant activations'
              : 'Configure platform-wide versioned rates per student and headcount floors'
          }
          currentTab={currentTab}
          pendingCount={pendingProofsCount + onboardingQueue.length}
          onRefresh={fetchData}
          isLoading={isLoading}
          onOpenManualPayment={() => setIsManualPaymentOpen(true)}
        />

        <main className="p-8 space-y-8 flex-1">
          {/* 404 Route Not Found */}
          {!isKnownRoute(currentPath) && (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-lg font-bold">
                404
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Page Not Found
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The requested path <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">{currentPath}</code> does not exist on this backoffice control plane.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Return to Platform Dashboard
              </button>
            </div>
          )}

          {/* Tab 1: Overview (/dashboard) */}
          {isKnownRoute(currentPath) && currentTab === 'overview' && (
            <div className="space-y-8">
              <KPIOverviewGrid
                metrics={overview}
                onNavigateToTab={(tab) => setTab(tab)}
              />

              {/* Tenants Quick Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      Active Tenant Directory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Top tenant schools with live student headcounts and calculated term invoices
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/tenants')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    View All {tenants.length} Schools →
                  </button>
                </div>

                <TenantsTable
                  tenants={tenants.slice(0, 5)}
                  onEditRates={handleEditRates}
                  onImpersonate={handleImpersonate}
                  onToggleLock={handleToggleLock}
                  onExtendGracePeriod={handleExtendGracePeriod}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Tab: Onboarding Approvals Queue (/onboarding) */}
          {isKnownRoute(currentPath) && currentTab === 'onboarding' && (
            <OnboardingQueue
              queue={onboardingQueue}
              isLoading={isLoading}
              onApprove={handleApproveOnboarding}
              onReject={handleRejectOnboarding}
              onRefresh={fetchData}
            />
          )}

          {/* Tab 2: Tenants Management (/tenants) */}
          {isKnownRoute(currentPath) && currentTab === 'tenants' && (
            <TenantsTable
              tenants={tenants}
              onEditRates={handleEditRates}
              onImpersonate={handleImpersonate}
              onToggleLock={handleToggleLock}
              onExtendGracePeriod={handleExtendGracePeriod}
              isLoading={isLoading}
            />
          )}

          {/* Tab 3: Offline Payment Approvals / Reconciliation (/reconciliation) */}
          {isKnownRoute(currentPath) && currentTab === 'reconciliation' && (
            <ReconciliationQueue
              transactions={transactions}
              onApprove={handleApprovePayment}
              onReject={handleRejectPayment}
              onOpenManualModal={() => setIsManualPaymentOpen(true)}
              isLoading={isLoading}
            />
          )}

          {/* Tab 4: Global Baseline Pricing (/pricing) */}
          {isKnownRoute(currentPath) && currentTab === 'pricing' && (
            <GlobalPricingView
              pricing={pricing}
              onSavePricing={handleSavePricing}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>

      {/* Dynamic Fee Configuration Modal */}
      <DynamicFeeModal
        school={selectedSchoolForRates}
        platformPricing={pricing}
        isOpen={isRateModalOpen}
        onClose={() => {
          setIsRateModalOpen(false);
          setSelectedSchoolForRates(null);
        }}
        onSave={handleSaveRates}
      />

      {/* Record Manual Payment Modal */}
      <RecordManualPaymentModal
        schools={tenants}
        isOpen={isManualPaymentOpen}
        onClose={() => setIsManualPaymentOpen(false)}
        onSubmit={handleRecordManualPayment}
      />

      {/* Impersonation Session Modal */}
      <ImpersonationModal
        session={impersonationSession}
        onClose={() => setImpersonationSession(null)}
      />
    </div>
  );
};

export default App;
