# Admin System Implementation Plan

## Overview

This document outlines the comprehensive plan to implement a full admin system for FamilyCare.help. Currently, the application has role fields (`admin`, `caregiver`, `viewer`) but they are not enforced. This plan will transform the decorative role system into a fully functional role-based access control (RBAC) system.

---

## Table of Contents

1. [Phase 1: Database & RLS Foundation](#phase-1-database--rls-foundation)
2. [Phase 2: Authentication & Authorization Layer](#phase-2-authentication--authorization-layer)
3. [Phase 3: Route Protection](#phase-3-route-protection)
4. [Phase 4: Admin Dashboard](#phase-4-admin-dashboard)
5. [Phase 5: User Management](#phase-5-user-management)
6. [Phase 6: System Settings](#phase-6-system-settings)
7. [Phase 7: Audit & Activity Logging](#phase-7-audit--activity-logging)
8. [Phase 8: Navigation & UI Updates](#phase-8-navigation--ui-updates)
9. [Phase 9: Edge Functions & API Protection](#phase-9-edge-functions--api-protection)
10. [Phase 10: Testing & Validation](#phase-10-testing--validation)

---

## Phase 1: Database & RLS Foundation

### 1.1 Create Role Enum Type

```sql
-- Migration: create_role_enum.sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'caregiver', 'viewer');

-- Add super_admin for system-wide access (you, the owner)
-- admin: Full access within their care circle
-- caregiver: Can create/edit records
-- viewer: Read-only access
```

### 1.2 Update Profiles Table

```sql
-- Migration: update_profiles_role.sql
ALTER TABLE profiles
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'viewer';

-- Add is_super_admin flag for platform owner
ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
```

### 1.3 Create Admin-Specific Tables

#### System Settings Table

```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Admin Activity Log Table

```sql
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'subscription', 'setting', etc.
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_target ON admin_activity_logs(target_type, target_id);
```

#### Feature Flags Table

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  allowed_roles user_role[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Role-Based RLS Policies

```sql
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role IN ('admin', 'super_admin') OR is_super_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Admin can view all profiles (super_admin only)
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_super_admin() OR auth.uid() = id);

-- Example: Admin can update user roles
CREATE POLICY "Admins can update team member roles"
  ON team_members FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- System settings: Only super admins
CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  USING (is_super_admin());

-- Admin activity logs: Admins can view, super admins can view all
CREATE POLICY "Admins can view their own activity"
  ON admin_activity_logs FOR SELECT
  USING (admin_id = auth.uid() OR is_super_admin());

CREATE POLICY "System can insert admin activity"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (true);
```

### 1.5 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/YYYYMMDD_admin_role_enum.sql` | Create | Role enum type |
| `supabase/migrations/YYYYMMDD_admin_tables.sql` | Create | Admin-specific tables |
| `supabase/migrations/YYYYMMDD_admin_rls_policies.sql` | Create | Role-based RLS policies |
| `supabase/migrations/YYYYMMDD_admin_functions.sql` | Create | Helper functions |
| `apps/dashboard/src/types/database.ts` | Modify | Add new table types |

---

## Phase 2: Authentication & Authorization Layer

### 2.1 Update Auth Context

**File:** `apps/dashboard/src/lib/auth-context.tsx`

```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // New fields
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: Permissions;
}

interface Permissions {
  canManageUsers: boolean;
  canManageTeam: boolean;
  canManageSubscriptions: boolean;
  canViewAllData: boolean;
  canEditSettings: boolean;
  canViewAuditLogs: boolean;
  canManageCarePlans: boolean;
  canEditRecords: boolean;
  canViewRecords: boolean;
}
```

### 2.2 Create Permission Hook

**File:** `apps/dashboard/src/hooks/use-permissions.ts`

```typescript
export function usePermissions() {
  const { profile, role } = useAuth();

  const permissions = useMemo(() => ({
    // Super admin only
    canManageUsers: role === 'super_admin',
    canViewAllData: role === 'super_admin',
    canEditSettings: role === 'super_admin',

    // Admin and above
    canManageTeam: ['admin', 'super_admin'].includes(role),
    canManageSubscriptions: ['admin', 'super_admin'].includes(role),
    canViewAuditLogs: ['admin', 'super_admin'].includes(role),
    canManageCarePlans: ['admin', 'super_admin'].includes(role),

    // Caregiver and above
    canEditRecords: ['caregiver', 'admin', 'super_admin'].includes(role),

    // All authenticated users
    canViewRecords: true,
  }), [role]);

  return permissions;
}
```

### 2.3 Create Authorization Guard Component

**File:** `apps/dashboard/src/components/auth/require-permission.tsx`

```typescript
interface RequirePermissionProps {
  permission: keyof Permissions;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  fallback = null,
  children
}: RequirePermissionProps) {
  const permissions = usePermissions();

  if (!permissions[permission]) {
    return fallback;
  }

  return children;
}
```

### 2.4 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/lib/auth-context.tsx` | Modify | Add role/permission state |
| `apps/dashboard/src/hooks/use-permissions.ts` | Create | Permission checking hook |
| `apps/dashboard/src/components/auth/require-permission.tsx` | Create | Permission guard component |
| `apps/dashboard/src/components/auth/require-role.tsx` | Create | Role guard component |
| `apps/dashboard/src/types/permissions.ts` | Create | Permission type definitions |

---

## Phase 3: Route Protection

### 3.1 Create Protected Route Component

**File:** `apps/dashboard/src/components/auth/protected-route.tsx`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: keyof Permissions;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/dashboard'
}: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(role)) {
        navigate(redirectTo);
        return;
      }
    }

    if (requiredPermission && !permissions[requiredPermission]) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, role, isLoading, requiredRole, requiredPermission]);

  if (isLoading) return <LoadingSpinner />;

  return children;
}
```

### 3.2 Route Configuration

**File:** `apps/dashboard/src/routes/admin-routes.tsx`

```typescript
export const adminRoutes = [
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'users', element: <ProtectedRoute requiredRole="super_admin"><UserManagement /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute requiredRole="super_admin"><SystemSettings /></ProtectedRoute> },
      { path: 'activity', element: <AdminActivity /> },
      { path: 'subscriptions', element: <SubscriptionManagement /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'feature-flags', element: <ProtectedRoute requiredRole="super_admin"><FeatureFlags /></ProtectedRoute> },
    ]
  }
];
```

### 3.3 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/components/auth/protected-route.tsx` | Create | Route protection component |
| `apps/dashboard/src/routes/admin-routes.tsx` | Create | Admin route definitions |
| `apps/dashboard/src/App.jsx` | Modify | Integrate admin routes |
| `apps/dashboard/src/components/layout/admin-layout.tsx` | Create | Admin-specific layout |

