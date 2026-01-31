import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, is_archived, deletion_status')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('subscriptions').upsert({
            user_id: profile.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            plan_id: subscription.items.data[0]?.price.id,
            plan_name: subscription.items.data[0]?.price.nickname || 'Premium',
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, {
            onConflict: 'stripe_subscription_id',
          });

          // If account was archived/pending deletion, restore it on new subscription
          if (profile.is_archived || profile.deletion_status === 'pending') {
            await supabase
              .from('profiles')
              .update({
                subscription_status: subscription.status,
                is_archived: false,
                deletion_status: null,
                deletion_requested_at: null,
                deletion_scheduled_at: null,
                deletion_reason: null,
                restored_at: new Date().toISOString(),
              })
              .eq('id', profile.id);

            console.log(`Account ${profile.id} restored via new subscription`);
          } else {
            // Just update subscription status
            await supabase
              .from('profiles')
              .update({ subscription_status: subscription.status })
              .eq('id', profile.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Find and update profile
        const customerId = subscription.customer as string;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'free' })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('receipts').insert({
            user_id: profile.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            description: invoice.description || 'Subscription payment',
            invoice_pdf_url: invoice.invoice_pdf,
            paid_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          // Create notification for failed payment
          await supabase.from('notifications').insert({
            user_id: profile.id,
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method.',
            type: 'billing',
          });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
