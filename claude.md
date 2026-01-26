# FamilyCare.Help - Repository Context

## Project Overview

**FamilyCare.Help** is a centralized digital platform designed to help families coordinate care, communicate clearly, document responsibilities, and reduce confusion when supporting a loved one (seniors, people with disabilities, and individuals with ongoing care needs).

This app replaces scattered texts, emails, notes, and verbal agreements with a secure, organized, and accountable system.

## Product Vision

FamilyCare.Help aims to become the default digital home for family caregiving, empowering families to provide better care with less stress, clearer communication, and stronger accountability—all while respecting the dignity of the loved one being supported.

## Technical Architecture

### Monorepo Structure (Turborepo)

This is a **Turborepo monorepo** with the following structure:

```
familycare.help/
├── apps/
│   ├── dashboard/          # Main care coordination app
│   └── marketing/          # Marketing website
├── packages/
│   ├── ui/                # Shared UI components
│   ├── shared/            # Shared utilities and logic
│   └── config/            # Shared configs (eslint, tailwind, typescript)
└── supabase/              # Database migrations and functions
```

### Technology Stack

**Frontend:**
- **Framework:** React 18.2
- **Build Tool:** Vite 6.x
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Radix UI primitives
- **State Management:** @tanstack/react-query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Drag & Drop:** @hello-pangea/dnd

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe (react-stripe-js)

**Development:**
- **Monorepo:** Turborepo
- **Package Manager:** pnpm 9.x
- **Node Version:** >= 18
- **TypeScript:** 5.8.x

### Apps

#### Dashboard (`apps/dashboard`)
- Main application for family care coordination
- Features: tasks, appointments, notes, messaging, documents
- Role-based access control (Admin, Caregiver, Viewer)
- Subscription management via Stripe

#### Marketing (`apps/marketing`)
- Public-facing marketing website
- Landing page, pricing, features
- Lead generation and sign-ups

### Key Features (MVP)

1. **User Accounts & Profiles**
   - Primary Account Holder
   - Loved One Profile (senior or person with disability)
   - Invited Family Members (role-based access)

2. **Care Coordination Dashboard**
   - Tasks, appointments, notes, documents overview

3. **Task & Responsibility Tracking**
   - Assign tasks to specific caregivers
   - Due dates and status updates

4. **Secure Family Communication**
   - In-app messages tied to care topics
   - Messages are permanent and non-editable

5. **Notes & Documentation**
   - Daily care notes
   - Incident or observation logs
   - Upload PDFs, photos, or documents

6. **Record Retention**
   - Data retained while subscription is active
   - 90-day retention after cancellation

### Subscription Model

- **Base Plan:** Includes 1 Loved One Profile + core features
- **Add-Ons:** Additional Loved One Profiles at $5/month each

### Database Schema

The database includes the following main tables:
- `profiles` - User profiles
- `loved_ones` - Loved one profiles
- `family_members` - Family member associations and roles
- `tasks` - Task management
- `notes` - Care notes and observations
- `messages` - Family communication
- `documents` - File uploads and metadata
- `subscriptions` - Stripe subscription data
- `admin_users` - Admin role assignments

**Admin System:**
- Role-based admin access (super_admin, support_admin, billing_admin)
- Audit logging for admin actions
- RLS policies for security

## Development Guidelines

### Running the Project

```bash
# Install dependencies
pnpm install

# Run both apps in dev mode
pnpm dev

# Run specific app
pnpm dev:dashboard
pnpm dev:marketing

# Build all apps
pnpm build

# Build specific app
pnpm build:dashboard
```

### Environment Variables

Each app needs its own `.env` file:

**apps/dashboard/.env:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

**apps/marketing/.env:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Management

```bash
# Supabase local development
cd supabase
supabase start
supabase db reset  # Apply migrations
supabase db seed   # Run seed data
```

### Important Safeguards

**⚠️ CRITICAL: This project is maintained by a non-traditional developer using "vibe coding" approach.**

When assisting with this codebase:

1. **ALWAYS explain what you're doing and why** before making changes
2. **NEVER assume technical knowledge** - explain concepts clearly
3. **Test everything** - verify changes work before moving on
4. **Ask permission** before making architectural changes
5. **Provide rollback instructions** when making risky changes
6. **Check for breaking changes** - especially in shared packages
7. **Validate database migrations** carefully before applying
8. **Use clear, simple code** - prioritize readability over cleverness
9. **Add comments** for complex logic
10. **Keep it simple** - avoid over-engineering

### Code Style

- Use functional React components (no class components)
- Use TypeScript for type safety
- Follow existing patterns in the codebase
- Keep components small and focused
- Use Tailwind for styling (avoid custom CSS)
- Use Radix UI for accessible components

### Git Workflow

- Main branch: `main`
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/bug-name`
- Always test before committing
- Write clear commit messages

### Security Considerations

- NOT HIPAA compliant at launch (informational use only)
- Row Level Security (RLS) policies in Supabase
- Encrypted data storage
- Secure authentication via Supabase
- Clear disclaimers: Not a substitute for professional medical/legal advice

### Testing Approach

- Manual testing in development
- Test all user flows before deploying
- Check responsive design (mobile-first)
- Verify Stripe integration in test mode
- Test role-based permissions thoroughly

### Deployment

- Marketing site: Vercel
- Dashboard: Vercel
- Database: Supabase Cloud
- File Storage: Supabase Storage

## Support & Documentation

- Product Requirements: See this document
- Migration Plans: `MONOREPO_MIGRATION_PLAN.md`
- Admin Implementation: `ADMIN_IMPLEMENTATION_PLAN.md`

## Future Enhancements (Post-MVP)

- Care calendar sync
- AI-assisted care summaries
- Caregiver time tracking
- White-label options for organizations
- Optional integrations with healthcare/social services

---

**Remember:** This is a care coordination tool for families under stress. Keep the UX simple, calming, and intuitive. Prioritize clarity and ease of use over technical sophistication.