---

## Phase 4: Admin Dashboard

### 4.1 Admin Dashboard Page

**File:** `apps/dashboard/src/pages/admin/admin-dashboard.tsx`

Features:
- System health overview (from existing Diagnostics)
- Key metrics cards:
  - Total users
  - Active subscriptions
  - Care recipients count
  - Tasks completed today
- Recent activity feed
- Quick action buttons
- Alerts/warnings panel

### 4.2 Dashboard Components

```
apps/dashboard/src/components/admin/
├── admin-stats-cards.tsx      # Metric cards
├── admin-activity-feed.tsx    # Recent admin actions
├── admin-alerts-panel.tsx     # System warnings
├── admin-quick-actions.tsx    # Quick action buttons
├── admin-user-chart.tsx       # User growth chart
├── admin-subscription-chart.tsx # Revenue/subscription chart
└── index.ts                   # Barrel export
```

### 4.3 Files to Create

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/pages/admin/admin-dashboard.tsx` | Create | Main admin dashboard |
| `apps/dashboard/src/components/admin/admin-stats-cards.tsx` | Create | Stats overview cards |
| `apps/dashboard/src/components/admin/admin-activity-feed.tsx` | Create | Activity feed component |
| `apps/dashboard/src/components/admin/admin-alerts-panel.tsx` | Create | System alerts |
| `apps/dashboard/src/components/admin/admin-quick-actions.tsx` | Create | Quick action buttons |

---

## Phase 5: User Management

### 5.1 User Management Page

**File:** `apps/dashboard/src/pages/admin/user-management.tsx`

Features:
- User list with search/filter
- User details view
- Edit user role
- Disable/enable accounts
- View user's subscription status
- View user's care recipients
- Impersonate user (super_admin only)
- Export user data

### 5.2 User Management Components

```
apps/dashboard/src/components/admin/users/
├── user-list.tsx              # Paginated user table
├── user-filters.tsx           # Search and filter controls
├── user-details-dialog.tsx    # User detail modal
├── user-role-editor.tsx       # Role change component
├── user-actions-menu.tsx      # Action dropdown
├── user-subscription-badge.tsx # Subscription status
└── index.ts
```

### 5.3 User Management Hooks

**File:** `apps/dashboard/src/hooks/admin/use-admin-users.ts`

```typescript
// Fetch all users (super_admin only)
export function useAdminUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    enabled: isSuperAdmin,
  });
}

