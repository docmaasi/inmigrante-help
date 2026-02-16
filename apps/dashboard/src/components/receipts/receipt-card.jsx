import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DollarSign, Calendar, Loader2, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useDeleteExpense, usePermissions } from '@/hooks';
import { logAdminAction } from '@/services/admin-activity-logger';
import { ReceiptForm } from './receipt-form';

const CATEGORY_COLORS = {
  medical: 'bg-red-100 text-red-800',
  pharmacy: 'bg-purple-100 text-purple-800',
  equipment: 'bg-blue-100 text-blue-800',
  transportation: 'bg-green-100 text-green-800',
  other: 'bg-slate-100 text-slate-800',
};

const STATUS_BADGES = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  reimbursed: 'bg-emerald-100 text-emerald-800',
};

function isPdfUrl(url) {
  return typeof url === 'string' && url.toLowerCase().endsWith('.pdf');
}

function getRecipientName(recipients, id) {
  const r = recipients.find((rec) => rec.id === id);
  if (!r) return 'Unknown';
  return r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim();
}

export function ReceiptCard({ expense, careRecipients }) {
  const [showEdit, setShowEdit] = useState(false);
  const { permissions, isAdmin } = usePermissions();
  const deleteExpense = useDeleteExpense();

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
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow shadow-sm border border-slate-200 bg-white">
        <CardContent className="p-4">
          {expense.photo_url && (
            isPdfUrl(expense.photo_url) ? (
              <a
                href={expense.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-3 hover:bg-slate-100"
              >
                <FileText className="w-6 h-6 text-red-500" />
                <span className="text-sm text-teal-600 underline">
                  View PDF
                </span>
              </a>
            ) : (
              <img
                src={expense.photo_url}
                alt="Receipt"
                className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer"
                onClick={() => window.open(expense.photo_url, '_blank')}
              />
            )
          )}

          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-900 flex-1 mr-2">
              {expense.title}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGES[expense.status] || STATUS_BADGES.pending}`}
              >
                {expense.status}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}`}
              >
                {expense.category}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-1">
            {getRecipientName(careRecipients, expense.care_recipient_id)}
          </p>

          {expense.submitted_by_name && (
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              Submitted by: {expense.submitted_by_name}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {expense.amount?.toFixed(2) || '0.00'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(expense.date), 'MMM d, yyyy')}
            </span>
          </div>

          {expense.vendor && (
            <p className="text-xs text-slate-500 mb-2">
              Vendor: {expense.vendor}
            </p>
          )}
          {expense.notes && (
            <p className="text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded">
              {expense.notes}
            </p>
          )}

          <div className="flex gap-2">
            {permissions.canEditRecords && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEdit(true)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteExpense.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleteExpense.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{expense.title}
                      &quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

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
