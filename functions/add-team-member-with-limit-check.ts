/**
 * Add team member with subscription limit check
 * Regular plan: 1 member allowed
 * With add-ons: 1 + number of add-ons
 */

export default async function handler(req, context) {
  const { memberData } = req.body;
  
  if (!memberData) {
    return { error: 'Missing member data', status: 400 };
  }

  try {
    // Get current user
    const currentUser = await context.asServiceRole.auth.me();
    
    // Get user's subscription details
    const users = await context.asServiceRole.entities.User.filter({ email: currentUser.email });
    const user = users[0];
    
    // Default to 1 member for regular plan
    const maxMembers = user.subscription_additional_members 
      ? 1 + parseInt(user.subscription_additional_members)
      : 1;
    
    // Count existing team members for this user
    const existingMembers = await context.asServiceRole.entities.TeamMember.list();
    const userTeamMembers = existingMembers.filter(m => m.active !== false);
    
    // Check if limit reached
    if (userTeamMembers.length >= maxMembers) {
      return {
        error: `You have reached your maximum of ${maxMembers} care team member${maxMembers > 1 ? 's' : ''}. Please upgrade your subscription to add more members.`,
        status: 403,
        maxMembers,
        currentCount: userTeamMembers.length
      };
    }
    
    // Create the team member
    const newMember = await context.asServiceRole.entities.TeamMember.create(memberData);
    
    return {
      success: true,
      member: newMember,
      remainingSlots: maxMembers - userTeamMembers.length - 1
    };
    
  } catch (error) {
    console.error('Error adding team member:', error);
    return { error: error.message, status: 500 };
  }
}