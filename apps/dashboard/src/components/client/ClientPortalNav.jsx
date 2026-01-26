import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Pill, ListTodo, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function ClientPortalNav({ careRecipientName, currentPageName }) {
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: 'ClientPortal' },
    { name: 'Appointments', icon: Calendar, path: 'ClientAppointments' },
    { name: 'Medications', icon: Pill, path: 'ClientMedicationLog' },
    { name: 'Tasks', icon: ListTodo, path: 'ClientTasks' },
    { name: 'Updates', icon: MessageSquare, path: 'ClientUpdates' }
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-slate-800">Care Portal</h1>
              <p className="text-xs text-slate-500 mt-1">{careRecipientName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'text-teal-600 border-teal-600'
                      : 'text-slate-600 border-transparent hover:text-teal-600 hover:border-slate-300'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default ClientPortalNav;
