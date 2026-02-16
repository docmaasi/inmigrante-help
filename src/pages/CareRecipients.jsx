import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import RecipientCard from '../components/recipients/RecipientCard';
import CareRecipientForm from '../components/care/CareRecipientForm';
import { createPageUrl } from '../utils';
import ShareQRCode from '../components/shared/ShareQRCode';

export default function CareRecipients() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLimitError, setShowLimitError] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list('-created_date'),
  });

  const handleAddRecipient = () => {
    const maxAllowed = user?.max_care_recipients || 1;
    if (recipients.length >= maxAllowed) {
      setShowLimitError(true);
      setTimeout(() => setShowLimitError(false), 5000);
      return;
    }
    setShowAddForm(true);
  };

  if (showAddForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <CareRecipientForm onClose={() => setShowAddForm(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Care Recipients</h1>
            <p className="text-sm md:text-base text-slate-700">
              Manage profiles for your loved ones ({recipients.length}/{user?.max_care_recipients || 1} used)
            </p>
          </div>
          {showLimitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Care Recipient Limit Reached</p>
                <p className="text-sm text-red-600 mt-1">
                  You've reached your plan limit of {user?.max_care_recipients || 1} care recipient(s). 
                  <a href={createPageUrl('Checkout')} className="underline font-medium ml-1">Upgrade your plan</a> to add more.
                </p>
              </div>
            </div>
          )}
          <Button 
            onClick={handleAddRecipient}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Recipient
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60">
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
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No care recipients yet</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Add your first care recipient to get started</p>
            <Button onClick={handleAddRecipient} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
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