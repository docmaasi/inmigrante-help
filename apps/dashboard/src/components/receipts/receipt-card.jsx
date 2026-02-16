import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteExpense, useUpdateExpense, usePermissions, useSignedUrl } from '@/hooks';
import { logAdminAction } from '@/services/admin-activity-logger';
import { ReceiptForm } from './receipt-form';
import { SubmitterAndMeta, CardActions } from './receipt-card-parts';

const CATEGORY_COLORS = {
  medical: 'bg-red-100 text-red-800',
  pharmacy: 'bg-purple-100 text-purple-800',
  equipment: 'bg-blue-100 text-blue-800',
  transportation: 'bg-green-100 text-green-800',
  other: 'bg-slate-100 text-slate-800',
};

const STATUS_BADGES = {
  paid: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-emerald-100 text-emerald-800',
};

const STATUS_TOOLTIPS = {
  paid: 'Payment recorded',
  complete: 'Fully processed',
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
      return r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim();
    })
    .join(', ') || 'Unknown';
}

function isPdfPath(val) {
  return typeof val === 'string' && val.toLowerCase().endsWith('.pdf');
}

export function ReceiptCard({ expense, careRecipients, onClose }) {
  const [showEdit, setShowEdit] = useState(false);
  const { permissions, isAdmin } = usePermissions();
  const deleteExpense = useDeleteExpense();
  const updateExpense = useUpdateExpense();
  const photoUrl = useSignedUrl(expense.photo_url);

  const handleDelete = async () => {
    try {
      await deleteExpense.mutateAsync(expense.id);
      await logAdminAction({
        action: 'expense_deleted',
        targetType: 'expense',
        targetId: expense.id,
        details: { title: expense.title, amount: expense.amount },
      });
      toast.success('Receipt deleted');
      onClose?.();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        status: newStatus,
      });
      toast.success(`Status changed to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const categoryLabel =
    expense.category === 'other' && expense.custom_category
      ? `Other: ${expense.custom_category}`
      : expense.category;

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose?.(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{expense.title}</DialogTitle>
          </DialogHeader>

          <ReceiptPhoto photoUrl={photoUrl} rawPath={expense.photo_url} />

          <div className="flex gap-1 mb-2">
            <StatusBadge
              status={expense.status}
              isAdmin={isAdmin}
              onStatusChange={handleStatusChange}
            />
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}`}
            >
              {categoryLabel}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-1">
            {getRecipientNames(careRecipients, expense)}
          </p>

          <SubmitterAndMeta expense={expense} />

          <CardActions
            expense={expense}
            permissions={permissions}
            isAdmin={isAdmin}
            deleteExpense={deleteExpense}
            onEdit={() => setShowEdit(true)}
            onDelete={handleDelete}
          />
        </DialogContent>
      </Dialog>

      {showEdit && (
        <ReceiptForm
          open={showEdit}
          onOpenChange={setShowEdit}
          expense={expense}
          careRecipients={careRecipients}
        />
      )}
    </>
  );
}

function ReceiptPhoto({ photoUrl, rawPath }) {
  if (!rawPath) return null;
  if (isPdfPath(rawPath)) {
    return (
      <a
        href={photoUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-3 hover:bg-slate-100"
      >
        <FileText className="w-6 h-6 text-red-500" />
        <span className="text-sm text-teal-600 underline">View PDF</span>
      </a>
    );
  }
  return (
    <img
      src={photoUrl || ''}
      alt="Receipt"
      className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer"
      onClick={() => photoUrl && window.open(photoUrl, '_blank')}
    />
  );
}


function StatusBadge({ status, isAdmin, onStatusChange }) {
  if (isAdmin) {
    return (
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          className={`h-auto px-2 py-0.5 rounded text-xs font-medium border-0 ${STATUS_BADGES[status] || STATUS_BADGES.paid}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="complete">Complete</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium cursor-help ${STATUS_BADGES[status] || STATUS_BADGES.paid}`}
          >
            {status}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{STATUS_TOOLTIPS[status] || 'Unknown status'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
