import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle } from 'lucide-react';
import type { ExportFormat } from '@/lib/export/export-config';
import type { DateRange } from './export-date-range';

interface ExportSummaryProps {
  selectedCount: number;
  selectedLabels: string[];
  format: ExportFormat;
  dateRange: DateRange;
  onExport: () => void;
  isExporting: boolean;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel (.xlsx)',
  pdf: 'PDF',
};

export function ExportSummary({
  selectedCount,
  selectedLabels,
  format,
  dateRange,
  onExport,
  isExporting,
}: ExportSummaryProps): JSX.Element {
  const hasSelection = selectedCount > 0;
  const hasDateRange = dateRange.startDate && dateRange.endDate;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Export Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSelection ? (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            Select at least one category to export.
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Categories ({selectedCount})
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Format</p>
                <p className="font-medium">
                  {FORMAT_LABELS[format]}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Date Range
                </p>
                <p className="font-medium">
                  {hasDateRange
                    ? `${dateRange.startDate} to ${dateRange.endDate}`
                    : 'All records'}
                </p>
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!hasSelection || isExporting}
          onClick={onExport}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
