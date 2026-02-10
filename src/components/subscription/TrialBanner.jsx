import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Clock, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';

function hasActiveSubscription(subscriptions) {
  if (!subscriptions || subscriptions.length === 0) return false;
  return subscriptions.some(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );
}

export default function TrialBanner({ user, subscriptions }) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if dismissed, no user, or has subscription
  if (dismissed || !user?.trial_ends_at) return null;
  if (hasActiveSubscription(subscriptions)) return null;

  const trialEnd = new Date(user.trial_ends_at);
  const daysLeft = differenceInDays(trialEnd, new Date());

  // Don't show if trial already expired (gate handles that)
  if (daysLeft < 0) return null;

  // Color scheme based on urgency
  let bgColor, textColor, iconColor;
  if (daysLeft <= 2) {
    bgColor = 'bg-red-50 border-red-200';
    textColor = 'text-red-800';
    iconColor = 'text-red-600';
  } else if (daysLeft <= 6) {
    bgColor = 'bg-amber-50 border-amber-200';
    textColor = 'text-amber-800';
    iconColor = 'text-amber-600';
  } else {
    bgColor = 'bg-green-50 border-green-200';
    textColor = 'text-green-800';
    iconColor = 'text-green-600';
  }

  return (
    <div className={`${bgColor} border-b px-4 py-2`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
          <p className={`text-sm font-medium ${textColor}`}>
            {daysLeft === 0
              ? 'Your trial expires today!'
              : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your free trial`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={createPageUrl('Checkout')}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs">
              <CreditCard className="w-3 h-3 mr-1" />
              Subscribe Now
            </Button>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-black/5 rounded"
          >
            <X className={`w-4 h-4 ${iconColor}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
