import { printDocument, buildPrintStyles, buildPrintHeader, buildPrintFooter } from '@/lib/print-utils';

interface Appointment {
  id: string;
  title: string;
  appointment_type?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  provider_name?: string;
  notes?: string;
  status?: string;
  care_recipient_id?: string;
}

function formatDateTime(iso?: string): string {
  if (!iso) return 'Not scheduled';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function buildAptCard(apt: Appointment, getRecipientName: (id: string) => string): string {
  const status = apt.status ?? 'scheduled';
  const statusColor = status === 'completed' ? '#16a34a' : '#2563eb';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
      <div style="font-weight:bold;font-size:15px;">${apt.title}</div>
      <span class="badge" style="background:${statusColor}20;color:${statusColor};">${status}</span>
    </div>
    ${apt.appointment_type ? `<div><strong>Type:</strong> ${apt.appointment_type.replace(/_/g, ' ')}</div>` : ''}
    <div><strong>Date:</strong> ${formatDateTime(apt.start_time)}</div>
    ${apt.location ? `<div><strong>Location:</strong> ${apt.location}</div>` : ''}
    ${apt.provider_name ? `<div><strong>Provider:</strong> ${apt.provider_name}</div>` : ''}
    ${apt.care_recipient_id ? `<div><strong>For:</strong> ${getRecipientName(apt.care_recipient_id)}</div>` : ''}
    ${apt.notes ? `<div style="margin-top:4px;color:#555;font-style:italic;">${apt.notes}</div>` : ''}
  </div>`;
}

function buildAptSection(label: string, apts: Appointment[], getRecipientName: (id: string) => string): string {
  if (apts.length === 0) return '';
  return `<div class="section">
    <h2>${label} (${apts.length})</h2>
    ${apts.map(a => buildAptCard(a, getRecipientName)).join('')}
  </div>`;
}

export function printAppointments(
  appointments: Appointment[],
  getRecipientName: (id: string) => string,
): void {
  const upcoming = appointments.filter(a => a.status !== 'completed');
  const completed = appointments.filter(a => a.status === 'completed');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Appointments</title>
    ${buildPrintStyles('#E07A5F')}
  </head><body>
    ${buildPrintHeader({ title: 'Appointments', meta: `${appointments.length} appointment(s)` })}
    ${buildAptSection('Upcoming', upcoming, getRecipientName)}
    ${buildAptSection('Completed', completed, getRecipientName)}
    ${appointments.length === 0 ? '<p style="color:#888;">No appointments recorded.</p>' : ''}
    ${buildPrintFooter()}
  </body></html>`;

  printDocument(html);
}
