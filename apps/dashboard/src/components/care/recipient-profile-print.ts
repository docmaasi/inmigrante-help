import { printDocument, buildPrintStyles, buildPrintHeader, buildPrintFooter } from '@/lib/print-utils';

interface Recipient {
  first_name?: string; last_name?: string;
  date_of_birth?: string; primary_condition?: string;
  allergies?: string; dietary_restrictions?: string;
  emergency_contact_name?: string; emergency_contact_relationship?: string;
  emergency_contact_phone?: string; emergency_contact_email?: string;
  secondary_emergency_contact_name?: string; secondary_emergency_contact_phone?: string;
  primary_physician?: string; physician_phone?: string;
  notes?: string;
}

interface PrintMedication { name: string; dosage?: string; frequency?: string; purpose?: string; }
interface PrintAppointment { title: string; start_time?: string; provider_name?: string; location?: string; }

function buildEmergencySection(r: Recipient): string {
  const primary = r.emergency_contact_name ? `<div class="card" style="border-left-color:#dc2626;">
    <strong>${r.emergency_contact_name}</strong>
    ${r.emergency_contact_relationship ? ` — ${r.emergency_contact_relationship}` : ''}
    ${r.emergency_contact_phone ? `<div>📞 ${r.emergency_contact_phone}</div>` : ''}
    ${r.emergency_contact_email ? `<div>✉ ${r.emergency_contact_email}</div>` : ''}
  </div>` : '<div class="card">No emergency contact on file.</div>';

  const secondary = r.secondary_emergency_contact_name ? `<div class="card">
    <strong>${r.secondary_emergency_contact_name}</strong> (Secondary)
    ${r.secondary_emergency_contact_phone ? `<div>📞 ${r.secondary_emergency_contact_phone}</div>` : ''}
  </div>` : '';

  return `<div class="section"><h2>Emergency Contacts</h2>${primary}${secondary}</div>`;
}

function buildMedSection(meds: PrintMedication[]): string {
  if (meds.length === 0) return '';
  const rows = meds.map(m =>
    `<div class="row"><span><strong>${m.name}</strong>${m.dosage ? ` — ${m.dosage}` : ''}</span><span>${m.frequency ?? ''}</span></div>`,
  ).join('');
  return `<div class="section"><h2>Active Medications (${meds.length})</h2>${rows}</div>`;
}

function buildAptSection(apts: PrintAppointment[]): string {
  if (apts.length === 0) return '';
  const rows = apts.slice(0, 5).map(a => {
    const dt = a.start_time
      ? new Date(a.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    return `<div class="row"><span>${a.title}${a.provider_name ? ` — ${a.provider_name}` : ''}</span><span>${dt}</span></div>`;
  }).join('');
  return `<div class="section"><h2>Upcoming Appointments</h2>${rows}</div>`;
}

export function printRecipientProfile(
  recipient: Recipient,
  medications: PrintMedication[],
  appointments: PrintAppointment[],
): void {
  const fullName = [recipient.first_name, recipient.last_name].filter(Boolean).join(' ');
  const dob = recipient.date_of_birth ? new Date(recipient.date_of_birth).toLocaleDateString() : 'N/A';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Care Summary — ${fullName}</title>
    ${buildPrintStyles('#0d9488')}
  </head><body>
    ${buildPrintHeader({ title: `Care Summary: ${fullName}`, meta: `Date of Birth: ${dob}` })}
    ${recipient.primary_condition ? `<div class="section"><h2>Primary Condition</h2><div class="card">${recipient.primary_condition}</div></div>` : ''}
    ${recipient.allergies ? `<div class="section"><h2>Allergies</h2><div class="card" style="border-left-color:#dc2626;background:#fef2f2;">${recipient.allergies}</div></div>` : ''}
    ${recipient.dietary_restrictions ? `<div class="section"><h2>Dietary Restrictions</h2><div class="card">${recipient.dietary_restrictions}</div></div>` : ''}
    ${buildEmergencySection(recipient)}
    ${recipient.primary_physician ? `<div class="section"><h2>Primary Physician</h2><div class="card">${recipient.primary_physician}${recipient.physician_phone ? ` — 📞 ${recipient.physician_phone}` : ''}</div></div>` : ''}
    ${buildMedSection(medications)}
    ${buildAptSection(appointments)}
    ${recipient.notes ? `<div class="section"><h2>Additional Notes</h2><div class="card">${recipient.notes}</div></div>` : ''}
    ${buildPrintFooter()}
  </body></html>`;

  printDocument(html);
}
