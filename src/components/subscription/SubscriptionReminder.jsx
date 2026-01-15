import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Sparkles, X } from 'lucide-react';

export default function SubscriptionReminder({ userEmail }) {
  const [showReminder, setShowReminder] = useState(false);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', userEmail],
    queryFn: () => userEmail ? base44.entities.Subscription.filter({ user_email: userEmail }) : [],
    enabled: !!userEmail
  });

  const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active' || sub.status === 'trialing');

  useEffect(() => {
    if (!userEmail || hasActiveSubscription) return;

    const interval = setInterval(() => {
      setShowReminder(true);
    }, 180000); // 3 minutes

    // Show immediately on mount for unsubscribed users
    const timeout = setTimeout(() => {
      setShowReminder(true);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [userEmail, hasActiveSubscription]);

  if (!userEmail || hasActiveSubscription) return null;

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="max-w-md">
        <button
          onClick={() => setShowReminder(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl">Explore All Features!</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3">
            <p className="text-slate-700">
              You're currently viewing the app in <span className="font-semibold">read-only mode</span>.
            </p>
            <p className="text-slate-600">
              Start your <span className="font-bold text-orange-600">10-day free trial</span> to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>Add and manage care recipients</li>
              <li>Schedule appointments and tasks</li>
              <li>Track medications and refills</li>
              <li>Collaborate with your care team</li>
              <li>Access all premium features</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mt-4">
          <Link to={createPageUrl('Checkout')}>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
              Start 10-Day Free Trial
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowReminder(false)}
            className="w-full"
          >
            Continue Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}