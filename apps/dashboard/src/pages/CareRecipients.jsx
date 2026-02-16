import React, { useState, useEffect } from 'react';
import { useCareRecipients } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Plus, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import RecipientCard from '../components/recipients/RecipientCard';
import CareRecipientForm from '../components/care/CareRecipientForm';
import { createPageUrl } from '../utils';
import ShareQRCode from '../components/shared/ShareQRCode';

export default function CareRecipients() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLimitError, setShowLimitError] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const { profile, refreshProfile } = useAuth();
  const { data: recipients = [], isLoading } = useCareRecipients();

  // Refresh profile after returning from Stripe billing portal
  // The webhook may still be processing, so retry after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshProfile();
    }, 2000);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  const handleAddRecipient = () => {
    const maxAllowed = profile?.max_care_recipients || 1;
    if (recipients.length >= maxAllowed) {
      setShowLimitError(true);
      return;
    }
    setShowAddForm(true);
  };

  const handleManageSubscription = async () => {
    // If user has no stripe_customer_id, send them to Checkout to subscribe first
    if (!profile?.stripe_customer_id) {
      window.location.href = '/Checkout';
      return;
    }
    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: window.location.href }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      // Fallback to checkout page
      window.location.href = '/Checkout';
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (showAddForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <CareRecipientForm onClose={() => setShowAddForm(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Care Recipients</h1>
            <p className="text-sm md:text-base text-slate-600">
              Manage profiles for your loved ones — {recipients.length} of {profile?.max_care_recipients || 1} spot{(profile?.max_care_recipients || 1) !== 1 ? 's' : ''} used
            </p>
          </div>
          {showLimitError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Care Recipient Limit Reached</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You're using {recipients.length} of {profile?.max_care_recipients || 1} care recipient spot{(profile?.max_care_recipients || 1) > 1 ? 's' : ''}.
                    Add more care recipients for <span className="font-semibold">$5/month each</span> (up to 10 total).
                  </p>
                  <Button
                    onClick={handleManageSubscription}
                    disabled={isLoadingPortal}
                    className="mt-3 bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    {isLoadingPortal ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening...</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" /> Manage Subscription</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <Button
            onClick={handleAddRecipient}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recipient
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No care recipients yet</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Add your first care recipient to get started</p>
            <Button onClick={handleAddRecipient} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipients.map(recipient => (
                <RecipientCard key={recipient.id} recipient={recipient} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <ShareQRCode />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
