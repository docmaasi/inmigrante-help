import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/shared/FileUpload';
import RecipientCheckboxList from '@/components/scheduling/RecipientCheckboxList';

const CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'complete', label: 'Complete' },
];

export function EditRecipientDisplay({ expense, careRecipients }) {
  const ids = expense.care_recipient_ids || [expense.care_recipient_id];
  const names = ids
    .map((id) => {
      const r = careRecipients.find((rec) => rec.id === id);
      return r
        ? r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim()
        : 'Unknown';
    })
    .join(', ');

  return (
    <div className="space-y-2">
      <Label>Care Recipient(s)</Label>
      <Input value={names} disabled />
    </div>
  );
}

export function RecipientSection({
  isEditing,
  expense,
  careRecipients,
  selectedIds,
  onChangeIds,
}) {
  if (isEditing) {
    return (
      <EditRecipientDisplay
        expense={expense}
        careRecipients={careRecipients}
      />
    );
  }
  return (
    <RecipientCheckboxList
      careRecipients={careRecipients}
      selectedIds={selectedIds}
      onChange={onChangeIds}
    />
  );
}

export function CategoryAndAmount({ formData, updateField }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => updateField('category', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {formData.category === 'other' && (
        <div className="space-y-2">
          <Label>Describe Category</Label>
          <Input
            value={formData.custom_category}
            onChange={(e) =>
              updateField('custom_category', e.target.value)
            }
            placeholder="e.g., Home Modifications"
          />
        </div>
      )}
    </>
  );
}

export function DateAndVendor({ formData, updateField }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Date *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => updateField('date', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Vendor</Label>
        <Input
          value={formData.vendor}
          onChange={(e) => updateField('vendor', e.target.value)}
          placeholder="Store or provider"
        />
      </div>
    </div>
  );
}

export function PaymentMethodSelect({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Payment Method</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function StatusSelect({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PhotoAndNotes({ formData, updateField }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Receipt Photo / PDF</Label>
        <FileUpload
          value={formData.photo_url}
          onChange={(url) => updateField('photo_url', url)}
          label="Upload Receipt"
        />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={2}
        />
      </div>
    </>
  );
}

export { CATEGORIES, PAYMENT_METHODS, STATUSES };
