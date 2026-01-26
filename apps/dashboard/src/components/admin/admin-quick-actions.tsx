import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Download, Settings, Shield, Activity } from 'lucide-react';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  variant: 'default' | 'outline' | 'secondary' | 'ghost';
}

function AdminQuickActions(): JSX.Element {
  const navigate = useNavigate();

  function handleExportData(): void {
    // Placeholder for export functionality
    // This would trigger a data export process
    alert('Export functionality will be implemented with the admin backend');
  }

  const actions: QuickAction[] = [
    {
      label: 'Add User',
      description: 'Create a new user account',
      icon: UserPlus,
      onClick: () => navigate('/admin/users?action=add'),
      variant: 'default',
    },
    {
      label: 'View Logs',
      description: 'Review activity logs',
      icon: Activity,
      onClick: () => navigate('/admin/activity'),
      variant: 'outline',
    },
    {
      label: 'Export Data',
      description: 'Download system data',
      icon: Download,
      onClick: handleExportData,
      variant: 'outline',
    },
    {
      label: 'System Settings',
      description: 'Configure application',
      icon: Settings,
      onClick: () => navigate('/admin/settings'),
      variant: 'outline',
    },
    {
      label: 'Security',
      description: 'Review security settings',
      icon: Shield,
      onClick: () => navigate('/admin/settings?tab=security'),
      variant: 'outline',
    },
    {
      label: 'Reports',
      description: 'Generate system reports',
      icon: FileText,
      onClick: () => navigate('/admin/reports'),
      variant: 'outline',
    },
  ];

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-800 text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto py-4 flex flex-col items-center gap-2 text-center"
                onClick={action.onClick}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs opacity-70 font-normal">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { AdminQuickActions };
