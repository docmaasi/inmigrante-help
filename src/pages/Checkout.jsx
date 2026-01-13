import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    priceId: 'price_monthly', // Replace with your actual Stripe Price ID
    price: 14.99,
    interval: 'month',
    popular: true,
    features: [
      'Unlimited care recipients',
      'All core features included',
      'Advanced scheduling',
      'AI care plans',
      'Document management',
      'Medication tracking',
      'Team collaboration',
      'Mobile app access',
      'Add family members at $5/month each'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    priceId: 'price_yearly', // Replace with your actual Stripe Price ID
    price: 149.99,
    interval: 'year',
    savings: 'Save $29.89',
    features: [
      'Unlimited care recipients',
      'All core features included',
      'Advanced scheduling',
      'AI care plans',
      'Document management',
      'Medication tracking',
      'Team collaboration',
      'Mobile app access',
      'Add family members at $5/month each',
      '2 months free compared to monthly'
    ]
  }
];

function CheckoutForm({ selectedPlan, additionalMembers, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPrice = selectedPlan.interval === 'month' 
    ? selectedPlan.price + (additionalMembers * 5)
    : selectedPlan.price + (additionalMembers * 5 * 12);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Call backend function to create subscription
      const result = await base44.functions.invoke('stripe-create-subscription', {
        paymentMethodId: paymentMethod.id,
        priceId: selectedPlan.priceId,
        planName: selectedPlan.name,
        additionalMembers: additionalMembers
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Subscription created successfully!');
      onSuccess();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-slate-300 rounded-lg">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#334155',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Subscribe - ${totalPrice.toFixed(2)}/{selectedPlan.interval === 'month' ? 'mo' : 'yr'}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-slate-500">
        Your subscription will renew automatically. Cancel anytime.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [additionalMembers, setAdditionalMembers] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 2000);
  };

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
        </div>

        {!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map(plan => (
              <Card 
                key={plan.id} 
                className={`relative shadow-sm hover:shadow-lg transition-all ${
                  plan.popular ? 'border-2 border-blue-500 shadow-md' : 'border-slate-200/60'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white">{plan.savings}</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-slate-800">${plan.price}</span>
                      <span className="text-slate-500">/{plan.interval}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    Select {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Complete Your Subscription</CardTitle>
                    <CardDescription className="mt-2">
                      You selected: <strong>{selectedPlan.name} Plan</strong>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPlan(null)}
                  >
                    Change Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{selectedPlan.name} Plan</div>
                      <div className="text-sm text-slate-600">Billed {selectedPlan.interval}ly</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${selectedPlan.price}<span className="text-base font-normal text-slate-600">/{selectedPlan.interval}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Family Members */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Family Members
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Add more family members to collaborate on care at $5/month each
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAdditionalMembers(Math.max(0, additionalMembers - 1))}
                      disabled={additionalMembers === 0}
                    >
                      -
                    </Button>
                    <div className="text-2xl font-semibold text-slate-800 w-12 text-center">
                      {additionalMembers}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAdditionalMembers(additionalMembers + 1)}
                    >
                      +
                    </Button>
                    {additionalMembers > 0 && (
                      <div className="text-sm text-slate-600">
                        +${(additionalMembers * 5 * (selectedPlan.interval === 'year' ? 12 : 1)).toFixed(2)}/{selectedPlan.interval}
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Summary */}
                {additionalMembers > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Base Plan</span>
                      <span className="font-medium">${selectedPlan.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{additionalMembers} Additional Member{additionalMembers !== 1 ? 's' : ''}</span>
                      <span className="font-medium">
                        +${(additionalMembers * 5 * (selectedPlan.interval === 'year' ? 12 : 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                      <span className="font-semibold text-slate-800">Total</span>
                      <span className="font-bold text-blue-600 text-lg">
                        ${(selectedPlan.price + (additionalMembers * 5 * (selectedPlan.interval === 'year' ? 12 : 1))).toFixed(2)}/{selectedPlan.interval}
                      </span>
                    </div>
                  </div>
                )}

                <Elements stripe={stripePromise}>
                  <CheckoutForm selectedPlan={selectedPlan} additionalMembers={additionalMembers} onSuccess={handleSuccess} />
                </Elements>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Secure payment powered by Stripe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}