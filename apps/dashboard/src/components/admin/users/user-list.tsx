import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge, type UserRole } from '@/components/ui/role-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Shield,
  UserX,
  UserCheck,
  Loader2,
  Users,
} from 'lucide-react';
import type { AdminUserProfile, AdminUserFilters } from '@/hooks/admin/use-admin-users';

interface UserListProps {
  users: AdminUserProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  filters: AdminUserFilters;
  onFiltersChange: (filters: AdminUserFilters) => void;
  onViewDetails: (user: AdminUserProfile) => void;
  onEditRole: (user: AdminUserProfile) => void;
  onDisableAccount: (user: AdminUserProfile) => void;
  onEnableAccount: (user: AdminUserProfile) => void;
}

type SortableColumn = 'full_name' | 'email' | 'role' | 'created_at';

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return '??';
}

function getSubscriptionBadge(status: string): JSX.Element {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    trialing: { label: 'Trial', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    past_due: { label: 'Past Due', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    canceled: { label: 'Canceled', className: 'bg-slate-100 text-slate-800 border-slate-200' },
    disabled: { label: 'Disabled', className: 'bg-red-100 text-red-800 border-red-200' },
    incomplete: { label: 'Incomplete', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function UserList({
  users,
  totalCount,
  page,
  pageSize,
  totalPages,
  isLoading,
  filters,
  onFiltersChange,
  onViewDetails,
  onEditRole,
  onDisableAccount,
  onEnableAccount,
}: UserListProps): JSX.Element {
  const [sortColumn, setSortColumn] = useState<SortableColumn>(filters.sortBy ?? 'created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.sortOrder ?? 'desc');

  function handleSort(column: SortableColumn): void {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onFiltersChange({
      ...filters,
      sortBy: column,
      sortOrder: newDirection,
    });
  }

  function handlePageChange(newPage: number): void {
    onFiltersChange({
      ...filters,
      page: newPage,
    });
  }

  function renderSortButton(column: SortableColumn, label: string): JSX.Element {
    const isActive = sortColumn === column;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(column)}
        className={`h-8 px-2 font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}
      >
        {label}
        <ArrowUpDown className={`ml-1 h-3 w-3 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
      </Button>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-600">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No users found</h3>
        <p className="text-sm text-slate-500 mt-1">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[250px]">{renderSortButton('full_name', 'Name')}</TableHead>
            <TableHead className="w-[200px]">{renderSortButton('email', 'Email')}</TableHead>
            <TableHead className="w-[120px]">{renderSortButton('role', 'Role')}</TableHead>
            <TableHead className="w-[120px]">Subscription</TableHead>
            <TableHead className="w-[120px]">{renderSortButton('created_at', 'Created')}</TableHead>
            <TableHead className="w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? 'User'} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                      {getInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {user.full_name ?? 'No name'}
                    </p>
                    {user.phone && (
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-600">{user.email ?? 'No email'}</span>
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role as UserRole} size="sm" />
              </TableCell>
              <TableCell>
                {getSubscriptionBadge(user.subscription_status)}
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-600">{formatDate(user.created_at)}</span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewDetails(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditRole(user)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.subscription_status === 'disabled' ? (
                      <DropdownMenuItem onClick={() => onEnableAccount(user)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Enable Account
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onDisableAccount(user)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Disable Account
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-600">
          Showing {startItem} to {endItem} of {totalCount} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { UserList };
