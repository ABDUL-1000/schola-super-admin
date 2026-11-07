# Schola Platform Super Admin Dashboard (Master Backoffice)

Isolated, high-security Platform Super Admin Backoffice for the Schola Multi-Tenant School Management SaaS.

## Architecture & Features

- **Strict RBAC & Tenant Isolation:** Exclusively for `PLATFORM_SUPER_ADMIN` owners. Isolated bundle and domain boundary ensure zero code/type leaks to tenant school admins.
- **Dynamic Per-School Billing Engine:**
  - Priority override logic: `customStudentRate` or `customFlatTermRate` overrides platform baseline.
  - Headcount floor enforcement: `Math.max(activeStudents, customFloor ?? platformFloor)`.
  - Tier versioning: `STANDARD`, `CBT_PRO`, `AI_ELITE`.
- **Financial Ledger & Offline Reconciliation:**
  - Bank teller and wire proof review queue with high-res receipt viewer.
  - One-click **Approve & Activate** (extends subscription term, unlocks school workspace).
  - One-click **Reject** with immutable auditor notes.
  - Manual cash/wire payment recording.
- **Tenant Management & Access Control:**
  - Live active student and staff metrics.
  - Emergency Tenant System Lockout (`isLocked`, `lockReason`).
  - 14-day Grace Period extensions.
  - Cryptographic Impersonation audit sessions (`isImpersonated: true`, 2-hour TTL).
- **Global Baseline Pricing:**
  - Configurable standard, CBT, and AI elite term rates.
  - Minimum student floor thresholds.

## Running Locally

```bash
# 1. Start the Backend API (runs on port 5000)
cd ../edumasterBackend
npm run dev

# 2. Start the Master Backoffice (runs on port 3004)
cd ../schola-admin-web
npm run dev
```

Visit: `http://localhost:3004` (or navigate to `http://localhost:3001/super-admin`).

### Default Credentials
- **Email:** `superadmin@schola.xyz`
- **Password:** `Admin@123456`
