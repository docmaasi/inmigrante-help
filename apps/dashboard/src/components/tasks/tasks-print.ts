import { printDocument, buildPrintStyles, buildPrintHeader, buildPrintFooter } from '@/lib/print-utils';

interface TeamMember { full_name?: string; }

interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  due_date?: string;
  care_recipient_id?: string;
  team_members?: TeamMember;
  notes?: string;
  recurring?: boolean;
  recurrence_pattern?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#dc2626', high: '#ea580c', medium: '#2563eb', low: '#64748b',
};

function buildTaskCard(task: Task, getRecipientName: (id: string) => string): string {
  const pColor = PRIORITY_COLORS[task.priority ?? 'medium'] ?? '#64748b';
  const due = task.due_date ? new Date(task.due_date).toLocaleDateString() : '—';
  const assignee = task.team_members?.full_name ?? 'Unassigned';
  const recipient = task.care_recipient_id ? getRecipientName(task.care_recipient_id) : '—';
  const strike = task.status === 'completed' ? 'text-decoration:line-through;color:#9ca3af;' : '';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;${strike}">
      <div style="font-weight:bold;">${task.title}</div>
      <span class="badge" style="background:${pColor}20;color:${pColor};">${task.priority ?? 'medium'}</span>
    </div>
    ${task.description ? `<div style="font-size:13px;color:#555;margin-top:4px;">${task.description}</div>` : ''}
    <div style="font-size:12px;color:#888;margin-top:4px;">
      For: ${recipient} &nbsp;|&nbsp; Due: ${due} &nbsp;|&nbsp; Assigned: ${assignee}
      &nbsp;|&nbsp; Status: ${(task.status ?? 'pending').replace(/_/g, ' ')}
    </div>
    ${task.notes ? `<div style="font-size:12px;font-style:italic;margin-top:4px;">Completion notes: ${task.notes}</div>` : ''}
  </div>`;
}

function buildTaskSection(label: string, tasks: Task[], getRecipientName: (id: string) => string): string {
  if (tasks.length === 0) return '';
  return `<div class="section">
    <h2>${label} (${tasks.length})</h2>
    ${tasks.map(t => buildTaskCard(t, getRecipientName)).join('')}
  </div>`;
}

export function printTasks(
  tasks: Task[],
  getRecipientName: (id: string) => string,
): void {
  const active = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completed = tasks.filter(t => t.status === 'completed');
  const cancelled = tasks.filter(t => t.status === 'cancelled');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Tasks</title>
    ${buildPrintStyles('#0d9488')}
  </head><body>
    ${buildPrintHeader({ title: 'Tasks', meta: `${tasks.length} task(s)` })}
    ${buildTaskSection('Active & Pending', active, getRecipientName)}
    ${buildTaskSection('Completed', completed, getRecipientName)}
    ${buildTaskSection('Cancelled', cancelled, getRecipientName)}
    ${tasks.length === 0 ? '<p style="color:#888;">No tasks recorded.</p>' : ''}
    ${buildPrintFooter()}
  </body></html>`;

  printDocument(html);
}
