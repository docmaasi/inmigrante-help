import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, X } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface ExportDateRangeProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
] as const;

export function ExportDateRange({
  dateRange,
  onDateRangeChange,
}: ExportDateRangeProps): JSX.Element {
  const today = new Date().toISOString().split('T')[0];

  function handlePreset(days: number): void {
    onDateRangeChange({
      startDate: daysAgo(days),
      endDate: today,
    });
  }

  function handleClear(): void {
    onDateRangeChange({ startDate: '', endDate: '' });
  }

  const hasRange = dateRange.startDate || dateRange.endDate;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Date Range
          </CardTitle>
          {hasRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500">
          Optional. Leave empty to export all records.
        </p>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <Button
              key={p.days}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handlePreset(p.days)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-500">
              Start Date
            </Label>
            <Input
              type="date"
              value={dateRange.startDate}
              max={dateRange.endDate || today}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  startDate: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">
              End Date
            </Label>
            <Input
              type="date"
              value={dateRange.endDate}
              min={dateRange.startDate}
              max={today}
              onChange={(e) =>
                onDateRangeChange({
                  ...dateRange,
                  endDate: e.target.value,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
