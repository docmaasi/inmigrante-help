import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { LogOut, LogIn, Mail, Share2, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import NotificationBell from './components/notifications/NotificationBell';
import NotificationGenerator from './components/notifications/NotificationGenerator';
import LegalAcceptanceModal from './components/auth/LegalAcceptanceModal';
import CancellationReminder from './components/subscription/CancellationReminder';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  SidebarInset,
  useSidebar
} from '@/components/ui/sidebar';
import { AppSidebar } from './components/layout/app-sidebar';

function MenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors font-medium text-sm"
      style={{ minHeight: 48 }}
      aria-label="Open menu"
    >
      <PanelLeft className="w-5 h-5" />
      Menu
    </button>
  );
}

export default function Layout({ children, currentPageName }) {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleShare = async () => {
    const shareData = { title: 'FamilyCare.Help', url: 'https://www.FamilyCare.Help' };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied!');
    } catch { window.prompt('Copy this link:', shareData.url); }
  };

  const showSubscribeButton = isAuthenticated &&
    profile?.subscription_status !== 'active' &&
    profile?.subscription_status !== 'trialing';

  const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || "https://familycare.help";

  const footerNavItems = [
    { name: 'FAQ', href: `${MARKETING_URL}/faq` },
    { name: 'Privacy Policy', href: `${MARKETING_URL}/privacy` },
    { name: 'Terms of Service', href: `${MARKETING_URL}/terms` },
    { name: 'Cookie Policy', href: `${MARKETING_URL}/cookies` },
    { name: 'Legal Disclosure', href: `${MARKETING_URL}/legal` },
    { name: 'Record Retention', href: `${MARKETING_URL}/retention-policy` }
  ];

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col min-h-screen bg-slate-50 overscroll-none">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <MenuButton />

          <div className="flex items-center gap-3">
            {showSubscribeButton && (
              <Link
                to="/Checkout"
                className="animate-subscribe-pulse inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: '#8B7EC8' }}
              >
                Subscribe — 10 Days Free
              </Link>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-teal-600 transition-colors"
              title="Share FamilyCare.Help"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <NotificationBell />
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:bg-slate-100"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </header>

        <NotificationGenerator />
        <LegalAcceptanceModal />

        {/* Cancellation Reminder */}
        {user && (
          <div className="px-4 md:px-6 pt-4">
            <CancellationReminder userEmail={user.email} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white mt-auto">
          <div className="px-4 md:px-6 py-4">
            {/* HIPAA Disclaimer */}
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 text-center">
                <strong>Important:</strong> FamilyCare.Help is designed for family care coordination and informational purposes only.
                This platform is <strong>not HIPAA compliant</strong> and should not be used to store or transmit protected health information (PHI).
                It is not a substitute for professional medical, legal, or financial advice.
              </p>
            </div>
            <div className="flex justify-center mb-3">
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/images/familycare-qr.png"
                  alt="Scan to share FamilyCare.Help"
                  className="w-24 h-24 rounded-lg border border-slate-200"
                />
                <p className="text-xs text-slate-400">Share with family</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                FamilyCare.Help
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap justify-center">
                {footerNavItems.map((item, index) => (
                  <React.Fragment key={item.href}>
                    {index > 0 && <span className="text-slate-200">|</span>}
                    <a href={item.href} className="hover:text-teal-600 transition-colors">
                      {item.name}
                    </a>
                  </React.Fragment>
                ))}
                <span className="text-slate-200">|</span>
                <a href="mailto:admin@familycare.help" className="flex items-center gap-1 hover:text-teal-600 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
