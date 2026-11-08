export type SubscriptionTier = 'STANDARD' | 'CBT_PRO' | 'AI_ELITE';

export type BillingModel =
  | 'PER_STUDENT_TERM'
  | 'FLAT_FEE_TERM'
  | 'CUSTOM_CONTRACT';

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'EXPIRED'
  | 'LOCKED'
  | 'SUSPENDED';

export type PaymentMethod =
  | 'OFFLINE_BANK_TRANSFER'
  | 'PAYSTACK'
  | 'FLUTTERWAVE'
  | 'MANUAL_CASH'
  | 'MANUAL_WIRE';

export type TransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'REJECTED';

export interface ComputedBilling {
  schoolId: string;
  schoolName: string;
  tier: SubscriptionTier;
  billingModel: BillingModel;
  activeStudentCount: number;
  effectiveFloor: number;
  billableStudentCount: number;
  appliedRate: number;
  isCustomRateApplied: boolean;
  currency: 'NGN';
  totalAmount: number;
  gracePeriodDays: number;
  calculatedAt: string;
  breakdown: {
    rawStudentCount: number;
    floorAdjustedStudents: number;
    rateFormula: string;
    summaryNotes: string;
  };
}

export type OnboardingStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface OnboardingQueueItem {
  id: string;
  schoolName: string;
  fullname: string;
  slug: string;
  email: string;
  phone: string;
  address: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
  schoolType: string | null;
  schoolCategory: string[] | null;
  curriculumType: string | null;
  proposedStudentPopulation: number;
  studentCount: number;
  staffCount: number;
  branchCount: number;
  subscriptionTier: SubscriptionTier;
  billingModel: BillingModel;
  createdAt: string;
  onboardingStatus: OnboardingStatus;
  rejectionReason: string | null;
  /** Email confirmed with the signup OTP — required before approval. */
  isVerified?: boolean;
  logo?: string | null;
  setup?: { profile: boolean; branches: boolean; academic: boolean };
}

export interface TenantSchool {
  id: string;
  schoolName: string;
  slug: string;
  fullname: string;
  email: string;
  phone: string;
  state: string | null;
  city: string | null;
  logo: string | null;
  schoolType: string | null;
  subscriptionTier: SubscriptionTier;
  billingModel: BillingModel;
  customStudentRate: number | null;
  customFlatTermRate: number | null;
  customStudentFloor: number | null;
  subscriptionStatus: SubscriptionStatus;
  onboardingStatus?: OnboardingStatus;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  isLocked: boolean;
  lockReason: string | null;
  /** SUSPENDED when the Schola team has suspended the whole school. */
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  subscriptionExpiresAt: string | null;
  gracePeriodEndsAt: string | null;
  activeStudentCount: number;
  activeStaffCount: number;
  branchCount: number;
  computedBilling: ComputedBilling;
  createdAt: string;
}

export interface PlatformPricingConfig {
  version: number;
  standardRatePerStudent: number;
  cbtProRatePerStudent: number;
  aiEliteRatePerStudent: number;
  minimumStudentFloor: number;
  defaultGracePeriodDays: number;
  isActive?: boolean;
  updatedAt?: string;
}

export interface OverviewMetrics {
  kpis: {
    totalSchools: number;
    activeSchools: number;
    graceSchools: number;
    lockedSchools: number;
    expiredSchools: number;
    totalActiveStudents: number;
    totalStaff: number;
    realizedGrossRevenue: number;
    pendingOfflineReceiptsCount: number;
    pendingOnboardingApprovalsCount?: number;
  };
  platformPricing: PlatformPricingConfig;
  recentTransactions: {
    id: string;
    schoolId: string;
    schoolName: string;
    amount: number;
    billingModel: BillingModel;
    tier: SubscriptionTier;
    term: string;
    paymentMethod: PaymentMethod;
    reference: string;
    status: TransactionStatus;
    proofUrl: string | null;
    createdAt: string;
  }[];
}

export interface SubscriptionTransaction {
  id: string;
  schoolId: string;
  schoolName?: string;
  school?: {
    id: string;
    schoolName: string;
    email: string;
    logo?: string | null;
    subscriptionTier: SubscriptionTier;
    billingModel: BillingModel;
  };
  amount: number;
  billingModel: BillingModel;
  tier: SubscriptionTier;
  appliedUnitRate: number | null;
  billedStudentCount: number | null;
  term: string;
  academicSession?: string | null;
  paymentMethod: PaymentMethod;
  reference: string;
  proofUrl: string | null;
  bankName: string | null;
  accountNumber: string | null;
  tellerNumber: string | null;
  depositorName: string | null;
  status: TransactionStatus;
  approvedById?: string | null;
  approvedBy?: {
    id: string;
    fullname: string;
    email: string;
  } | null;
  auditorNote: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullname: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

export type DemoRequestStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CLOSED';

export interface DemoRequest {
  id: string;
  reference: string;
  fullName: string;
  role: string | null;
  schoolName: string;
  email: string;
  phone: string;
  state: string | null;
  city: string | null;
  studentPopulation: string | null;
  modules: string[];
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string | null;
  source: string | null;
  status: DemoRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeletionPreview {
  id: string;
  schoolName: string;
  slug: string;
  email: string;
  fileCount: number;
  _count: {
    branches: number;
    staffs: number;
    students: number;
    classes: number;
    feePayments: number;
    subscriptionTransactions: number;
  };
}
