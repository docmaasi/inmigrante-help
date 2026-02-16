import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileUpload } from '@/components/shared/FileUpload';
import RecipientCheckboxList from '@/components/scheduling/RecipientCheckboxList';
import { useCreateExpense, useUpdateExpense } from '@/hooks';
import { usePermissions } from '@/hooks';
import { logAdminAction } from '@/services/admin-activity-logger';

const CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

export function ReceiptForm({
  open,
  onOpenChange,
  expense,
  careRecipients,
}) {
  const isEditing = !!expense;
  const { isAdmin } = usePermissions();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const [selectedRecipientIds, setSelectedRecipientIds] = useState(
    expense?.care_recipient_id ? [expense.care_recipient_id] : []
  );
  const [formData, setFormData] = useState({
    title: expense?.title ?? '',
    category: expense?.category ?? 'other',
    amount: expense?.amount?.toString() ?? '',
    date: expense?.date
      ? format(new Date(expense.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    vendor: expense?.vendor ?? '',
    photo_url: expense?.photo_url ?? '',
    notes: expense?.notes ?? '',
    status: expense?.status ?? 'pending',
  });

  const isPending = createExpense.isPending || updateExpense.isPending;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }
    if (!formData.title || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    const baseData = {
      title: formData.title,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
      date: formData.date,
      vendor: formData.vendor || null,
      photo_url: formData.photo_url || null,
      notes: formData.notes || null,
    };

    try {
      if (isEditing) {
        const updateData = { ...baseData, id: expense.id };
        if (isAdmin) {
          updateData.status = formData.status;
        }
        await updateExpense.mutateAsync(updateData);
        await logAdminAction({
          action: 'expense_updated',
          targetType: 'expense',
          targetId: expense.id,
          details: { title: formData.title },
        });
        toast.success('Receipt updated');
      } else {
        for (const recipientId of selectedRecipientIds) {
          await createExpense.mutateAsync({
            ...baseData,
            care_recipient_id: recipientId,
          });
        }
        await logAdminAction({
          action: 'expense_created',
          targetType: 'expense',
          details: {
            title: formData.title,
            recipientCount: selectedRecipientIds.length,
          },
        });
        toast.success(
          selectedRecipientIds.length > 1
            ? `${selectedRecipientIds.length} receipts added`
            : 'Receipt added'
        );
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save receipt');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Receipt' : 'Add Receipt'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <Label>Care Recipient</Label>
              <Input
                value={
                  careRecipients.find(
                    (r) => r.id === expense.care_recipient_id
                  )
                    ? `${careRecipients.find((r) => r.id === expense.care_recipient_id).first_name} ${careRecipients.find((r) => r.id === expense.care_recipient_id).last_name}`
                    : 'Unknown'
                }
                disabled
              />
            </div>
          ) : (
            <RecipientCheckboxList
              careRecipients={careRecipients}
              selectedIds={selectedRecipientIds}
              onChange={setSelectedRecipientIds}
            />
          )}

          <div className="space-y-2">
            <Label>Title / Description *</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Prescription refill"
            />
          </div>

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

          {isEditing && isAdmin && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => updateField('status', v)}
              >
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
          )}

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

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update'
              ) : (
                'Add Receipt'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