// Update user role
export function useUpdateUserRole() {
  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
      logAdminAction('update_user_role', 'user', userId);
    },
  });
}

// Disable user account
export function useDisableUser() {
  return useMutation({
    mutationFn: (userId) => disableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
      logAdminAction('disable_user', 'user', userId);
    },
  });
}
```

### 5.4 Files to Create

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/pages/admin/user-management.tsx` | Create | User management page |
| `apps/dashboard/src/components/admin/users/user-list.tsx` | Create | User table |
| `apps/dashboard/src/components/admin/users/user-details-dialog.tsx` | Create | User details modal |
| `apps/dashboard/src/components/admin/users/user-role-editor.tsx` | Create | Role editor |
| `apps/dashboard/src/hooks/admin/use-admin-users.ts` | Create | User management hooks |

---

## Phase 6: System Settings

### 6.1 System Settings Page

**File:** `apps/dashboard/src/pages/admin/system-settings.tsx`

Features:
- Application settings
  - App name, logo, branding
  - Default timezone
  - Date/time format preferences
- Email settings
  - SMTP configuration status
  - Email templates preview
- Subscription settings
  - Stripe configuration status
  - Plan limits configuration
- Security settings
  - Session timeout
  - Password requirements
  - 2FA enforcement
- Feature toggles
  - Enable/disable features globally

### 6.2 Settings Components

```
apps/dashboard/src/components/admin/settings/
├── general-settings.tsx       # App name, branding
├── email-settings.tsx         # Email configuration
├── subscription-settings.tsx  # Stripe/plans config
├── security-settings.tsx      # Security options
├── feature-toggles.tsx        # Feature flags UI
└── index.ts
```

### 6.3 Files to Create

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/pages/admin/system-settings.tsx` | Create | System settings page |
| `apps/dashboard/src/components/admin/settings/general-settings.tsx` | Create | General settings |
| `apps/dashboard/src/components/admin/settings/security-settings.tsx` | Create | Security settings |
| `apps/dashboard/src/hooks/admin/use-system-settings.ts` | Create | Settings hooks |

---

## Phase 7: Audit & Activity Logging

### 7.1 Activity Log Page

**File:** `apps/dashboard/src/pages/admin/admin-activity.tsx`

Features:
- Filterable activity log
- Filter by:
  - Admin user
  - Action type
  - Date range
  - Target type
- Export to CSV
- Detailed view of each action

### 7.2 Activity Logging Service

**File:** `apps/dashboard/src/services/admin-activity-logger.ts`

```typescript
interface AdminAction {
  action: string;
  targetType: 'user' | 'subscription' | 'setting' | 'team' | 'care_recipient';
  targetId?: string;
  details?: Record<string, unknown>;
}

export async function logAdminAction(action: AdminAction) {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('admin_activity_logs').insert({
    admin_id: user.id,
    action: action.action,
    target_type: action.targetType,
    target_id: action.targetId,
    details: action.details,
    ip_address: await getClientIP(),
    user_agent: navigator.userAgent,
  });
}
```

### 7.3 Actions to Log

| Action | Target Type | When |
|--------|-------------|------|
| `user_role_changed` | user | Admin changes user role |
| `user_disabled` | user | Admin disables account |
| `user_enabled` | user | Admin enables account |
| `subscription_modified` | subscription | Subscription changed |
| `setting_updated` | setting | System setting changed |
| `feature_flag_toggled` | setting | Feature flag changed |
| `user_impersonated` | user | Super admin impersonates |
| `data_exported` | user | User data exported |

### 7.4 Files to Create

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/pages/admin/admin-activity.tsx` | Create | Activity log page |
| `apps/dashboard/src/services/admin-activity-logger.ts` | Create | Logging service |
| `apps/dashboard/src/components/admin/activity/activity-table.tsx` | Create | Activity table |
| `apps/dashboard/src/components/admin/activity/activity-filters.tsx` | Create | Filter controls |
| `apps/dashboard/src/hooks/admin/use-admin-activity.ts` | Create | Activity hooks |

