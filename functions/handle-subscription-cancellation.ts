export default async function handleSubscriptionCancellation({ base44, request }) {
  const { subscription_id, user_email } = request.body;

  if (!subscription_id || !user_email) {
    return { status: 400, body: { error: 'Missing required fields' } };
  }

  const canceledAt = new Date().toISOString();
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 90);
  const deletionScheduledAt = deletionDate.toISOString();

  // Check if subscription record exists
  const existing = await base44.asServiceRole.entities.Subscription.filter({
    user_email,
    stripe_subscription_id: subscription_id
  });

  if (existing.length > 0) {
    // Update existing subscription
    await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
      status: 'canceled',
      canceled_at: canceledAt,
      deletion_scheduled_at: deletionScheduledAt
    });
  } else {
    // Create new subscription record
    await base44.asServiceRole.entities.Subscription.create({
      user_email,
      stripe_subscription_id: subscription_id,
      status: 'canceled',
      canceled_at: canceledAt,
      deletion_scheduled_at: deletionScheduledAt
    });
  }

  // Send cancellation email notification
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: user_email,
    subject: 'FamilyCare.Help Subscription Canceled - Data Retention Notice',
    body: `
      <h2>Your FamilyCare.Help subscription has been canceled</h2>
      
      <p>We're sorry to see you go. Your subscription has been successfully canceled.</p>
      
      <h3>Important: Data Retention Policy</h3>
      
      <p><strong>Your data will be retained for 90 days.</strong></p>
      
      <ul>
        <li>Your account data will be kept until <strong>${deletionDate.toLocaleDateString()}</strong></li>
        <li>Access to your account is not guaranteed during this period</li>
        <li>If you renew within 90 days, all your data will be fully restored</li>
        <li>After 90 days, your data may be permanently deleted and cannot be recovered</li>
      </ul>
      
      <p><strong>Action Required:</strong> If you need your records for personal, medical, or legal purposes, please export or download them before the deletion date.</p>
      
      <p>To reactivate your subscription at any time, please visit your account dashboard.</p>
      
      <p>Thank you for using FamilyCare.Help.</p>
    `
  });

  return {
    status: 200,
    body: {
      success: true,
      canceled_at: canceledAt,
      deletion_scheduled_at: deletionScheduledAt
    }
  };
}