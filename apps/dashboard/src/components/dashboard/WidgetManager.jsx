import { useState, useEffect } from 'react';
import { useWidgetPreferences, useUpdateWidgetPreferences } from '@/hooks';

const DEFAULT_CONFIG = {
  notifications: { visible: true, order: 0, pinned: false },
  todaySchedule: { visible: true, order: 1, pinned: false },
  urgentTasks: { visible: true, order: 2, pinned: false },
  importantAlerts: { visible: true, order: 3, pinned: false },
  assignedTasks: { visible: true, order: 4, pinned: false },
  medications: { visible: true, order: 5, pinned: false },
};

export default function useWidgetManager() {
  const [config, setConfig] = useState(null);
  const { data: preferences } = useWidgetPreferences();
  const updateMutation = useUpdateWidgetPreferences();

  useEffect(() => {
    if (preferences?.widget_config) {
      setConfig(preferences.widget_config);
    } else if (!config) {
      setConfig(DEFAULT_CONFIG);
    }
  }, [preferences]);

  const updateWidget = (widgetId, updates) => {
    const newConfig = {
      ...config,
      [widgetId]: { ...config?.[widgetId], ...updates }
    };
    setConfig(newConfig);
    updateMutation.mutate({
      id: preferences?.id || null,
      config: newConfig
    });
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
    updateMutation.mutate({
      id: preferences?.id || null,
      config: newConfig
    });
  };

  const showWidget = (widgetId) => {
    updateWidget(widgetId, { visible: true });
  };

  return {
    config: config || DEFAULT_CONFIG,
    hideWidget,
    pinWidget,
    reorderWidgets,
    showWidget,
  };
}
