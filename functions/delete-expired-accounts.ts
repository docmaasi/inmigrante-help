export default async function deleteExpiredAccounts({ base44 }) {
  const now = new Date();
  
  // Find all canceled subscriptions where deletion date has passed
  const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
    status: 'canceled'
  });

  const expiredSubscriptions = subscriptions.filter(sub => {
    if (!sub.deletion_scheduled_at) return false;
    const deletionDate = new Date(sub.deletion_scheduled_at);
    return now >= deletionDate;
  });

  const deletedAccounts = [];

  for (const subscription of expiredSubscriptions) {
    const userEmail = subscription.user_email;

    try {
      // Delete all user-related data
      const entities = [
        'CareRecipient',
        'Appointment',
        'Medication',
        'Task',
        'CareNote',
        'MedicationLog',
        'TeamMember',
        'CarePlan',
        'CarePlanDetail',
        'Conversation',
        'Message',
        'MedicationRefill',
        'Notification',
        'ActionLog',
        'Document',
        'CaregiverShift',
        'ExternalCommunication',
        'WidgetPreferences',
        'LegalAcceptance'
      ];

      for (const entityName of entities) {
        try {
          // Delete records created by this user
          const records = await base44.asServiceRole.entities[entityName].filter({
            created_by: userEmail
          });
          
          for (const record of records) {
            await base44.asServiceRole.entities[entityName].delete(record.id);
          }

          // For entities with user_email field
          const userRecords = await base44.asServiceRole.entities[entityName].filter({
            user_email: userEmail
          });
          
          for (const record of userRecords) {
            await base44.asServiceRole.entities[entityName].delete(record.id);
          }
        } catch (err) {
          console.error(`Error deleting ${entityName}:`, err);
        }
      }

      // Delete subscription record
      await base44.asServiceRole.entities.Subscription.delete(subscription.id);

      deletedAccounts.push(userEmail);

      // Send deletion confirmation email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'FamilyCare.Help Account Data Deleted',
        body: `
          <h2>Your FamilyCare.Help account data has been deleted</h2>
          
          <p>As per our record retention policy, your account data has been permanently deleted after the 90-day retention period.</p>
          
          <p>If you wish to use FamilyCare.Help again in the future, you will need to create a new account and set up your information from scratch.</p>
          
          <p>Thank you for using FamilyCare.Help.</p>
        `
      });
    } catch (error) {
      console.error(`Failed to delete account for ${userEmail}:`, error);
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      deleted_accounts: deletedAccounts,
      count: deletedAccounts.length
    }
  };
}