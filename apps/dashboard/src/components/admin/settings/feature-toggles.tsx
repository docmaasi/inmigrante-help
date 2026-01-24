import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  useFeatureFlags,
  useToggleFeatureFlag,
  useCreateFeatureFlag,
  type FeatureFlag,
} from '@/hooks/admin/use-system-settings';
import {
  ToggleLeft,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Flag,
} from 'lucide-react';

interface FeatureToggleItemProps {
  feature: FeatureFlag;
  onToggle: (id: string, name: string, enabled: boolean) => void;
  isUpdating: boolean;
}

function FeatureToggleItem({ feature, onToggle, isUpdating }: FeatureToggleItemProps): JSX.Element {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">{feature.name}</span>
          <Badge
            variant="outline"
            className={
              feature.enabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }
          >
            {feature.enabled ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {feature.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        {feature.description && (
          <p className="text-sm text-slate-500 mt-1 truncate">{feature.description}</p>
        )}
        {feature.allowed_roles && feature.allowed_roles.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-slate-400">Roles:</span>
            {feature.allowed_roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="ml-4 flex-shrink-0">
        <Switch
          checked={feature.enabled}
          onCheckedChange={(checked) => onToggle(feature.id, feature.name, checked)}
          disabled={isUpdating}
          aria-label={`Toggle ${feature.name}`}
        />
      </div>
    </div>
  );
}

function FeatureToggles(): JSX.Element {
  const { data: features, isLoading, isError, error } = useFeatureFlags();
  const toggleFeature = useToggleFeatureFlag();
  const createFeature = useCreateFeatureFlag();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    enabled: false,
  });

  const filteredFeatures = features?.filter(
    (feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleToggle(id: string, name: string, enabled: boolean): void {
    toggleFeature.mutate({ id, name, enabled });
  }

  async function handleCreateFeature(): Promise<void> {
    if (!newFeature.name.trim()) {
      return;
    }

    await createFeature.mutateAsync({
      name: newFeature.name.trim(),
      description: newFeature.description.trim() || undefined,
      enabled: newFeature.enabled,
    });

    setNewFeature({ name: '', description: '', enabled: false });
    setIsCreateDialogOpen(false);
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

  if (isError) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading feature flags</p>
            <p className="text-xs text-red-600 mt-1">
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ToggleLeft className="w-5 h-5 text-slate-500" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable features across the platform
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                  <DialogDescription>
                    Add a new feature flag to control feature availability
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="featureName">Feature Name</Label>
                    <Input
                      id="featureName"
                      value={newFeature.name}
                      onChange={(e) =>
                        setNewFeature((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., dark_mode, beta_dashboard"
                    />
                    <p className="text-xs text-slate-500">
                      Use snake_case for feature names
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featureDescription">Description</Label>
                    <Textarea
                      id="featureDescription"
                      value={newFeature.description}
                      onChange={(e) =>
                        setNewFeature((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Describe what this feature flag controls..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <Label htmlFor="featureEnabled" className="text-sm font-normal cursor-pointer">
                      Enable immediately
                    </Label>
                    <Switch
                      id="featureEnabled"
                      checked={newFeature.enabled}
                      onCheckedChange={(checked) =>
                        setNewFeature((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFeature}
                    disabled={!newFeature.name.trim() || createFeature.isPending}
                  >
                    {createFeature.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Feature'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feature flags..."
              className="pl-9"
            />
          </div>

          {/* Feature List */}
          {filteredFeatures && filteredFeatures.length > 0 ? (
            <div className="space-y-3">
              {filteredFeatures.map((feature) => (
                <FeatureToggleItem
                  key={feature.id}
                  feature={feature}
                  onToggle={handleToggle}
                  isUpdating={toggleFeature.isPending}
                />
              ))}
            </div>
          ) : features && features.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No feature flags yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Create your first feature flag to control feature availability
              </p>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No features matching "{searchQuery}"</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">About Feature Flags</p>
              <p className="text-xs text-blue-700 mt-1">
                Feature flags allow you to enable or disable features without deploying new code.
                Changes take effect immediately for all users. Use with caution in production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { FeatureToggles };
