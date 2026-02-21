import { printDocument, buildPrintStyles, buildPrintHeader, buildPrintFooter } from '@/lib/print-utils';

interface NoteProfile { full_name?: string; }

interface CareNote {
  id: string;
  title?: string;
  content: string;
  category?: string;
  mood?: string;
  created_at: string;
  care_recipient_id?: string;
  is_private?: boolean;
  profiles?: NoteProfile;
}

function buildNoteCard(note: CareNote, getRecipientName: (id: string) => string): string {
  const date = new Date(note.created_at).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
  });
  const category = (note.category ?? 'other').replace(/_/g, ' ');
  const recipient = note.care_recipient_id ? getRecipientName(note.care_recipient_id) : '';
  const meta = [
    recipient && `For: ${recipient}`,
    note.mood && `Mood: ${note.mood}`,
    note.profiles?.full_name && `By: ${note.profiles.full_name}`,
    note.is_private ? '🔒 Private' : null,
  ].filter(Boolean).join(' &nbsp;|&nbsp; ');

  return `<div class="card" style="border-left-color:#0d9488;">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <div>
        ${note.title ? `<span style="font-weight:bold;font-size:15px;">${note.title}</span>` : ''}
        <span class="badge" style="background:#e0f2fe;color:#0369a1;margin-left:${note.title ? '6px' : '0'};">${category}</span>
      </div>
      <span style="font-size:12px;color:#888;">${date}</span>
    </div>
    ${meta ? `<div style="font-size:12px;color:#888;margin-bottom:6px;">${meta}</div>` : ''}
    <div style="font-size:14px;white-space:pre-wrap;">${note.content}</div>
  </div>`;
}

export function printCareNotes(
  notes: CareNote[],
  getRecipientName: (id: string) => string,
): void {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Care Notes</title>
    ${buildPrintStyles('#0d9488')}
  </head><body>
    ${buildPrintHeader({ title: 'Care Notes', meta: `${notes.length} note(s)` })}
    <div class="section">
      ${notes.map(n => buildNoteCard(n, getRecipientName)).join('')}
      ${notes.length === 0 ? '<p style="color:#888;">No care notes recorded.</p>' : ''}
    </div>
    ${buildPrintFooter()}
  </body></html>`;

  printDocument(html);
}
