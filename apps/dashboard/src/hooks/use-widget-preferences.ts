import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const QUERY_KEY = 'widget-preferences';

interface WidgetConfig {
  [widgetId: string]: {
    visible: boolean;
    order: number;
    pinned: boolean;
  };
}

const DEFAULT_CONFIG: WidgetConfig = {
  notifications: { visible: true, order: 0, pinned: false },
  todaySchedule: { visible: true, order: 1, pinned: false },
  urgentTasks: { visible: true, order: 2, pinned: false },
  importantAlerts: { visible: true, order: 3, pinned: false },
  assignedTasks: { visible: true, order: 4, pinned: false },
  medications: { visible: true, order: 5, pinned: false },
};

export function useWidgetPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      if (!user) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('widget_preferences') as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return { id: null, widget_config: DEFAULT_CONFIG };
      }

      return {
        id: data.id,
        widget_config: data.widget_config ? JSON.parse(data.widget_config as string) : DEFAULT_CONFIG,
      };
    },
    enabled: !!user,
  });
}

export function useUpdateWidgetPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      config,
    }: {
      id: string | null;
      config: WidgetConfig;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const configString = JSON.stringify(config);

      if (id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase
          .from('widget_preferences') as any)
          .update({ widget_config: configString })
          .eq('id', id);

        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('widget_preferences') as any).insert({
          user_id: user.id,
          widget_config: configString,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
