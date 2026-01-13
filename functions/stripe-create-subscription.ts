/**
 * Creates a Stripe subscription for the current user
 * 
 * @param {Object} params
 * @param {string} params.paymentMethodId - Stripe payment method ID
 * @param {string} params.priceId - Stripe price ID for the subscription
 * @param {string} params.planName - Name of the selected plan
 * @returns {Object} subscription details or error
 */

export default async function handler({ paymentMethodId, priceId, planName, additionalMembers = 0 }, context) {
  const Stripe = require('stripe');
  const stripe = Stripe(context.secrets.STRIPE_SECRET_KEY);

  try {
    // Get current user
    const user = context.user;
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Check if user already has a Stripe customer ID
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        metadata: {
          user_id: user.id,
          user_email: user.email
        }
      });
      customerId = customer.id;
    } else {
      // Attach payment method to existing customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id,
        plan_name: planName
      }
    });

    // Update user record with subscription info
    await context.entities.User.update(user.id, {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_plan: planName,
      subscription_price_id: priceId,
      subscription_additional_members: additionalMembers,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };

  } catch (error) {
    console.error('Stripe subscription error:', error);
    return { 
      error: error.message || 'Failed to create subscription'
    };
  }
}