import axios from 'axios';
import {
  AdminUser,
  DeletionPreview,
  OnboardingQueueItem,
  OverviewMetrics,
  PlatformPricingConfig,
  SubscriptionTransaction,
  TenantSchool,
} from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1/super-admin';

/** Domain schools' portals live under (slug.<domain>). */
export const APP_DOMAIN: string = import.meta.env.VITE_APP_DOMAIN || 'schola.com.ng';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token storage keys
const TOKEN_KEY = 'schola_super_admin_token';
const USER_KEY = 'schola_super_admin_user';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredAuth = (token: string, user: AdminUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearStoredAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  },
);

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ admin: AdminUser; accessToken: string }> {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data;
  },

  // 1. Overview KPIs
  async getOverview(): Promise<OverviewMetrics> {
    const res = await apiClient.get('/overview');
    return res.data.data;
  },

  // 2. Tenants
  async getTenants(params?: {
    search?: string;
    status?: string;
    tier?: string;
    billingModel?: string;
    isLocked?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ tenants: TenantSchool[]; pagination: { total: number; page: number; totalPages: number } }> {
    const res = await apiClient.get('/tenants', { params });
    return res.data.data;
  },

  // Single Tenant
  async getTenantById(id: string): Promise<{ school: TenantSchool; computedBilling: any; transactions: SubscriptionTransaction[] }> {
    const res = await apiClient.get(`/tenants/${id}`);
    return res.data.data;
  },

  // 3. Update Tenant Dynamic Settings
  async updateTenant(
    id: string,
    data: {
      subscriptionTier?: string;
      billingModel?: string;
      customStudentRate?: number | null;
      customFlatTermRate?: number | null;
      customStudentFloor?: number | null;
      subscriptionStatus?: string;
      isLocked?: boolean;
      lockReason?: string | null;
      subscriptionExpiresAt?: string | null;
      gracePeriodEndsAt?: string | null;
    },
  ): Promise<{ school: TenantSchool; computedBilling: any }> {
    const res = await apiClient.put(`/tenants/${id}`, data);
    return res.data.data;
  },

  // Suspend / reactivate / delete a school
  async suspendTenant(id: string, reason: string): Promise<{ message: string }> {
    const res = await apiClient.post(`/tenants/${id}/suspend`, { reason });
    return { message: res.data.message };
  },

  async reactivateTenant(id: string): Promise<{ message: string }> {
    const res = await apiClient.post(`/tenants/${id}/reactivate`);
    return { message: res.data.message };
  },

  async getDeletionPreview(id: string): Promise<DeletionPreview> {
    const res = await apiClient.get(`/tenants/${id}/deletion-preview`);
    return res.data.data;
  },

  async deleteTenant(id: string, confirmName: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/tenants/${id}`, { data: { confirmName }, timeout: 120000 });
    return { message: res.data.message };
  },

  // 4. Impersonation
  async impersonateTenant(
    id: string,
  ): Promise<{
    accessToken: string;
    isImpersonated: boolean;
    impersonatedBy: any;
    targetSchool: { id: string; schoolName: string; email: string; slug: string };
    redirectUrl: string;
  }> {
    const res = await apiClient.post(`/tenants/${id}/impersonate`);
    return res.data.data;
  },

  // 5. Global Pricing Baseline
  async getPricing(): Promise<PlatformPricingConfig> {
    const res = await apiClient.get('/pricing');
    return res.data.data;
  },

  async updatePricing(data: {
    standardRatePerStudent: number;
    cbtProRatePerStudent: number;
    aiEliteRatePerStudent: number;
    minimumStudentFloor: number;
    defaultGracePeriodDays: number;
  }): Promise<PlatformPricingConfig> {
    const res = await apiClient.put('/pricing', data);
    return res.data.data;
  },

  // 6 & 7. Reconciliation & Ledger
  async getTransactions(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: SubscriptionTransaction[]; pagination: { total: number; page: number; totalPages: number } }> {
    const res = await apiClient.get('/transactions', { params });
    return res.data.data;
  },

  async verifyTransaction(data: {
    transactionId: string;
    action: 'APPROVE' | 'REJECT';
    auditorNote?: string;
  }): Promise<any> {
    const res = await apiClient.post('/transactions/verify', data);
    return res.data.data;
  },

  async recordManualTransaction(data: {
    schoolId: string;
    amount: number;
    term: string;
    academicSession?: string;
    paymentMethod: string;
    reference?: string;
    bankName?: string;
    accountNumber?: string;
    tellerNumber?: string;
    depositorName?: string;
    auditorNote?: string;
    appliedUnitRate?: number;
    billedStudentCount?: number;
  }): Promise<any> {
    const res = await apiClient.post('/transactions/manual', data);
    return res.data.data;
  },

  // 8. Onboarding Queue
  async getOnboardingQueue(params?: {
    search?: string;
    state?: string;
  }): Promise<{ queue: OnboardingQueueItem[]; count: number }> {
    const res = await apiClient.get('/onboarding/queue', { params });
    return res.data.data;
  },

  // 9. Onboarding Action (Approve / Reject)
  async actionOnboarding(
    id: string,
    data: {
      action: 'APPROVE' | 'REJECT';
      initialPlan?: string;
      customRate?: number;
      trialDays?: number;
      rejectionReason?: string;
    },
  ): Promise<{ message: string; emailSent: boolean; school: any }> {
    const res = await apiClient.post(`/onboarding/${id}/action`, data);
    return { message: res.data.message, emailSent: res.data.data?.emailSent !== false, school: res.data.data };
  },
};