---

## Phase 8: Navigation & UI Updates

### 8.1 Update Main Navigation

**File:** `apps/dashboard/src/components/layout/sidebar.tsx`

Add admin section to navigation (conditionally rendered):

```typescript
// Only show admin nav items to admins
{isAdmin && (
  <NavSection title="Administration">
    <NavItem to="/admin" icon={Shield}>Admin Dashboard</NavItem>
    {isSuperAdmin && (
      <>
        <NavItem to="/admin/users" icon={Users}>User Management</NavItem>
        <NavItem to="/admin/settings" icon={Settings}>System Settings</NavItem>
      </>
    )}
    <NavItem to="/admin/activity" icon={Activity}>Activity Log</NavItem>
    <NavItem to="/admin/subscriptions" icon={CreditCard}>Subscriptions</NavItem>
  </NavSection>
)}
```

### 8.2 Admin Layout

**File:** `apps/dashboard/src/components/layout/admin-layout.tsx`

- Admin-specific header with breadcrumbs
- Admin sidebar navigation
- Warning banner for sensitive actions
- Different color scheme to indicate admin mode

### 8.3 Role Badge Component

**File:** `apps/dashboard/src/components/ui/role-badge.tsx`

```typescript
const roleConfig = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: Crown },
  admin: { label: 'Admin', color: 'bg-amber-100 text-amber-800', icon: Shield },
  caregiver: { label: 'Caregiver', color: 'bg-teal-100 text-teal-800', icon: UserCheck },
  viewer: { label: 'Viewer', color: 'bg-slate-100 text-slate-800', icon: Eye },
};
```

### 8.4 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/components/layout/sidebar.tsx` | Modify | Add admin nav section |
| `apps/dashboard/src/components/layout/admin-layout.tsx` | Create | Admin-specific layout |
| `apps/dashboard/src/components/layout/admin-sidebar.tsx` | Create | Admin sidebar |
| `apps/dashboard/src/components/ui/role-badge.tsx` | Create | Role badge component |

---

## Phase 9: Edge Functions & API Protection

### 9.1 Create Admin Middleware

**File:** `supabase/functions/_shared/admin-middleware.ts`

```typescript
export async function requireAdmin(req: Request, supabase: SupabaseClient) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Forbidden: Admin access required');
  }

  return { user, profile };
}

export async function requireSuperAdmin(req: Request, supabase: SupabaseClient) {
  const { user, profile } = await requireAdmin(req, supabase);

  if (!profile.is_super_admin) {
    throw new Error('Forbidden: Super admin access required');
  }

  return { user, profile };
}
```

### 9.2 Admin Edge Functions

```
supabase/functions/
├── admin-get-users/           # List all users (super_admin)
├── admin-update-user-role/    # Change user role
├── admin-disable-user/        # Disable user account
├── admin-get-stats/           # Dashboard statistics
├── admin-export-data/         # Export user data
└── admin-impersonate/         # Impersonate user (super_admin)
```

