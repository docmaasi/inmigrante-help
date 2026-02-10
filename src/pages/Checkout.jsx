import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Checkout() {
  // Add subtle pulse animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes subtle-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.95; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
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
    <div className="min-h-screen bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/ef1338dd1_Untitleddesign18.png)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-slate-600 mb-3">
            Select the plan that best fits your caregiving needs
          </p>
          <p className="text-sm text-blue-700 font-medium max-w-3xl mx-auto">
            During checkout, you may add one additional family member to your FamilyCare.Help subscription. If you need to include more family members or care partners, additional members can be added at any time through Subscription Management. Each additional member is billed at $5 per month, allowing you to expand access as your care team grows.
          </p>
          <div className="mt-6">
            <a 
              href="https://billing.stripe.com/p/login/aFaaEX04IcA44E1cjF4AU00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:brightness-110"
              style={{ animation: 'subtle-pulse 3s ease-in-out infinite' }}
            >
              <span className="text-center">
                Manage Your Subscription, Additional Members Can Be Added Here
              </span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1Sq0SNDw3DaD2xXnnwMDC51e"
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
                  After cancellation, FamilyCare.Help retains records for up to 10 days. Access is not guaranteed during this period.
                  If you renew within 10 days, your data remains intact. After 10 days, records will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}