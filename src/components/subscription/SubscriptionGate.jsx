import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ShieldAlert, CreditCard, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EXEMPT_PAGES = [
  'Checkout', 'Settings', 'PrivacyPolicy',
  'TermsOfService', 'CookiePolicy',
  'LegalDisclosure', 'RecordRetentionPolicy',
  'Dashboard', 'FAQ', 'Landing'
];

function isTrialActive(user) {
  if (!user?.trial_ends_at) return false;
  return new Date(user.trial_ends_at) > new Date();
}

function hasActiveSubscription(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) return false;
  return subscriptions.some(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );
}

function BlockedEmailScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Free Trial Already Used
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          This email has already been used for a free trial.
          To continue using FamilyCare.Help, please subscribe
          to a paid plan.
        </p>
        <Link to={createPageUrl('Checkout')}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscribe Now
          </Button>
        </Link>
        <p className="text-xs text-slate-400 mt-6">
          Once subscribed, you'll have full access to all
          features.
        </p>
      </div>
    </div>
  );
}

function TrialExpiredScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Your Trial Has Expired
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Your 10-day free trial has ended. Subscribe to a
          plan to continue using FamilyCare.Help and keep
          all your data safe.
        </p>
        <Link to={createPageUrl('Checkout')}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscribe Now
          </Button>
        </Link>
        <Link to={createPageUrl('Settings')}>
          <Button variant="ghost" className="w-full text-slate-500">
            Go to Settings
          </Button>
        </Link>
        <p className="text-xs text-slate-400 mt-6">
          If you don't subscribe within 10 days, your data
          will be permanently deleted.
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionGate({
  children,
  currentPageName,
}) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () =>
      base44.entities.Subscription.filter({
        user_email: user.email,
      }),
    enabled: !!user?.email,
  });

  // Check if this email is on the blocked list
  const { data: blockedEntry } = useQuery({
    queryKey: ['blockedEmail', user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('blocked_trial_emails')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.email,
  });

  // Initialize trial dates if user doesn't have them
  useQuery({
    queryKey: ['initTrial', user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('trial_started_at')
        .eq('email', user.email)
        .maybeSingle();

      if (data && !data.trial_started_at) {
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 10);
        const deletionDate = new Date(now);
        deletionDate.setDate(deletionDate.getDate() + 20);

        await supabase
          .from('profiles')
          .update({
            trial_started_at: now.toISOString(),
            trial_ends_at: trialEnd.toISOString(),
            data_deletion_scheduled_at: deletionDate.toISOString(),
          })
          .eq('email', user.email);
      }
      return data;
    },
    enabled: !!user?.email,
    staleTime: Infinity,
  });

  // Still loading user data - don't block
  if (!user) return <>{children}</>;

  // Exempt pages always pass through
  if (EXEMPT_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Active subscription - full access (even if blocked)
  if (hasActiveSubscription(subscriptions)) {
    return <>{children}</>;
  }

  // Blocked email with no active subscription
  if (blockedEntry) {
    return <BlockedEmailScreen />;
  }

  // Still in trial - allow access
  if (isTrialActive(user)) {
    return <>{children}</>;
  }

  // Trial expired, no subscription - BLOCK
  return <TrialExpiredScreen />;
}
