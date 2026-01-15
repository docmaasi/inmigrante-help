import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Home, Users, Calendar, Pill, ListTodo, Heart, ClipboardCheck, AlertCircle, UserCheck, Sparkles, MessageSquare, Bell, FileText, Clock, Zap } from 'lucide-react';
import NotificationBell from './components/notifications/NotificationBell';
import NotificationGenerator from './components/notifications/NotificationGenerator';
import LegalAcceptanceModal from './components/auth/LegalAcceptanceModal';
import CancellationReminder from './components/subscription/CancellationReminder';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: 'Dashboard', bg: 'bg-blue-50' },
    { name: 'Today', icon: Zap, path: 'Today', bg: 'bg-amber-50' },
    { name: 'Care Recipients', icon: Users, path: 'CareRecipients', bg: 'bg-purple-50' },
    { name: 'Receipts', icon: FileText, path: 'Receipts', bg: 'bg-orange-50' },
    { name: 'Comm Hub', icon: MessageSquare, path: 'CommunicationHub', bg: 'bg-green-50' },
    { name: 'Calendar', icon: Calendar, path: 'Calendar', bg: 'bg-pink-50' },
    { name: 'AI Care Plans', icon: Sparkles, path: 'CarePlans', bg: 'bg-violet-50' },
    { name: 'Plan Builder', icon: FileText, path: 'CarePlanBuilder', bg: 'bg-indigo-50' },
    { name: 'Documents', icon: FileText, path: 'Documents', bg: 'bg-cyan-50' },
    { name: 'Medications', icon: Pill, path: 'Medications', bg: 'bg-rose-50' },
    { name: 'Refills', icon: Bell, path: 'Refills', bg: 'bg-indigo-50' },
    { name: 'Med Log', icon: ClipboardCheck, path: 'MedicationLog', bg: 'bg-teal-50' },
    { name: 'Team', icon: UserCheck, path: 'Team', bg: 'bg-lime-50' },
    { name: 'Emergency', icon: AlertCircle, path: 'EmergencyProfile', bg: 'bg-red-50' },
    { name: 'Tasks', icon: ListTodo, path: 'Tasks', bg: 'bg-sky-50' },
    { name: 'Shift Handoff', icon: Clock, path: 'ShiftHandoff', bg: 'bg-emerald-50' },
    { name: 'Collaboration', icon: Users, path: 'Collaboration', bg: 'bg-fuchsia-50' },
    { name: 'Scheduling', icon: Calendar, path: 'Scheduling', bg: 'bg-orange-50' },
    { name: 'Reports', icon: FileText, path: 'Reports', bg: 'bg-slate-50' },
    { name: 'Settings', icon: Heart, path: 'Settings', bg: 'bg-gray-50' },
    { name: 'Subscribe', icon: Heart, path: 'Checkout', bg: 'bg-gradient-to-br from-orange-400 to-pink-500', special: true }
    ];

    const footerNavItems = [
    { name: 'FAQ', path: 'FAQ' },
    { name: 'Privacy Policy', path: 'PrivacyPolicy' },
    { name: 'Terms of Service', path: 'TermsOfService' },
    { name: 'Cookie Policy', path: 'CookiePolicy' },
    { name: 'Legal Disclosure', path: 'LegalDisclosure' },
    { name: 'Record Retention', path: 'RecordRetentionPolicy' }
    ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: #3B82F6;
          --primary-light: #93C5FD;
          --primary-dark: #1E40AF;
          --secondary: #8B5CF6;
          --secondary-light: #D8B4FE;
          --secondary-dark: #6D28D9;
          --accent: #EF4444;
          --accent-light: #FCA5A5;
          --accent-dark: #991B1B;
          --success: #22C55E;
          --success-light: #86EFAC;
          --warning: #FBBF24;
          --warning-light: #FDE047;
          --neutral-bg-light: #F8FAFC;
          --neutral-bg: #E2E8F0;
          --neutral-text: #64748B;
          --neutral-text-dark: #1E293B;
        }
      `}</style>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg" 
                alt="FamilyCare.Help Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-medium text-slate-800">www.FamilyCare<span className="text-orange-500">.Help</span></h1>
                <p className="text-xs text-slate-500">Coordinating care together</p>
              </div>
            </Link>
            <NotificationBell />
          </div>
        </div>
      </header>

      <NotificationGenerator />
      <LegalAcceptanceModal />

      {/* Cancellation Reminder */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <CancellationReminder userEmail={user.email} />
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1 py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : item.special
                      ? `${item.bg} text-white hover:shadow-lg hover:scale-110 animate-pulse`
                      : `${item.bg} text-slate-700 hover:shadow-md hover:scale-105`
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" fill={item.special ? "currentColor" : "none"} />
                  <span className="text-center leading-tight">{item.name}</span>
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
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" fill="currentColor" />
              <span className="text-slate-600 font-medium">www.FamilyCare.Help</span>
            </div>
            <p className="text-sm text-slate-500">
              Giving caregivers clarity, accountability, and peace of mind
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 flex-wrap">
              {footerNavItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  {index > 0 && <span className="text-slate-300">|</span>}
                  <Link to={createPageUrl(item.path)} className="hover:text-blue-600 transition-colors">
                    {item.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}