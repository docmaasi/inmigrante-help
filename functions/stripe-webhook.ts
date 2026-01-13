/**
 * Stripe webhook handler
 * Keeps user subscription status in sync with Stripe events
 * 
 * Configure this webhook URL in your Stripe dashboard:
 * https://your-app-url.base44.io/api/functions/stripe-webhook
 */

export default async function handler(req, context) {
  const Stripe = require('stripe');
  const stripe = Stripe(context.secrets.STRIPE_SECRET_KEY);
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = context.secrets.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { error: `Webhook Error: ${err.message}`, status: 400 };
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object, context);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, context);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, context);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, context);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return { error: error.message, status: 500 };
  }
}

async function handleSubscriptionUpdate(subscription, context) {
  const customerId = subscription.customer;
  
  // Find user by stripe_customer_id
  const users = await context.entities.User.filter({ stripe_customer_id: customerId });
  
  if (users.length === 0) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const user = users[0];

  await context.entities.User.update(user.id, {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  });

  console.log(`Updated subscription for user ${user.email}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription, context) {
  const customerId = subscription.customer;
  
  const users = await context.entities.User.filter({ stripe_customer_id: customerId });
  
  if (users.length === 0) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const user = users[0];

  await context.entities.User.update(user.id, {
    subscription_status: 'cancelled',
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  });

  console.log(`Subscription cancelled for user ${user.email}`);
}

async function handlePaymentSucceeded(invoice, context) {
  const customerId = invoice.customer;
  
  const users = await context.entities.User.filter({ stripe_customer_id: customerId });
  
  if (users.length === 0) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const user = users[0];

  // Update subscription status to active on successful payment
  await context.entities.User.update(user.id, {
    subscription_status: 'active'
  });

  console.log(`Payment succeeded for user ${user.email}`);
}

async function handlePaymentFailed(invoice, context) {
  const customerId = invoice.customer;
  
  const users = await context.entities.User.filter({ stripe_customer_id: customerId });
  
  if (users.length === 0) {
    console.error('No user found for customer:', customerId);
    return;
  }

  const user = users[0];

  // Update subscription status to past_due on failed payment
  await context.entities.User.update(user.id, {
    subscription_status: 'past_due'
  });

  console.log(`Payment failed for user ${user.email}`);
}