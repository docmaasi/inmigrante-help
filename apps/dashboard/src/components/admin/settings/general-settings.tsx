import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateMultipleSettings, type ParsedSystemSettings } from '@/hooks/admin/use-system-settings';
import { Settings, Globe, Clock, Loader2, Check } from 'lucide-react';

interface GeneralSettingsProps {
  settings: ParsedSystemSettings['general'];
  isLoading: boolean;
}

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/20/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (20/01/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-01-20)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Jan 20, 2026)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (20 Jan 2026)' },
];

const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12-hour (2:30 PM)' },
  { value: '24h', label: '24-hour (14:30)' },
];

function GeneralSettings({ settings, isLoading }: GeneralSettingsProps): JSX.Element {
  const [formData, setFormData] = useState({
    appName: settings.appName,
    defaultTimezone: settings.defaultTimezone,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateSettings = useUpdateMultipleSettings();

  useEffect(() => {
    setFormData({
      appName: settings.appName,
      defaultTimezone: settings.defaultTimezone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
    });
  }, [settings]);

  useEffect(() => {
    const changed =
      formData.appName !== settings.appName ||
      formData.defaultTimezone !== settings.defaultTimezone ||
      formData.dateFormat !== settings.dateFormat ||
      formData.timeFormat !== settings.timeFormat;
    setHasChanges(changed);
  }, [formData, settings]);

  function handleInputChange(field: keyof typeof formData, value: string): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  }

  async function handleSave(): Promise<void> {
    const settingsToUpdate = [
      { key: 'general.appName', value: formData.appName, description: 'Application name' },
      { key: 'general.defaultTimezone', value: formData.defaultTimezone, description: 'Default timezone for the application' },
      { key: 'general.dateFormat', value: formData.dateFormat, description: 'Default date format' },
      { key: 'general.timeFormat', value: formData.timeFormat, description: 'Default time format (12h or 24h)' },
    ];

    await updateSettings.mutateAsync({ settings: settingsToUpdate });
    setSaveSuccess(true);
    setHasChanges(false);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Settings */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure basic application settings and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={formData.appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              placeholder="Enter application name"
              className="max-w-md"
            />
            <p className="text-xs text-slate-500">
              This name appears in the header, emails, and notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-500" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Configure timezone and locale preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Default Timezone</Label>
            <Select
              value={formData.defaultTimezone}
              onValueChange={(value) => handleInputChange('defaultTimezone', value)}
            >
              <SelectTrigger id="timezone" className="max-w-md">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Default timezone for new users and system-wide features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={formData.dateFormat}
                onValueChange={(value) => handleInputChange('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={formData.timeFormat}
                onValueChange={(value) => handleInputChange('timeFormat', value)}
              >
                <SelectTrigger id="timeFormat">
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Session Settings
          </CardTitle>
          <CardDescription>
            Configure user session behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Session timeout and other session-related settings are managed in the Security tab.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateSettings.isPending}
          className="min-w-[120px]"
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        {hasChanges && (
          <span className="text-sm text-amber-600">You have unsaved changes</span>
        )}
        {updateSettings.isError && (
          <span className="text-sm text-red-600">
            Error saving settings. Please try again.
          </span>
        )}
      </div>
    </div>
  );
}

export { GeneralSettings };
