import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function useWidgetManager(user) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(null);

  const defaultConfig = {
    notifications: { visible: true, order: 0, pinned: false },
    todaySchedule: { visible: true, order: 1, pinned: false },
    urgentTasks: { visible: true, order: 2, pinned: false },
    importantAlerts: { visible: true, order: 3, pinned: false },
    assignedTasks: { visible: true, order: 4, pinned: false },
    medications: { visible: true, order: 5, pinned: false },
  };

  const { data: preferences } = useQuery({
    queryKey: ['widgetPreferences', user?.email],
    queryFn: () => user ? base44.entities.WidgetPreferences.filter({ user_email: user.email }).then(data => data[0]) : null,
    enabled: !!user,
  });

  useEffect(() => {
    if (preferences?.widget_config) {
      setConfig(JSON.parse(preferences.widget_config));
    } else if (!config) {
      setConfig(defaultConfig);
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig) => {
      if (preferences?.id) {
        await base44.entities.WidgetPreferences.update(preferences.id, {
          widget_config: JSON.stringify(newConfig)
        });
      } else if (user?.email) {
        await base44.entities.WidgetPreferences.create({
          user_email: user.email,
          widget_config: JSON.stringify(newConfig)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['widgetPreferences']);
    }
  });

  const updateWidget = (widgetId, updates) => {
    const newConfig = {
      ...config,
      [widgetId]: { ...config?.[widgetId], ...updates }
    };
    setConfig(newConfig);
    updateMutation.mutate(newConfig);
  };

  const hideWidget = (widgetId) => {
    updateWidget(widgetId, { visible: false });
  };

  const pinWidget = (widgetId) => {
    updateWidget(widgetId, { pinned: !config?.[widgetId]?.pinned });
  };

  const reorderWidgets = (newOrder) => {
    const newConfig = { ...config };
    newOrder.forEach((widgetId, index) => {
      if (newConfig[widgetId]) {
        newConfig[widgetId].order = index;
      }
    });
    setConfig(newConfig);
    updateMutation.mutate(newConfig);
  };

  const showWidget = (widgetId) => {
    updateWidget(widgetId, { visible: true });
  };

  return {
    config: config || defaultConfig,
    hideWidget,
    pinWidget,
    reorderWidgets,
    showWidget,
  };
}