export default async function createStripePortalSession({ user }) {
  // Ensure user is authenticated
  if (!user) {
    return { 
      ok: false, 
      code: "UNAUTHORIZED", 
      message: "You must be logged in to access billing." 
    };
  }

  // Get the user's stripe_customer_id
  const userRecord = await base44.asServiceRole.entities.User.filter({ email: user.email });
  
  if (!userRecord || userRecord.length === 0) {
    return { 
      ok: false, 
      code: "USER_NOT_FOUND", 
      message: "User record not found." 
    };
  }

  const stripeCustomerId = userRecord[0].stripe_customer_id;

  // Check if user has a Stripe customer ID
  if (!stripeCustomerId || stripeCustomerId.trim() === '') {
    return { 
      ok: false, 
      code: "NO_CUSTOMER", 
      message: "No Stripe customer found for this user." 
    };
  }

  // Create Stripe Billing Portal Session
  const STRIPE_SECRET_KEY = base44.getSecret('STRIPE_SECRET_KEY');
  
  if (!STRIPE_SECRET_KEY) {
    return { 
      ok: false, 
      code: "CONFIG_ERROR", 
      message: "Stripe is not configured. Please contact support." 
    };
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        return_url: 'https://www.familycare.help/Settings'
      }).toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error:', errorData);
      return { 
        ok: false, 
        code: "STRIPE_ERROR", 
        message: "Failed to create billing portal session." 
      };
    }

    const session = await response.json();
    
    return { 
      ok: true, 
      url: session.url 
    };
  } catch (error) {
    console.error('Error creating Stripe portal session:', error);
    return { 
      ok: false, 
      code: "UNEXPECTED_ERROR", 
      message: "An unexpected error occurred. Please try again." 
    };
  }
}