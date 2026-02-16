import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Plus, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpenses, useCareRecipients, usePermissions } from '@/hooks';
import { ReceiptForm } from '@/components/receipts/receipt-form';
import { ReceiptCard } from '@/components/receipts/receipt-card';
import { ExpenseSummary } from '@/components/receipts/expense-summary';
import ShareQRCode from '@/components/shared/ShareQRCode';

function getRecipientName(r) {
  return r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim();
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ReceiptsPage() {
  const [showForm, setShowForm] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { permissions } = usePermissions();

  const filters = {
    ...(recipientFilter !== 'all' && { careRecipientId: recipientFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: expenses = [], isLoading } = useExpenses(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  const { data: recipients = [] } = useCareRecipients();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Receipts & Expenses
            </h1>
            <p className="text-slate-500 mt-1">
              Track and manage care-related expenses
            </p>
          </div>
          {permissions.canEditRecords && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Receipt
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Recipient</Label>
            <Select value={recipientFilter} onValueChange={setRecipientFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients</SelectItem>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {getRecipientName(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">From</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">To</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mb-6">
              <ExpenseSummary expenses={expenses} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map((expense) => (
                <ReceiptCard
                  key={expense.id}
                  expense={expense}
                  careRecipients={recipients}
                />
              ))}
            </div>

            {expenses.length === 0 && (
              <Card className="p-12 text-center shadow-sm border border-slate-200 bg-white">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-slate-500">
                  No receipts found. Add your first receipt to get started.
                </p>
              </Card>
            )}
          </>
        )}

        <div className="mt-8 flex justify-center">
          <ShareQRCode />
        </div>
      </div>

      <ReceiptForm
        open={showForm}
        onOpenChange={setShowForm}
        careRecipients={recipients}
      />
    </div>
  );
}
