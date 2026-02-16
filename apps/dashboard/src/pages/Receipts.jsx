import React, { useState, useMemo } from 'react';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Plus, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';
import { useExpenses, useCareRecipients, usePermissions } from '@/hooks';
import { ReceiptForm } from '@/components/receipts/receipt-form';
import { ReceiptCard } from '@/components/receipts/receipt-card';
import { ReceiptRow } from '@/components/receipts/receipt-row';
import { ExpenseSummary } from '@/components/receipts/expense-summary';
import ShareQRCode from '@/components/shared/ShareQRCode';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <Card className="p-12 text-center shadow-sm border border-slate-200 bg-white">
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Receipt className="w-10 h-10 text-teal-600" />
      </div>
      <p className="text-slate-500">{message}</p>
    </Card>
  );
}

function ReceiptList({ expenses, recipients, onSelectExpense }) {
  if (expenses.length === 0) return null;
  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ReceiptRow
          key={expense.id}
          expense={expense}
          careRecipients={recipients}
          onClick={() => onSelectExpense(expense)}
        />
      ))}
    </div>
  );
}

function Filters({
  recipients,
  recipientFilter,
  setRecipientFilter,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
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
  );
}

export function ReceiptsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { permissions } = usePermissions();

  if (!permissions.canViewExpenses) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center shadow-sm border border-slate-200 bg-white max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500">
            You don&apos;t have permission to view receipts and expenses.
            Contact your care team admin for access.
          </p>
        </Card>
      </div>
    );
  }

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

  const { recentExpenses, archivedExpenses } = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    const recent = [];
    const archived = [];
    for (const e of expenses) {
      const ts = new Date(e.date).getTime();
      if (ts >= cutoff) {
        recent.push(e);
      } else {
        archived.push(e);
      }
    }
    return { recentExpenses: recent, archivedExpenses: archived };
  }, [expenses]);

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

        <Filters
          recipients={recipients}
          recipientFilter={recipientFilter}
          setRecipientFilter={setRecipientFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">
                Recent ({recentExpenses.length})
              </TabsTrigger>
              <TabsTrigger value="archive">
                Archive ({archivedExpenses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <div className="mb-6">
                <ExpenseSummary expenses={recentExpenses} />
              </div>
              <ReceiptList
                expenses={recentExpenses}
                recipients={recipients}
                onSelectExpense={setSelectedExpense}
              />
              {recentExpenses.length === 0 && (
                <EmptyState message="No receipts in the last 30 days. Add your first receipt to get started." />
              )}
            </TabsContent>

            <TabsContent value="archive">
              <div className="mb-6">
                <ExpenseSummary expenses={archivedExpenses} />
              </div>
              <ReceiptList
                expenses={archivedExpenses}
                recipients={recipients}
                onSelectExpense={setSelectedExpense}
              />
              {archivedExpenses.length === 0 && (
                <EmptyState message="No archived receipts older than 30 days." />
              )}
            </TabsContent>
          </Tabs>
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

      {selectedExpense && (
        <ReceiptCard
          expense={selectedExpense}
          careRecipients={recipients}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  );
}
