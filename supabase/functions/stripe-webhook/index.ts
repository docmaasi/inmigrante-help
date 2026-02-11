import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { sendEmail } from '../_shared/send-email.ts';
import {
  subscriptionConfirmedHtml,
  subscriptionCanceledHtml,
} from '../_shared/email-templates.ts';

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
        let { data: profile } = await supabase
          .from('profiles')
          .select('id, is_archived, deletion_status')
          .eq('stripe_customer_id', customerId)
          .single();

        // Fallback: if not found by stripe_customer_id, look up by email
        // This handles the case where users subscribe via the Stripe Pricing Table
        // which creates the customer in Stripe but never saves the ID to our DB
        let needsCustomerIdUpdate = false;
        if (!profile) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted && customer.email) {
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('id, is_archived, deletion_status')
                .eq('email', customer.email)
                .single();

              if (emailProfile) {
                profile = emailProfile;
                needsCustomerIdUpdate = true;
                console.log(`Found user ${emailProfile.id} by email ${customer.email}, will save stripe_customer_id`);
              }
            }
          } catch (lookupErr) {
            console.error('Email fallback lookup failed:', lookupErr);
          }
        }

        if (profile) {
          // Calculate max_care_recipients from subscription items
          // Base plan = 1 care recipient, each additional add-on item adds to the count
          let maxCareRecipients = 1;
          for (const item of subscription.items.data) {
            const quantity = item.quantity || 1;
            // The first item is the base plan (1 recipient)
            // Additional items (quantity > 1 on base, or separate add-on line items) add more
            if (item !== subscription.items.data[0]) {
              maxCareRecipients += quantity;
            } else if (quantity > 1) {
              // If base plan has quantity > 1, extra units are additional recipients
              maxCareRecipients += (quantity - 1);
            }
          }
          // Cap at 10
          maxCareRecipients = Math.min(maxCareRecipients, 10);

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

          // Build the profile update object
          const profileUpdate: Record<string, any> = {
            subscription_status: subscription.status,
            max_care_recipients: maxCareRecipients,
          };

          // Save stripe_customer_id if found via email fallback
          if (needsCustomerIdUpdate) {
            profileUpdate.stripe_customer_id = customerId;
          }

          // Clear data deletion date since user subscribed
          profileUpdate.data_deletion_scheduled_at = null;

          // If account was archived/pending deletion, restore it on new subscription
          if (profile.is_archived || profile.deletion_status === 'pending') {
            profileUpdate.is_archived = false;
            profileUpdate.deletion_status = null;
            profileUpdate.deletion_requested_at = null;
            profileUpdate.deletion_scheduled_at = null;
            profileUpdate.deletion_reason = null;
            profileUpdate.restored_at = new Date().toISOString();

            await supabase
              .from('profiles')
              .update(profileUpdate)
              .eq('id', profile.id);

            console.log(`Account ${profile.id} restored via new subscription`);
          } else {
            await supabase
              .from('profiles')
              .update(profileUpdate)
              .eq('id', profile.id);
          }

          // Remove from blocked emails list if they paid
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted && customer.email) {
            await supabase
              .from('blocked_trial_emails')
              .delete()
              .eq('email', customer.email);
            console.log(`Removed ${customer.email} from blocked list (subscribed)`);
          }

          console.log(`Updated profile ${profile.id}: status=${subscription.status}, max_care_recipients=${maxCareRecipients}`);

          // Send subscription confirmation email (fire-and-forget)
          if (subscription.status === 'active' && customer && !customer.deleted && customer.email) {
            const { data: subProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', profile.id)
              .single();

            const planName = subscription.items.data[0]?.price.nickname || 'Premium';

            sendEmail({
              to: customer.email,
              subject: 'Your FamilyCare.Help subscription is active!',
              html: subscriptionConfirmedHtml(
                subProfile?.full_name || 'there',
                planName
              ),
            }).catch((err) => console.error('Subscription email failed:', err));
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
        const delCustomerId = subscription.customer as string;
        let { data: delProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', delCustomerId)
          .single();

        // Fallback: find by email if not found by stripe_customer_id
        if (!delProfile) {
          try {
            const customer = await stripe.customers.retrieve(delCustomerId);
            if (customer && !customer.deleted && customer.email) {
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', customer.email)
                .single();
              delProfile = emailProfile;
            }
          } catch (e) {
            console.error('Email fallback failed for subscription.deleted:', e);
          }
        }

        if (delProfile) {
          // Set 10-day grace period before data deletion
          const deletionDate = new Date();
          deletionDate.setDate(deletionDate.getDate() + 10);

          await supabase
            .from('profiles')
            .update({
              subscription_status: 'free',
              max_care_recipients: 1,
              data_deletion_scheduled_at: deletionDate.toISOString(),
            })
            .eq('id', delProfile.id);

          console.log(`Profile ${delProfile.id} marked for deletion on ${deletionDate.toISOString()}`);

          // Send cancellation warning email (fire-and-forget)
          try {
            const delCustomer = await stripe.customers.retrieve(delCustomerId);
            if (delCustomer && !delCustomer.deleted && delCustomer.email) {
              const { data: cancelProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', delProfile.id)
                .single();

              const formattedDeletion = deletionDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              sendEmail({
                to: delCustomer.email,
                subject: 'Your FamilyCare.Help subscription has been canceled',
                html: subscriptionCanceledHtml(
                  cancelProfile?.full_name || 'there',
                  formattedDeletion
                ),
              }).catch((err) => console.error('Cancellation email failed:', err));
            }
          } catch (emailErr) {
            console.error('Cancellation email lookup failed:', emailErr);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invCustomerId = invoice.customer as string;

        let { data: invProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', invCustomerId)
          .single();

        // Fallback: find by email if not found by stripe_customer_id
        if (!invProfile) {
          try {
            const customer = await stripe.customers.retrieve(invCustomerId);
            if (customer && !customer.deleted && customer.email) {
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', customer.email)
                .single();
              invProfile = emailProfile;
            }
          } catch (e) {
            console.error('Email fallback failed for invoice.paid:', e);
          }
        }

        if (invProfile) {
          await supabase.from('receipts').insert({
            user_id: invProfile.id,
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
        const failCustomerId = invoice.customer as string;

        let { data: failProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', failCustomerId)
          .single();

        // Fallback: find by email if not found by stripe_customer_id
        if (!failProfile) {
          try {
            const customer = await stripe.customers.retrieve(failCustomerId);
            if (customer && !customer.deleted && customer.email) {
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', customer.email)
                .single();
              failProfile = emailProfile;
            }
          } catch (e) {
            console.error('Email fallback failed for invoice.payment_failed:', e);
          }
        }

        if (failProfile) {
          // Create notification for failed payment
          await supabase.from('notifications').insert({
            user_id: failProfile.id,
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
