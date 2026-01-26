import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function NotificationSettings() {
  const { user, profile, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    appointment_alerts: true,
    task_alerts: true,
    medication_alerts: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.notification_settings) {
      try {
        const parsed =
          typeof profile.notification_settings === 'string'
            ? JSON.parse(profile.notification_settings)
            : profile.notification_settings;
        setSettings(parsed);
      } catch {
        // Keep default settings if parsing fails
      }
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        notification_settings: JSON.stringify(settings),
      });
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-600" />
              <Label className="cursor-pointer">Enable Email Notifications</Label>
            </div>
            <Switch
              checked={settings.email_notifications_enabled}
              onCheckedChange={() => handleToggle('email_notifications_enabled')}
            />
          </div>

          {settings.email_notifications_enabled && (
            <div className="space-y-3 ml-6 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer text-sm">
                  Appointment Reminders
                </Label>
                <Switch
                  checked={settings.appointment_alerts}
                  onCheckedChange={() => handleToggle('appointment_alerts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer text-sm">Urgent Task Alerts</Label>
                <Switch
                  checked={settings.task_alerts}
                  onCheckedChange={() => handleToggle('task_alerts')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer text-sm">
                  Medication Refill Reminders
                </Label>
                <Switch
                  checked={settings.medication_alerts}
                  onCheckedChange={() => handleToggle('medication_alerts')}
                />
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
