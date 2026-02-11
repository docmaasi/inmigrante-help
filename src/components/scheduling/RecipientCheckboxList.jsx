import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function RecipientCheckboxList({
  careRecipients,
  selectedIds,
  onChange,
}) {
  const toggleRecipient = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((rid) => rid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Care Recipients *</Label>
      <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
        {careRecipients.map((cr) => (
          <label
            key={cr.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1"
          >
            <Checkbox
              checked={selectedIds.includes(cr.id)}
              onCheckedChange={() => toggleRecipient(cr.id)}
            />
            <span className="text-sm">{cr.full_name}</span>
          </label>
        ))}
        {careRecipients.length === 0 && (
          <p className="text-xs text-slate-500">No care recipients found</p>
        )}
      </div>
    </div>
  );
}
