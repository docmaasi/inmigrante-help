import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react';

const CATEGORY_LABELS = {
  medical: 'Medical',
  pharmacy: 'Pharmacy',
  equipment: 'Equipment',
  transportation: 'Transportation',
  other: 'Other',
};

function SummaryCard({ icon: Icon, iconBg, label, value }) {
  return (
    <Card className="shadow-sm border border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseSummary({ expenses }) {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const byCategory = {};
    for (const e of expenses) {
      const cat = e.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0 };
      byCategory[cat].count += 1;
      byCategory[cat].total += e.amount || 0;
    }

    const statusCounts = { pending: 0, approved: 0, reimbursed: 0 };
    for (const e of expenses) {
      const s = e.status || 'pending';
      if (s in statusCounts) statusCounts[s] += 1;
    }

    return { total, byCategory, statusCounts };
  }, [expenses]);

  const categoryEntries = Object.entries(stats.byCategory).sort(
    (a, b) => b[1].total - a[1].total
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={Receipt}
          iconBg="bg-teal-50 text-teal-600"
          label="Total Receipts"
          value={expenses.length}
        />
        <SummaryCard
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600"
          label="Total Amount"
          value={`$${stats.total.toFixed(2)}`}
        />
        <SummaryCard
          icon={Clock}
          iconBg="bg-yellow-50 text-yellow-600"
          label="Pending"
          value={stats.statusCounts.pending}
        />
        <SummaryCard
          icon={CheckCircle}
          iconBg="bg-blue-50 text-blue-600"
          label="Approved"
          value={stats.statusCounts.approved}
        />
      </div>

      {categoryEntries.length > 0 && (
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Category Breakdown
            </h3>
            <div className="space-y-2">
              {categoryEntries.map(([cat, data]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600">
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{data.count} items</span>
                    <span className="font-medium text-slate-900">
                      ${data.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
