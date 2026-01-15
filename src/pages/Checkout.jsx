import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Checkout() {
  useEffect(() => {
    // Load the Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    // Prefill customer email if user is logged in
    base44.auth.me().then(user => {
      if (user && user.email) {
        const pricingTable = document.querySelector('stripe-pricing-table');
        if (pricingTable) {
          pricingTable.setAttribute('customer-email', user.email);
        }
      }
    }).catch(() => {});

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-slate-600">
            Select the plan that best fits your caregiving needs
          </p>
          <div className="mt-4">
            <a 
              href="https://billing.stripe.com/p/login/aFaaEX04IcA44E1cjF4AU00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Manage Your Subscription
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1SoJZsDw3DaD2xXn0MJ3EPyq"
            publishable-key="pk_live_51SdEBaDw3DaD2xXn8j40oxVS5GTtf2y1CT0cN9TUc29BS2suu6jjAPjCAfNwj75XKVYV7oMvgGhSCCFx4C7Zgk6v00P0JBlsS3">
          </stripe-pricing-table>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Secure payment powered by Stripe • Cancel anytime</p>
        </div>

        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm mb-1">Data Retention Notice</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  After cancellation, FamilyCare.Help retains records for up to 90 days. Access is not guaranteed during this period. 
                  If you renew within 90 days, your data remains intact. After 90 days, records may be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}