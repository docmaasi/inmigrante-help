/**
 * Builds the prompt string sent to the AI for generating 3 care plan options.
 */
export function buildPrompt(type, recipient, medications, appointments, tasks, customPrompt) {
  const name = `${recipient.first_name} ${recipient.last_name}`;
  return `Generate 3 comprehensive ${type} care plan variations (Conservative, Balanced, Comprehensive) for:

**Care Recipient Profile:**
- Name: ${name}
- Primary Condition: ${recipient.primary_condition || 'Not specified'}
- Allergies: ${recipient.allergies || 'None listed'}
- Date of Birth: ${recipient.date_of_birth || 'Not provided'}

**Current Medications (${medications.length}):**
${medications.map((m) => `- ${m.name}: ${m.dosage}, ${m.frequency || ''} ${m.time_of_day ? `at ${m.time_of_day}` : ''}`).join('\n')}

**Upcoming Appointments (${appointments.length}):**
${appointments.slice(0, 5).map((a) => `- ${a.title} on ${a.start_time ? new Date(a.start_time).toLocaleDateString() : a.date}`).join('\n')}

**Current Tasks (${tasks.length}):**
${tasks.slice(0, 5).map((t) => `- ${t.title} (${t.priority} priority)`).join('\n')}

**Additional Notes:** ${recipient.notes || 'None'}

${customPrompt ? `**Special Instructions:** ${customPrompt}\n` : ''}
Each plan must include: daily_schedule, health_monitoring, activities_recommendations, special_considerations.
Wrap all 3 plans in a "plans" array. Each plan needs a "label" and "summary" field.`;
}

/**
 * Builds the JSON schema describing the expected AI response format.
 */
export function buildResponseSchema() {
  const planSchema = {
    type: 'object',
    properties: {
      label: { type: 'string' },
      summary: { type: 'string' },
      daily_schedule: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            time: { type: 'string' },
            activity: { type: 'string' },
            notes: { type: 'string' },
          },
        },
      },
      health_monitoring: {
        type: 'object',
        properties: {
          vitals_to_track: { type: 'array', items: { type: 'string' } },
          warning_signs: { type: 'array', items: { type: 'string' } },
          checkup_frequency: { type: 'string' },
        },
      },
      activities_recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            activity: { type: 'string' },
            frequency: { type: 'string' },
            benefits: { type: 'string' },
          },
        },
      },
      special_considerations: { type: 'array', items: { type: 'string' } },
    },
  };

  return {
    type: 'object',
    properties: {
      plans: { type: 'array', items: planSchema },
    },
  };
}
