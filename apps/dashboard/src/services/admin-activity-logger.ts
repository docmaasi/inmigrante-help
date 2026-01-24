import { supabase } from '@/lib/supabase';

export type AdminActionTargetType =
  | 'user'
  | 'subscription'
  | 'setting'
  | 'team'
  | 'care_recipient'
  | 'feature_flag';

export type AdminActionType =
  | 'user_role_changed'
  | 'user_disabled'
  | 'user_enabled'
  | 'user_deleted'
  | 'user_impersonated'
  | 'subscription_modified'
  | 'subscription_canceled'
  | 'setting_updated'
  | 'feature_flag_toggled'
  | 'data_exported'
  | 'team_member_added'
  | 'team_member_removed'
  | 'care_recipient_created'
  | 'care_recipient_updated'
  | 'care_recipient_deleted';

interface LogAdminActionParams {
  action: AdminActionType;
  targetType: AdminActionTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
}

type LogAdminActionResult =
  | {
      ok: true;
      data: { id: string };
    }
  | {
      ok: false;
      error: Error;
    };

function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return 'unknown';
}

export async function logAdminAction({
  action,
  targetType,
  targetId,
  details,
}: LogAdminActionParams): Promise<LogAdminActionResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: new Error(userError?.message ?? 'User not authenticated'),
    };
  }

  const { data, error } = await supabase
    .from('admin_activity_logs')
    .insert({
      admin_id: userData.user.id,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? {},
      user_agent: getUserAgent(),
    })
    .select('id')
    .single();

  if (error) {
    return {
      ok: false,
      error: new Error(error.message),
    };
  }

  return {
    ok: true,
    data: { id: data.id },
  };
}
