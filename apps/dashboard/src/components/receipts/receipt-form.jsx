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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCreateExpense, useUpdateExpense } from '@/hooks';
import { usePermissions } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { logAdminAction } from '@/services/admin-activity-logger';
import {
  RecipientSection,
  CategoryAndAmount,
  DateAndVendor,
  PaymentMethodSelect,
  StatusSelect,
  PhotoAndNotes,
} from './receipt-form-fields';

export function ReceiptForm({
  open,
  onOpenChange,
  expense,
  careRecipients,
}) {
  const isEditing = !!expense;
  const { isAdmin } = usePermissions();
  const { profile } = useAuth();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const [selectedRecipientIds, setSelectedRecipientIds] = useState(
    expense?.care_recipient_ids?.length
      ? expense.care_recipient_ids
      : expense?.care_recipient_id
        ? [expense.care_recipient_id]
        : []
  );
  const [formData, setFormData] = useState({
    title: expense?.title ?? '',
    category: expense?.category ?? 'other',
    custom_category: expense?.custom_category ?? '',
    amount: expense?.amount?.toString() ?? '',
    date: expense?.date
      ? format(new Date(expense.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    vendor: expense?.vendor ?? '',
    photo_url: expense?.photo_url ?? '',
    notes: expense?.notes ?? '',
    status: expense?.status ?? 'paid',
    payment_method: expense?.payment_method ?? '',
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
      custom_category:
        formData.category === 'other'
          ? formData.custom_category || null
          : null,
      amount: parseFloat(formData.amount) || 0,
      date: formData.date,
      vendor: formData.vendor || null,
      photo_url: formData.photo_url || null,
      notes: formData.notes || null,
      payment_method: formData.payment_method || null,
    };

    try {
      if (isEditing) {
        const updateData = {
          ...baseData,
          id: expense.id,
          care_recipient_ids: selectedRecipientIds,
        };
        if (isAdmin) updateData.status = formData.status;
        await updateExpense.mutateAsync(updateData);
        await logAdminAction({
          action: 'expense_updated',
          targetType: 'expense',
          targetId: expense.id,
          details: { title: formData.title },
        });
        toast.success('Receipt updated');
      } else {
        await createExpense.mutateAsync({
          ...baseData,
          care_recipient_ids: selectedRecipientIds,
        });
        await logAdminAction({
          action: 'expense_created',
          targetType: 'expense',
          details: {
            title: formData.title,
            recipientCount: selectedRecipientIds.length,
          },
        });
        toast.success('Receipt added');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save receipt');
    }
  };

  const submitterName = profile?.full_name || profile?.email || 'You';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Receipt' : 'Add Receipt'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Submitted By</Label>
            <Input value={submitterName} disabled />
          </div>

          <RecipientSection
            isEditing={isEditing}
            expense={expense}
            careRecipients={careRecipients}
            selectedIds={selectedRecipientIds}
            onChangeIds={setSelectedRecipientIds}
          />

          <div className="space-y-2">
            <Label>Title / Description *</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Prescription refill"
            />
          </div>

          <CategoryAndAmount
            formData={formData}
            updateField={updateField}
          />
          <DateAndVendor
            formData={formData}
            updateField={updateField}
          />
          <PaymentMethodSelect
            value={formData.payment_method}
            onChange={(v) => updateField('payment_method', v)}
          />

          {isEditing && isAdmin && (
            <StatusSelect
              value={formData.status}
              onChange={(v) => updateField('status', v)}
            />
          )}

          <PhotoAndNotes
            formData={formData}
            updateField={updateField}
          />

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
