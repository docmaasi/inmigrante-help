import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateMultipleSettings, type ParsedSystemSettings } from '@/hooks/admin/use-system-settings';
import { Shield, Key, Clock, AlertTriangle, Loader2, Check } from 'lucide-react';

interface SecuritySettingsProps {
  settings: ParsedSystemSettings['security'];
  isLoading: boolean;
}

function SecuritySettings({ settings, isLoading }: SecuritySettingsProps): JSX.Element {
  const [formData, setFormData] = useState({
    sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
    passwordMinLength: settings.passwordMinLength,
    passwordRequireUppercase: settings.passwordRequireUppercase,
    passwordRequireLowercase: settings.passwordRequireLowercase,
    passwordRequireNumbers: settings.passwordRequireNumbers,
    passwordRequireSpecialChars: settings.passwordRequireSpecialChars,
    twoFactorEnforced: settings.twoFactorEnforced,
    maxLoginAttempts: settings.maxLoginAttempts,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateSettings = useUpdateMultipleSettings();

  useEffect(() => {
    setFormData({
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      passwordMinLength: settings.passwordMinLength,
      passwordRequireUppercase: settings.passwordRequireUppercase,
      passwordRequireLowercase: settings.passwordRequireLowercase,
      passwordRequireNumbers: settings.passwordRequireNumbers,
      passwordRequireSpecialChars: settings.passwordRequireSpecialChars,
      twoFactorEnforced: settings.twoFactorEnforced,
      maxLoginAttempts: settings.maxLoginAttempts,
    });
  }, [settings]);

  useEffect(() => {
    const changed =
      formData.sessionTimeoutMinutes !== settings.sessionTimeoutMinutes ||
      formData.passwordMinLength !== settings.passwordMinLength ||
      formData.passwordRequireUppercase !== settings.passwordRequireUppercase ||
      formData.passwordRequireLowercase !== settings.passwordRequireLowercase ||
      formData.passwordRequireNumbers !== settings.passwordRequireNumbers ||
      formData.passwordRequireSpecialChars !== settings.passwordRequireSpecialChars ||
      formData.twoFactorEnforced !== settings.twoFactorEnforced ||
      formData.maxLoginAttempts !== settings.maxLoginAttempts;
    setHasChanges(changed);
  }, [formData, settings]);

  function handleNumberChange(field: keyof typeof formData, value: string): void {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData((prev) => ({ ...prev, [field]: numValue }));
      setSaveSuccess(false);
    }
  }

  function handleToggle(field: keyof typeof formData, value: boolean): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  }

  async function handleSave(): Promise<void> {
    const settingsToUpdate = [
      {
        key: 'security.sessionTimeoutMinutes',
        value: formData.sessionTimeoutMinutes,
        description: 'Session timeout in minutes'
      },
      {
        key: 'security.passwordMinLength',
        value: formData.passwordMinLength,
        description: 'Minimum password length'
      },
      {
        key: 'security.passwordRequireUppercase',
        value: formData.passwordRequireUppercase,
        description: 'Require uppercase letters in passwords'
      },
      {
        key: 'security.passwordRequireLowercase',
        value: formData.passwordRequireLowercase,
        description: 'Require lowercase letters in passwords'
      },
      {
        key: 'security.passwordRequireNumbers',
        value: formData.passwordRequireNumbers,
        description: 'Require numbers in passwords'
      },
      {
        key: 'security.passwordRequireSpecialChars',
        value: formData.passwordRequireSpecialChars,
        description: 'Require special characters in passwords'
      },
      {
        key: 'security.twoFactorEnforced',
        value: formData.twoFactorEnforced,
        description: 'Enforce two-factor authentication for all users'
      },
      {
        key: 'security.maxLoginAttempts',
        value: formData.maxLoginAttempts,
        description: 'Maximum login attempts before lockout'
      },
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
      {/* Password Requirements */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-500" />
            Password Requirements
          </CardTitle>
          <CardDescription>
            Configure password complexity requirements for user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <div className="flex items-center gap-2">
              <Input
                id="passwordMinLength"
                type="number"
                min="6"
                max="32"
                value={formData.passwordMinLength}
                onChange={(e) => handleNumberChange('passwordMinLength', e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">characters</span>
            </div>
            <p className="text-xs text-slate-500">
              Recommended: 8 or more characters
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Password must contain:</Label>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <Label htmlFor="requireUppercase" className="text-sm font-normal cursor-pointer">
                  Uppercase letters (A-Z)
                </Label>
              </div>
              <Switch
                id="requireUppercase"
                checked={formData.passwordRequireUppercase}
                onCheckedChange={(checked) => handleToggle('passwordRequireUppercase', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <Label htmlFor="requireLowercase" className="text-sm font-normal cursor-pointer">
                  Lowercase letters (a-z)
                </Label>
              </div>
              <Switch
                id="requireLowercase"
                checked={formData.passwordRequireLowercase}
                onCheckedChange={(checked) => handleToggle('passwordRequireLowercase', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <Label htmlFor="requireNumbers" className="text-sm font-normal cursor-pointer">
                  Numbers (0-9)
                </Label>
              </div>
              <Switch
                id="requireNumbers"
                checked={formData.passwordRequireNumbers}
                onCheckedChange={(checked) => handleToggle('passwordRequireNumbers', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <Label htmlFor="requireSpecial" className="text-sm font-normal cursor-pointer">
                  Special characters (!@#$%^&*)
                </Label>
              </div>
              <Switch
                id="requireSpecial"
                checked={formData.passwordRequireSpecialChars}
                onCheckedChange={(checked) => handleToggle('passwordRequireSpecialChars', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Configure two-factor authentication requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <Label htmlFor="twoFactorEnforced" className="text-sm font-medium cursor-pointer">
                Enforce 2FA for all users
              </Label>
              <p className="text-xs text-slate-500">
                When enabled, all users will be required to set up two-factor authentication
              </p>
            </div>
            <Switch
              id="twoFactorEnforced"
              checked={formData.twoFactorEnforced}
              onCheckedChange={(checked) => handleToggle('twoFactorEnforced', checked)}
            />
          </div>

          {formData.twoFactorEnforced && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    2FA Enforcement Warning
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Enabling this will require all users to set up 2FA on their next login.
                    Users without 2FA will not be able to access the application until they complete setup.
                  </p>
                </div>
              </div>
            </div>
          )}
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
            Configure session timeout and login attempt limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout</Label>
            <div className="flex items-center gap-2">
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={formData.sessionTimeoutMinutes}
                onChange={(e) => handleNumberChange('sessionTimeoutMinutes', e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">minutes</span>
            </div>
            <p className="text-xs text-slate-500">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
            <div className="flex items-center gap-2">
              <Input
                id="maxLoginAttempts"
                type="number"
                min="3"
                max="10"
                value={formData.maxLoginAttempts}
                onChange={(e) => handleNumberChange('maxLoginAttempts', e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">attempts</span>
            </div>
            <p className="text-xs text-slate-500">
              Account will be temporarily locked after exceeding this number of failed attempts
            </p>
          </div>
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

export { SecuritySettings };
