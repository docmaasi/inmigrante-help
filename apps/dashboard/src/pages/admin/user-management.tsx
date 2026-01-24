import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import {
  useAdminUsers,
  useDisableUser,
  useEnableUser,
  type AdminUserFilters,
  type AdminUserProfile,
} from '@/hooks/admin/use-admin-users';
import { UserList } from '@/components/admin/users/user-list';
import { UserRoleEditor } from '@/components/admin/users/user-role-editor';
import { USER_ROLES, ROLE_DISPLAY_CONFIG, type UserRole } from '@/types/permissions';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Shield,
  XCircle,
  Loader2,
} from 'lucide-react';

const SUBSCRIPTION_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trial' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'disabled', label: 'Disabled' },
];

function UserManagement(): JSX.Element {
  const { user: currentUser } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const [filters, setFilters] = useState<AdminUserFilters>({
    search: '',
    role: 'all',
    subscriptionStatus: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  });

  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useAdminUsers(filters);
  const disableUserMutation = useDisableUser();
  const enableUserMutation = useEnableUser();

  const handleSearch = useCallback((): void => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
      page: 1,
    }));
  }, [searchInput]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleRoleFilterChange(value: string): void {
    setFilters((prev) => ({
      ...prev,
      role: value as UserRole | 'all',
      page: 1,
    }));
  }

  function handleSubscriptionFilterChange(value: string): void {
    setFilters((prev) => ({
      ...prev,
      subscriptionStatus: value,
      page: 1,
    }));
  }

  function handleFiltersChange(newFilters: AdminUserFilters): void {
    setFilters(newFilters);
  }

  function handleClearFilters(): void {
    setSearchInput('');
    setFilters({
      search: '',
      role: 'all',
      subscriptionStatus: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10,
    });
  }

  function handleViewDetails(user: AdminUserProfile): void {
    setSelectedUser(user);
  }

  function handleEditRole(user: AdminUserProfile): void {
    setSelectedUser(user);
    setIsRoleEditorOpen(true);
  }

  function handleDisableAccount(user: AdminUserProfile): void {
    setSelectedUser(user);
    setIsDisableDialogOpen(true);
  }

  function handleEnableAccount(user: AdminUserProfile): void {
    setSelectedUser(user);
    setIsEnableDialogOpen(true);
  }

  async function confirmDisableAccount(): Promise<void> {
    if (!selectedUser) {
      return;
    }

    try {
      await disableUserMutation.mutateAsync({
        userId: selectedUser.id,
        reason: 'Disabled by admin',
      });
      setIsDisableDialogOpen(false);
      setSelectedUser(null);
    } catch {
      // Error handled by mutation
    }
  }

  async function confirmEnableAccount(): Promise<void> {
    if (!selectedUser) {
      return;
    }

    try {
      await enableUserMutation.mutateAsync({
        userId: selectedUser.id,
      });
      setIsEnableDialogOpen(false);
      setSelectedUser(null);
    } catch {
      // Error handled by mutation
    }
  }

  function handleRoleEditorSuccess(): void {
    refetch();
  }

  const hasActiveFilters =
    filters.search ||
    filters.role !== 'all' ||
    filters.subscriptionStatus !== 'all';

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Access Denied</p>
                  <p className="text-sm text-red-600">
                    You do not have permission to access user management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <p className="text-indigo-100 text-sm font-normal">
                    Manage user accounts, roles, and permissions
                  </p>
                </div>
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="search-users" className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search-users"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="w-full sm:w-40">
                <label htmlFor="role-filter" className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Role
                </label>
                <Select value={filters.role} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_DISPLAY_CONFIG[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <label htmlFor="subscription-filter" className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Subscription
                </label>
                <Select value={filters.subscriptionStatus} onValueChange={handleSubscriptionFilterChange}>
                  <SelectTrigger id="subscription-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-800 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Users
              {data && (
                <Badge variant="secondary" className="ml-2">
                  {data.totalCount.toLocaleString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <UserList
              users={data?.users ?? []}
              totalCount={data?.totalCount ?? 0}
              page={data?.page ?? 1}
              pageSize={data?.pageSize ?? 10}
              totalPages={data?.totalPages ?? 1}
              isLoading={isLoading}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onViewDetails={handleViewDetails}
              onEditRole={handleEditRole}
              onDisableAccount={handleDisableAccount}
              onEnableAccount={handleEnableAccount}
            />
          </CardContent>
        </Card>

        <UserRoleEditor
          user={selectedUser}
          isOpen={isRoleEditorOpen}
          onClose={() => {
            setIsRoleEditorOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={handleRoleEditorSuccess}
        />

        <AlertDialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable User Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disable the account for{' '}
                <span className="font-medium text-slate-900">
                  {selectedUser?.full_name ?? selectedUser?.email}
                </span>
                ? This will prevent them from accessing the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={disableUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDisableAccount}
                disabled={disableUserMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {disableUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable Account'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enable User Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to enable the account for{' '}
                <span className="font-medium text-slate-900">
                  {selectedUser?.full_name ?? selectedUser?.email}
                </span>
                ? This will restore their access to the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={enableUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmEnableAccount}
                disabled={enableUserMutation.isPending}
              >
                {enableUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable Account'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export { UserManagement };
