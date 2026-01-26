import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { logAdminAction } from '@/services/admin-activity-logger';
import type { Json } from '@/types/database';

const SETTINGS_QUERY_KEY = 'system-settings';
const FEATURE_FLAGS_QUERY_KEY = 'feature-flags';

/**
 * System setting structure from database
 */
export interface SystemSetting {
  id: string;
  key: string;
  value: Json;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Feature flag structure from database
 */
export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
  allowed_roles: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Parsed system settings with typed values
 */
export interface ParsedSystemSettings {
  general: {
    appName: string;
    defaultTimezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    sessionTimeoutMinutes: number;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    twoFactorEnforced: boolean;
    maxLoginAttempts: number;
  };
}

const DEFAULT_SETTINGS: ParsedSystemSettings = {
  general: {
    appName: 'FamilyCare.help',
    defaultTimezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  security: {
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    twoFactorEnforced: false,
    maxLoginAttempts: 5,
  },
};

function parseSettingValue<T>(value: Json, defaultValue: T): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value as T;
}

function parseSettings(settings: SystemSetting[]): ParsedSystemSettings {
  const result = { ...DEFAULT_SETTINGS };

  for (const setting of settings) {
    const parts = setting.key.split('.');
    if (parts.length !== 2) {
      continue;
    }

    const [category, key] = parts;

    if (category === 'general' && key in result.general) {
      (result.general as Record<string, unknown>)[key] = parseSettingValue(
        setting.value,
        (DEFAULT_SETTINGS.general as Record<string, unknown>)[key]
      );
    } else if (category === 'security' && key in result.security) {
      (result.security as Record<string, unknown>)[key] = parseSettingValue(
        setting.value,
        (DEFAULT_SETTINGS.security as Record<string, unknown>)[key]
      );
    }
  }

  return result;
}

/**
 * Hook to fetch all system settings
 */
export function useSystemSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: async (): Promise<{ raw: SystemSetting[]; parsed: ParsedSystemSettings }> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const raw = data as SystemSetting[];
      const parsed = parseSettings(raw);

      return { raw, parsed };
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch a single system setting by key
 */
export function useSystemSetting(key: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, key],
    queryFn: async (): Promise<SystemSetting | null> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      return data as SystemSetting;
    },
    enabled: !!user && !!key,
  });
}

interface UpdateSettingParams {
  key: string;
  value: Json;
  description?: string;
}

/**
 * Hook to update or create a system setting
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ key, value, description }: UpdateSettingParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', key)
        .single();

      let result;
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase
          .from('system_settings') as any)
          .update({
            value,
            description,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('key', key)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        result = data;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase
          .from('system_settings') as any)
          .insert({
            key,
            value,
            description,
            updated_by: user.id,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        result = data;
      }

      await logAdminAction({
        action: 'setting_updated',
        targetType: 'setting',
        targetId: result.id,
        details: { key, value },
      });

      return result as SystemSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
}

interface UpdateMultipleSettingsParams {
  settings: Array<{ key: string; value: Json; description?: string }>;
}

/**
 * Hook to update multiple settings at once
 */
export function useUpdateMultipleSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ settings }: UpdateMultipleSettingsParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const results: SystemSetting[] = [];

      for (const setting of settings) {
        const { data: existing } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', setting.key)
          .single();

        let result;
        if (existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase
            .from('system_settings') as any)
            .update({
              value: setting.value,
              description: setting.description,
              updated_by: user.id,
              updated_at: new Date().toISOString(),
            })
            .eq('key', setting.key)
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }
          result = data;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase
            .from('system_settings') as any)
            .insert({
              key: setting.key,
              value: setting.value,
              description: setting.description,
              updated_by: user.id,
            })
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }
          result = data;
        }

        results.push(result as SystemSetting);
      }

      await logAdminAction({
        action: 'setting_updated',
        targetType: 'setting',
        details: {
          updatedKeys: settings.map((s) => s.key),
          count: settings.length,
        },
      });

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to fetch all feature flags
 */
export function useFeatureFlags() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY],
    queryFn: async (): Promise<FeatureFlag[]> => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as FeatureFlag[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch a single feature flag by name
 */
export function useFeatureFlag(name: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [FEATURE_FLAGS_QUERY_KEY, name],
    queryFn: async (): Promise<FeatureFlag | null> => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      return data as FeatureFlag;
    },
    enabled: !!user && !!name,
  });
}

interface ToggleFeatureFlagParams {
  id: string;
  name: string;
  enabled: boolean;
}

/**
 * Hook to toggle a feature flag
 */
export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, name, enabled }: ToggleFeatureFlagParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('feature_flags') as any)
        .update({
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await logAdminAction({
        action: 'feature_flag_toggled',
        targetType: 'feature_flag',
        targetId: id,
        details: { name, enabled },
      });

      return data as FeatureFlag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
    },
  });
}

interface CreateFeatureFlagParams {
  name: string;
  description?: string;
  enabled?: boolean;
  allowedRoles?: string[];
}

/**
 * Hook to create a new feature flag
 */
export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      enabled = false,
      allowedRoles = [],
    }: CreateFeatureFlagParams) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('feature_flags') as any)
        .insert({
          name,
          description,
          enabled,
          allowed_roles: allowedRoles,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await logAdminAction({
        action: 'feature_flag_toggled',
        targetType: 'feature_flag',
        targetId: data.id,
        details: { name, enabled, action: 'created' },
      });

      return data as FeatureFlag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEATURE_FLAGS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to check if a feature is enabled for the current user
 */
export function useIsFeatureEnabled(featureName: string): boolean {
  const { data: flag, isLoading } = useFeatureFlag(featureName);

  if (isLoading || !flag) {
    return false;
  }

  return flag.enabled;
}
