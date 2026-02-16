import React from 'react';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_BADGES = {
  paid: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABELS = {
  paid: 'Paid',
  complete: 'Complete',
};

function getRecipientNames(recipients, expense) {
  const ids = expense.care_recipient_ids || [];
  if (ids.length === 0 && expense.care_recipient_id) {
    ids.push(expense.care_recipient_id);
  }
  return ids
    .map((id) => {
      const r = recipients.find((rec) => rec.id === id);
      if (!r) return 'Unknown';
      return (
        r.full_name ||
        `${r.first_name || ''} ${r.last_name || ''}`.trim()
      );
    })
    .join(', ') || 'Unknown';
}

export function ReceiptRow({ expense, careRecipients, onClick }) {
  const names = getRecipientNames(careRecipients, expense);
  const statusClass =
    STATUS_BADGES[expense.status] || STATUS_BADGES.paid;
  const statusLabel =
    STATUS_LABELS[expense.status] || expense.status;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3
        bg-white border border-slate-200 rounded-lg
        hover:bg-slate-50 transition-colors text-left"
    >
      <span className="flex-1 min-w-0 font-medium text-slate-900 truncate">
        {expense.title}
      </span>
      <span className="hidden md:block text-sm text-slate-500 truncate max-w-[140px]">
        {names}
      </span>
      <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
        ${expense.amount?.toFixed(2) || '0.00'}
      </span>
      <span className="hidden sm:block text-sm text-slate-500 whitespace-nowrap">
        {format(new Date(expense.date), 'MMM d, yyyy')}
      </span>
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusClass}`}
      >
        {statusLabel}
      </span>
      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </button>
  );
}
