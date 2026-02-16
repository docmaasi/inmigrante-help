import React from 'react';
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
import { DollarSign, Calendar, Loader2, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const PAYMENT_LABELS = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  insurance: 'Insurance',
  check: 'Check',
  other: 'Other',
};

export function SubmitterAndMeta({ expense }) {
  return (
    <>
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

      {expense.payment_method && (
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          {PAYMENT_LABELS[expense.payment_method] || expense.payment_method}
        </p>
      )}

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
    </>
  );
}

export function CardActions({
  expense,
  permissions,
  isAdmin,
  deleteExpense,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex gap-2">
      {permissions.canEditRecords && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
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
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
