/**
 * Generates an HTML string for printing an AI-generated care plan.
 * Opens in a new window and triggers browser print dialog.
 *
 * @param {object} params
 * @param {object} params.plan - The AI plan data (one of the 3 options)
 * @param {string} params.recipientName - Full name of the care recipient
 * @param {string} params.planType - "daily" or "weekly"
 */
export function generatePrintHTML({ plan, recipientName, planType }) {
  const today = new Date().toLocaleDateString();
  const typeLabel = planType === 'daily' ? 'Daily' : 'Weekly';

  const scheduleHTML = (plan.daily_schedule || [])
    .map(
      (item) => `
      <div class="schedule-item">
        <span class="time">${item.time}</span>
        <div>
          <strong>${item.activity}</strong>
          ${item.notes ? `<p class="notes">${item.notes}</p>` : ''}
        </div>
      </div>`
    )
    .join('');

  const vitalsHTML = (plan.health_monitoring?.vitals_to_track || [])
    .map((v) => `<span class="badge">${v}</span>`)
    .join('');

  const warningsHTML = (plan.health_monitoring?.warning_signs || [])
    .map((w) => `<li>${w}</li>`)
    .join('');

  const activitiesHTML = (plan.activities_recommendations || [])
    .map(
      (a) => `
      <div class="activity-card">
        <span class="category">${a.category}</span>
        <strong>${a.activity}</strong>
        <p>${a.frequency}</p>
        <p class="benefits">${a.benefits}</p>
      </div>`
    )
    .join('');

  const considerationsHTML = (plan.special_considerations || [])
    .map((c) => `<li>${c}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${typeLabel} Care Plan - ${recipientName}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
      .section { page-break-inside: avoid; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 { margin: 0; color: #7c3aed; font-size: 24px; }
    .header .meta { color: #666; font-size: 14px; margin-top: 6px; }
    .label-badge {
      display: inline-block;
      background: #f3e8ff;
      color: #7c3aed;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
    }
    .section { margin-bottom: 28px; }
    .section h2 {
      color: #7c3aed;
      font-size: 18px;
      border-bottom: 2px solid #e9d5ff;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .schedule-item {
      display: flex;
      gap: 12px;
      padding: 10px;
      margin-bottom: 6px;
      background: #f8f9fa;
      border-left: 3px solid #7c3aed;
      border-radius: 4px;
    }
    .schedule-item .time {
      font-weight: bold;
      color: #7c3aed;
      min-width: 70px;
    }
    .schedule-item .notes { color: #666; font-size: 13px; margin: 4px 0 0; }
    .badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 13px;
      margin: 2px 4px 2px 0;
    }
    .warning-list { padding-left: 20px; }
    .warning-list li { margin-bottom: 4px; font-size: 14px; }
    .checkup { background: #eff6ff; padding: 10px; border-radius: 6px; font-size: 14px; color: #1e40af; }
    .activity-card {
      background: #f8f9fa;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 3px solid #7c3aed;
      border-radius: 4px;
    }
    .activity-card .category {
      display: inline-block;
      background: #f3e8ff;
      color: #7c3aed;
      padding: 1px 8px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .activity-card .benefits { color: #666; font-size: 13px; font-style: italic; }
    .considerations {
      background: #fff7ed;
      padding: 14px;
      border-radius: 6px;
      border-left: 3px solid #ea580c;
    }
    .considerations li { margin-bottom: 4px; font-size: 14px; color: #9a3412; }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${typeLabel} Care Plan &mdash; ${recipientName}</h1>
    <div class="meta">Generated ${today}</div>
    ${plan.label ? `<span class="label-badge">${plan.label}</span>` : ''}
    ${plan.summary ? `<p style="margin-top:8px;color:#555;font-size:14px;">${plan.summary}</p>` : ''}
  </div>

  ${scheduleHTML ? `
  <div class="section">
    <h2>Schedule</h2>
    ${scheduleHTML}
  </div>` : ''}

  ${vitalsHTML || warningsHTML ? `
  <div class="section">
    <h2>Health Monitoring</h2>
    ${vitalsHTML ? `<p style="margin-bottom:8px;"><strong>Vitals to Track:</strong></p>${vitalsHTML}` : ''}
    ${warningsHTML ? `<p style="margin-top:12px;margin-bottom:4px;"><strong>Warning Signs:</strong></p><ul class="warning-list">${warningsHTML}</ul>` : ''}
    ${plan.health_monitoring?.checkup_frequency ? `<div class="checkup"><strong>Check-up Frequency:</strong> ${plan.health_monitoring.checkup_frequency}</div>` : ''}
  </div>` : ''}

  ${activitiesHTML ? `
  <div class="section">
    <h2>Activities &amp; Engagement</h2>
    ${activitiesHTML}
  </div>` : ''}

  ${considerationsHTML ? `
  <div class="section">
    <h2>Special Considerations</h2>
    <div class="considerations">
      <ul style="padding-left:18px;margin:0;">${considerationsHTML}</ul>
    </div>
  </div>` : ''}

  <div class="footer">
    <p>Generated by FamilyCare.Help AI Care Plan</p>
    <p>This care plan is for informational purposes. Always consult healthcare professionals for medical decisions.</p>
  </div>
</body>
</html>`;
}

export function printCarePlanAI({ plan, recipientName, planType }) {
  const html = generatePrintHTML({ plan, recipientName, planType });
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

export default printCarePlanAI;
