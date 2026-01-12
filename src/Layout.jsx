import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Users, Calendar, Pill, ListTodo, Heart, ClipboardCheck, AlertCircle, UserCheck } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Dashboard', icon: Home, path: 'Dashboard' },
    { name: 'Care Recipients', icon: Users, path: 'CareRecipients' },
    { name: 'Calendar', icon: Calendar, path: 'Calendar' },
    { name: 'Medications', icon: Pill, path: 'Medications' },
    { name: 'Med Log', icon: ClipboardCheck, path: 'MedicationLog' },
    { name: 'Team', icon: UserCheck, path: 'Team' },
    { name: 'Emergency', icon: AlertCircle, path: 'Emergency' },
    { name: 'Tasks', icon: ListTodo, path: 'Tasks' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-slate-800">FamilyCare<span className="text-orange-500">.Help</span></h1>
                <p className="text-xs text-slate-500">Coordinating care together</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
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
                      ? 'text-blue-600 border-blue-600'
                      : 'text-slate-600 border-transparent hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-blue-600" fill="currentColor" />
              <span className="text-slate-600 font-medium">FamilyCare.Help</span>
            </div>
            <p className="text-sm text-slate-500">
              Giving caregivers clarity, accountability, and peace of mind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}