import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Shield, CheckCircle } from 'lucide-react';

export function Checkout() {
  const { user } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    if (user?.email) {
      const pricingTable = document.querySelector('stripe-pricing-table');
      if (pricingTable) {
        pricingTable.setAttribute('customer-email', user.email);
      }
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-slate-600 text-lg mb-6">
            Select the plan that best fits your caregiving needs
          </p>

          <Card className="max-w-3xl mx-auto border border-teal-200 bg-teal-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 text-left leading-relaxed">
                  During checkout, you may add one additional family member to your FamilyCare.Help subscription. If you need to include more family members or care partners, additional members can be added at any time through Subscription Management. Each additional member is billed at $5 per month, allowing you to expand access as your care team grows.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <a
              href="https://billing.stripe.com/p/login/aFaaEX04IcA44E1cjF4AU00"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Manage Your Subscription
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Additional members can be added here
            </p>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <stripe-pricing-table
              pricing-table-id="prctbl_1Sq0SNDw3DaD2xXnnwMDC51e"
              publishable-key="pk_live_51SdEBaDw3DaD2xXn8j40oxVS5GTtf2y1CT0cN9TUc29BS2suu6jjAPjCAfNwj75XKVYV7oMvgGhSCCFx4C7Zgk6v00P0JBlsS3">
            </stripe-pricing-table>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 text-center mt-3">
          Pricing table appearance is managed in your Stripe Dashboard
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Shield className="w-4 h-4 text-teal-600" />
          <p>Secure payment powered by Stripe · Cancel anytime</p>
        </div>

        <Card className="mt-6 border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Data Retention Notice</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
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
