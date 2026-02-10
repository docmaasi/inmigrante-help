import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function CancellationReminder({ userEmail }) {
  const [dismissed, setDismissed] = useState(false);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', userEmail],
    queryFn: () => base44.entities.Subscription.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  if (!userEmail || dismissed || subscriptions.length === 0) {
    return null;
  }

  const canceledSubscription = subscriptions.find(sub => sub.status === 'canceled');

  if (!canceledSubscription || !canceledSubscription.deletion_scheduled_at) {
    return null;
  }

  const deletionDate = parseISO(canceledSubscription.deletion_scheduled_at);
  const daysRemaining = differenceInDays(deletionDate, new Date());

  // Don't show if already past deletion date
  if (daysRemaining < 0) {
    return null;
  }

  const urgencyLevel = daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'warning' : 'info';

  return (
    <Alert 
      className={`
        border-l-4 mb-6 relative
        ${urgencyLevel === 'critical' ? 'bg-red-50 border-red-600' : ''}
        ${urgencyLevel === 'warning' ? 'bg-orange-50 border-orange-600' : ''}
        ${urgencyLevel === 'info' ? 'bg-blue-50 border-blue-600' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          urgencyLevel === 'critical' ? 'text-red-600' : 
          urgencyLevel === 'warning' ? 'text-orange-600' : 
          'text-blue-600'
        }`} />
        <div className="flex-1">
          <AlertDescription>
            <p className="font-semibold mb-2">
              {urgencyLevel === 'critical' 
                ? '⚠️ URGENT: Your account data will be deleted soon!' 
                : urgencyLevel === 'warning'
                ? '⚠️ Warning: Subscription Canceled - Data Will Be Deleted'
                : 'Subscription Canceled - Data Retention Notice'}
            </p>
            <p className="text-sm mb-3">
              Your subscription was canceled. Your account data will be <strong>permanently deleted</strong> on{' '}
              <strong>{format(deletionDate, 'MMMM d, yyyy')}</strong> ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining).
            </p>
            <div className="text-sm space-y-2 mb-4">
              <p>• Access to your account is not guaranteed during this period</p>
              <p>• If you renew within {daysRemaining} days, all data will be restored</p>
              <p>• After the deletion date, data cannot be recovered</p>
              <p>• Export any records you need for personal, medical, or legal purposes</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to={createPageUrl('Checkout')}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Renew Subscription
                </Button>
              </Link>
              <Link to={createPageUrl('RecordRetentionPolicy')}>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Policy
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Alert>
  );
}