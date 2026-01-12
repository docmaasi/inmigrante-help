import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Calendar, Pill, FileText, CheckSquare, Users, Menu, X, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const navigation = [
    { name: 'Dashboard', path: 'Dashboard', icon: Home },
    { name: 'Appointments', path: 'Appointments', icon: Calendar },
    { name: 'Medications', path: 'Medications', icon: Pill },
    { name: 'Care Notes', path: 'CareNotes', icon: FileText },
    { name: 'Tasks', path: 'Tasks', icon: CheckSquare },
    { name: 'Care Recipients', path: 'CareRecipients', icon: Users },
  ];

  const isActive = (path) => currentPageName === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-orange-600 to-green-600 bg-clip-text text-transparent">
                  FamilyCare
                </span>
                <span className="text-[10px] text-slate-500 -mt-1 tracking-wide">HELP</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <>
                  <span className="text-sm text-slate-600">{user.full_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => base44.auth.logout()}
                    className="text-slate-600"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => base44.auth.logout()}
                  className="w-full justify-start text-slate-600 mt-2"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} FamilyCare.Help • Giving caregivers clarity, accountability, and peace of mind
          </p>
        </div>
      </footer>
    </div>
  );
}