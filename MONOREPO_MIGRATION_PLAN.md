# Monorepo Migration Plan

## Current State

- **39 pages** total (7 marketing, 32 app/dashboard)
- **164 components** (115 custom + 49 shadcn/ui)
- **5 serverless functions** (Stripe, FDA API, account cleanup)
- **Tech stack**: React 18, Vite, Tailwind, React Router, React Query, Base44 SDK

---

## Proposed Structure

```
familycare.help/
├── apps/
│   ├── marketing/          # Public marketing site
│   │   ├── src/
│   │   │   ├── pages/      # Landing, FAQ, legal pages
│   │   │   ├── components/ # Marketing-specific components
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── dashboard/          # Authenticated app
│       ├── src/
│       │   ├── pages/      # All 32 app pages
│       │   ├── components/ # App-specific components
│       │   ├── lib/        # Auth, query client
│       │   ├── api/        # Base44 client
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
├── packages/
│   ├── ui/                 # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/ # All 49 shadcn components
│   │   │   ├── hooks/      # use-mobile, use-toast
│   │   │   └── index.ts    # Exports
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── shared/             # Shared utilities & types
│   │   ├── src/
│   │   │   ├── utils/      # cn(), createPageUrl()
│   │   │   ├── styles/     # CSS variables, globals
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/             # Shared configs
│       ├── tailwind/       # Base Tailwind preset
│       ├── eslint/         # ESLint config
│       └── typescript/     # TSConfig base
│
├── functions/              # Serverless functions (unchanged)
│   ├── stripe-webhook.ts
│   ├── stripe-create-subscription.ts
│   ├── handle-subscription-cancellation.ts
│   ├── search-medications.ts
│   └── delete-expired-accounts.ts
│
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # pnpm workspaces
├── turbo.json              # Turborepo config
└── .gitignore
```

---

## Package Manager: pnpm + Turborepo

**Why pnpm:**
- Faster installs with hard links
- Strict dependency resolution
- Native workspace support
- Disk space efficient

**Why Turborepo:**
- Intelligent caching
- Parallel task execution
- Dependency-aware builds
- Simple configuration

---

## Page Distribution

### Marketing App (7 pages)
| Page | Current Path | New Path |
|------|-------------|----------|
| Landing | `/Landing` | `/` |
| FAQ | `/FAQ` | `/faq` |
| PrivacyPolicy | `/PrivacyPolicy` | `/privacy` |
| TermsOfService | `/TermsOfService` | `/terms` |
| CookiePolicy | `/CookiePolicy` | `/cookies` |
| LegalDisclosure | `/LegalDisclosure` | `/legal` |
| RecordRetentionPolicy | `/RecordRetentionPolicy` | `/retention-policy` |

### Dashboard App (32 pages)
All authenticated pages remain in the dashboard app with their existing routes.

---

## Component Distribution

### packages/ui (Shared UI Library)
All 49 shadcn/ui components from `src/components/ui/`:
- button, input, textarea, checkbox, select, etc.
- dialog, alert-dialog, sheet, drawer, popover
- card, table, tabs, accordion
- toast, sonner, skeleton, progress
- All Radix UI primitives

### apps/dashboard/components (App-Specific)
Feature components that are only used in the dashboard:
- `dashboard/` - DashboardWidget, StatCard, etc.
- `medications/` - MedicationForm, RefillTracker, etc.
- `appointments/` - AppointmentForm
- `careplan/` - CarePlanForm, CarePlanCard, etc.
- `messaging/` - MessageInput, MessageThread, etc.
- `collaboration/` - TaskAssignmentList, SharedCalendarView, etc.
- `tasks/` - TaskForm, TaskCompletionModal
- `scheduling/` - ShiftCalendar, ShiftForm, etc.
- `reports/` - ActivityLogReport, ReportExporter, etc.
- `notifications/` - NotificationBell, NotificationSettings
- `auth/` - LegalAcceptanceModal
- `shared/` - FileUpload, ShareButton, ShareQRCode
- `emergency/` - EmergencyInfoCard
- `onboarding/` - OnboardingFlow, OnboardingWizard
- `care/` - CareRecipientForm
- `client/` - ClientPortalNav

### apps/marketing/components (Marketing-Specific)
- Hero sections
- Feature grids
- Testimonials
- CTA components
- Marketing navigation

---

## Migration Steps

### Phase 1: Initialize Monorepo Structure
1. Initialize pnpm workspaces at root
2. Add Turborepo configuration
3. Create directory structure for `apps/` and `packages/`
4. Set up shared TypeScript and ESLint configs

### Phase 2: Extract Shared Packages
1. **packages/ui**: Move all shadcn components
   - Update imports to use package exports
   - Export all components from index.ts
   - Include Tailwind plugin for component styles

2. **packages/shared**: Move utilities
   - `cn()` utility
   - `createPageUrl()` utility
   - CSS variables and global styles
   - Shared types/interfaces

3. **packages/config**: Create shared configs
   - Base Tailwind preset with CSS variables
   - ESLint config
   - TypeScript base config

### Phase 3: Create Marketing App
1. Initialize new Vite app in `apps/marketing/`
2. Move marketing pages (Landing, FAQ, legal pages)
3. Create simplified Layout without auth
4. Update routing for clean URLs
5. Configure Vite and Tailwind to use shared packages

### Phase 4: Create Dashboard App
1. Initialize new Vite app in `apps/dashboard/`
2. Move all authenticated pages
3. Move app-specific components
4. Move auth context and Base44 client
5. Move React Query setup
6. Configure Base44 Vite plugin

### Phase 5: Update Build & Deploy
1. Configure Turborepo pipelines for build/dev/lint
2. Update deployment configuration
3. Set up domain routing (e.g., `familycare.help` → marketing, `app.familycare.help` → dashboard)
4. Update environment variables per app

---

## Dependency Graph

```
packages/config
    └── packages/shared
            └── packages/ui
                    ├── apps/marketing
                    └── apps/dashboard
```

---

## Root package.json

```json
{
  "name": "familycare-help",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:marketing": "turbo dev --filter=marketing",
    "dev:dashboard": "turbo dev --filter=dashboard",
    "build": "turbo build",
    "lint": "turbo lint",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

---

## turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## Deployment Strategy

### Option A: Subdomain Routing (Recommended)
- `familycare.help` → Marketing app
- `app.familycare.help` → Dashboard app
- Separate deployments, independent scaling

### Option B: Path-based Routing
- `familycare.help/` → Marketing app
- `familycare.help/app/*` → Dashboard app
- Single deployment with reverse proxy

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Base44 Vite plugin compatibility | Test plugin with monorepo structure early |
| Shared component styling issues | Use Tailwind preset pattern |
| Auth flow between apps | Shared auth domain/cookies |
| Increased build complexity | Turborepo caching reduces impact |
| Environment variable management | Per-app .env files with shared secrets |

---

## Success Criteria

- [ ] Both apps build independently
- [ ] Shared UI components work in both apps
- [ ] Auth flow seamless between apps
- [ ] Dev experience improved (faster builds)
- [ ] Deployment pipeline updated
- [ ] No functionality regression
