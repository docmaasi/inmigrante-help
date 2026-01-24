import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useSystemSettings } from '@/hooks/admin/use-system-settings';
import { GeneralSettings, SecuritySettings, FeatureToggles } from '@/components/admin/settings';
import {
  Settings,
  Shield,
  ToggleLeft,
  Cog,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function SystemSettings(): JSX.Element {
  const { user, profile } = useAuth();
  const { data: settingsData, isLoading, isError, error } = useSystemSettings();

  const generalSettings = settingsData?.parsed.general ?? {
    appName: 'FamilyCare.help',
    defaultTimezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  };

  const securitySettings = settingsData?.parsed.security ?? {
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    twoFactorEnforced: false,
    maxLoginAttempts: 5,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cog className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">System Settings</h1>
                  <p className="text-slate-300 text-sm font-normal">
                    Configure application-wide settings and features
                  </p>
                </div>
              </div>
              <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Super Admin Only
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Error State */}
        {isError && (
          <Card className="border border-red-200 bg-red-50">
            <CardHeader className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Error loading system settings
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {error instanceof Error ? error.message : 'Please try again later.'}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 data-[state=active]:bg-slate-100"
            >
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-slate-100"
            >
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="flex items-center gap-2 data-[state=active]:bg-slate-100"
            >
              <ToggleLeft className="w-4 h-4" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <GeneralSettings settings={generalSettings} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings settings={securitySettings} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <FeatureToggles />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="border border-slate-200 bg-white">
          <CardHeader className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p>
                  <strong>Note:</strong> Changes to system settings take effect immediately.
                  Some settings may require users to log out and log back in to see the changes.
                </p>
                <p className="mt-2">
                  Last modified by:{' '}
                  <span className="font-medium text-slate-800">
                    {profile?.full_name ?? user?.email ?? 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export { SystemSettings };
