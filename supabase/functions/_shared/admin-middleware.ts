import { SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type UserRole = 'super_admin' | 'admin' | 'caregiver' | 'viewer';

interface Profile {
  id: string;
  role: UserRole;
  is_super_admin: boolean;
  full_name: string | null;
  email: string | null;
}

interface AdminAuthResult {
  user: User;
  profile: Profile;
}

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin'];

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
}

export function createErrorResponse(
  message: string,
  status: number
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function requireAdmin(
  req: Request,
  supabase: SupabaseClient
): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    throw new Error('Unauthorized: Missing authorization header');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error('Unauthorized: Invalid or expired token');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, is_super_admin, full_name, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Unauthorized: Profile not found');
  }

  const isAdmin = ADMIN_ROLES.includes(profile.role) || profile.is_super_admin === true;

  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return {
    user,
    profile: profile as Profile,
  };
}

export async function requireSuperAdmin(
  req: Request,
  supabase: SupabaseClient
): Promise<AdminAuthResult> {
  const { user, profile } = await requireAdmin(req, supabase);

  if (profile.is_super_admin !== true) {
    throw new Error('Forbidden: Super admin access required');
  }

  return { user, profile };
}