### 9.3 Files to Create

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/_shared/admin-middleware.ts` | Create | Admin auth middleware |
| `supabase/functions/admin-get-users/index.ts` | Create | Get all users |
| `supabase/functions/admin-update-user-role/index.ts` | Create | Update user role |
| `supabase/functions/admin-get-stats/index.ts` | Create | Dashboard stats |

---

## Phase 10: Testing & Validation

### 10.1 Test Cases

#### Role-Based Access Tests
- [ ] Viewer cannot access admin routes
- [ ] Caregiver cannot access admin routes
- [ ] Admin can access admin dashboard
- [ ] Admin cannot access super_admin routes
- [ ] Super admin can access all routes

#### RLS Policy Tests
- [ ] Users can only see their own data
- [ ] Admins can see team data they manage
- [ ] Super admins can see all data
- [ ] Activity logs are properly restricted

#### UI Tests
- [ ] Admin nav items hidden for non-admins
- [ ] Role badges display correctly
- [ ] Permission-gated components hidden appropriately

### 10.2 Test Files to Create

| File | Action | Description |
|------|--------|-------------|
| `apps/dashboard/src/__tests__/auth/protected-route.test.tsx` | Create | Route protection tests |
| `apps/dashboard/src/__tests__/hooks/use-permissions.test.ts` | Create | Permission hook tests |
| `supabase/tests/admin-rls.test.sql` | Create | RLS policy tests |

---

## Implementation Order

### Sprint 1: Foundation (Database & Auth)
1. Phase 1.1-1.4: Database migrations
2. Phase 2.1-2.3: Auth context updates
3. Phase 3.1: Protected route component

### Sprint 2: Core Admin Pages
4. Phase 4: Admin dashboard
5. Phase 8.1-8.2: Navigation updates

### Sprint 3: User Management
6. Phase 5: User management
7. Phase 7: Activity logging

### Sprint 4: Settings & Polish
8. Phase 6: System settings
9. Phase 9: Edge function protection
10. Phase 10: Testing

---

## File Summary

### New Files (32 files)

```
supabase/migrations/
├── YYYYMMDD_admin_role_enum.sql
├── YYYYMMDD_admin_tables.sql
├── YYYYMMDD_admin_rls_policies.sql
└── YYYYMMDD_admin_functions.sql

supabase/functions/
├── _shared/admin-middleware.ts
├── admin-get-users/index.ts
├── admin-update-user-role/index.ts
└── admin-get-stats/index.ts

apps/dashboard/src/
├── types/permissions.ts
├── hooks/
│   ├── use-permissions.ts
│   └── admin/
│       ├── use-admin-users.ts
│       ├── use-admin-activity.ts
│       └── use-system-settings.ts
├── services/
│   └── admin-activity-logger.ts
├── components/
│   ├── auth/
│   │   ├── protected-route.tsx
│   │   ├── require-permission.tsx
│   │   └── require-role.tsx
│   ├── layout/
│   │   ├── admin-layout.tsx
│   │   └── admin-sidebar.tsx
│   ├── ui/
│   │   └── role-badge.tsx
│   └── admin/
│       ├── admin-stats-cards.tsx
│       ├── admin-activity-feed.tsx
│       ├── admin-alerts-panel.tsx
│       ├── admin-quick-actions.tsx
│       ├── users/
│       │   ├── user-list.tsx
│       │   ├── user-details-dialog.tsx
│       │   └── user-role-editor.tsx
│       ├── settings/
│       │   ├── general-settings.tsx
│       │   └── security-settings.tsx
│       └── activity/
│           ├── activity-table.tsx
│           └── activity-filters.tsx
├── pages/admin/
│   ├── admin-dashboard.tsx
│   ├── user-management.tsx
│   ├── system-settings.tsx
│   └── admin-activity.tsx
└── routes/
    └── admin-routes.tsx
```

### Modified Files (5 files)

```
apps/dashboard/src/
├── lib/auth-context.tsx       # Add role/permission state
├── types/database.ts          # Add new table types
├── components/layout/sidebar.tsx  # Add admin nav
└── App.jsx                    # Integrate admin routes

supabase/
└── seed.sql                   # Add super_admin flag
```

---

## Security Considerations

1. **All admin actions must be logged** - No admin action should go unrecorded
2. **Principle of least privilege** - Default to viewer, escalate as needed
3. **Super admin separation** - Keep super_admin as a separate flag, not just a role
4. **RLS enforcement** - Never bypass RLS, even for admins
5. **Audit trail** - Maintain complete audit trail for compliance
6. **Session management** - Admin sessions should have shorter timeouts
7. **Impersonation logging** - Every impersonation must be logged with reason

---

## Notes

- All admin pages should have a distinct visual style to prevent confusion
- Consider adding 2FA requirement for admin accounts
- Implement rate limiting on admin endpoints
- Add email notifications for sensitive admin actions
- Consider implementing approval workflow for destructive actions
