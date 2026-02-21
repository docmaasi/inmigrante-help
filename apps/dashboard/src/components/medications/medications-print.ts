import { printDocument, buildPrintStyles, buildPrintHeader, buildPrintFooter } from '@/lib/print-utils';

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  purpose?: string;
  prescribing_doctor?: string;
  refill_date?: string;
  instructions?: string;
  is_active: boolean;
  care_recipient_id: string;
}

function buildMedCard(med: Medication, getRecipientName: (id: string) => string): string {
  const lines: string[] = [
    `<div><strong>For:</strong> ${getRecipientName(med.care_recipient_id)}</div>`,
  ];
  if (med.dosage) lines.push(`<div><strong>Dosage:</strong> ${med.dosage}</div>`);
  if (med.frequency) lines.push(`<div><strong>Frequency:</strong> ${med.frequency}</div>`);
  if (med.purpose) lines.push(`<div><strong>Purpose:</strong> ${med.purpose}</div>`);
  if (med.prescribing_doctor) lines.push(`<div><strong>Prescribed by:</strong> ${med.prescribing_doctor}</div>`);
  if (med.refill_date) lines.push(`<div><strong>Next refill:</strong> ${new Date(med.refill_date).toLocaleDateString()}</div>`);
  if (med.instructions) {
    lines.push(`<div style="color:#b45309;margin-top:4px;"><strong>⚠ Instructions:</strong> ${med.instructions}</div>`);
  }
  return `<div class="card">
    <div style="font-weight:bold;font-size:15px;margin-bottom:6px;">${med.name}</div>
    ${lines.join('')}
  </div>`;
}

function buildSection(label: string, meds: Medication[], getRecipientName: (id: string) => string): string {
  return `<div class="section">
    <h2>${label} (${meds.length})</h2>
    ${meds.map(m => buildMedCard(m, getRecipientName)).join('')}
  </div>`;
}

export function printMedications(
  medications: Medication[],
  getRecipientName: (id: string) => string,
): void {
  const active = medications.filter(m => m.is_active !== false);
  const inactive = medications.filter(m => m.is_active === false);

  const body = active.length > 0 && inactive.length > 0
    ? buildSection('Active', active, getRecipientName) + buildSection('Inactive', inactive, getRecipientName)
    : medications.length > 0
      ? buildSection(active.length > 0 ? 'Active Medications' : 'Inactive Medications', medications, getRecipientName)
      : '<p style="color:#888;">No medications recorded.</p>';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Medications</title>
    ${buildPrintStyles('#4F46E5')}
  </head><body>
    ${buildPrintHeader({ title: 'Medications', meta: `${medications.length} medication(s)` })}
    ${body}
    ${buildPrintFooter()}
  </body></html>`;

  printDocument(html);
}
