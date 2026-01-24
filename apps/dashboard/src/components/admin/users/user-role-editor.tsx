import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge, type UserRole } from '@/components/ui/role-badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useUpdateUserRole } from '@/hooks/admin/use-admin-users';
import { USER_ROLES, ROLE_DISPLAY_CONFIG } from '@/types/permissions';
import type { AdminUserProfile } from '@/hooks/admin/use-admin-users';

interface UserRoleEditorProps {
  user: AdminUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

function UserRoleEditor({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserRoleEditorProps): JSX.Element {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRoleMutation = useUpdateUserRole();

  function handleOpenChange(open: boolean): void {
    if (!open) {
      handleClose();
    }
  }

  function handleClose(): void {
    setSelectedRole(null);
    setError(null);
    onClose();
  }

  function handleRoleChange(value: string): void {
    setSelectedRole(value as UserRole);
    setError(null);
  }

  async function handleConfirm(): Promise<void> {
    if (!user || !selectedRole) {
      return;
    }

    if (selectedRole === user.role) {
      setError('Please select a different role');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        newRole: selectedRole,
        previousRole: user.role,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMessage);
    }
  }

  if (!user) {
    return <></>;
  }

  const currentRole = user.role as UserRole;
  const isRoleChanged = selectedRole && selectedRole !== currentRole;
  const isEscalatingToSuperAdmin = selectedRole === 'super_admin' && currentRole !== 'super_admin';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Change User Role</DialogTitle>
          <DialogDescription className="text-slate-600">
            Update the role and permissions for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? 'User'} />
              <AvatarFallback className="bg-slate-200 text-slate-600">
                {getInitials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-900">{user.full_name ?? 'No name'}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Current Role</span>
              <RoleBadge role={currentRole} />
            </div>

            <div className="space-y-2">
              <label htmlFor="role-select" className="text-sm font-medium text-slate-700">
                New Role
              </label>
              <Select value={selectedRole ?? ''} onValueChange={handleRoleChange}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Select a new role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => {
                    const config = ROLE_DISPLAY_CONFIG[role];
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-slate-500">{config.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEscalatingToSuperAdmin && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Super Admin Warning</p>
                <p className="text-xs text-amber-700 mt-1">
                  This user will have full platform access including the ability to manage all
                  users, subscriptions, and system settings.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateRoleMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isRoleChanged || updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm Change'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { UserRoleEditor };
