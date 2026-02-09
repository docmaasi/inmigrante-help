import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDriveDownload } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSuperAdminRole } from '@/components/ui/role-badge';
import { EXPORT_CATEGORIES } from '@/lib/export/export-config';
import type { ExportFormat } from '@/lib/export/export-config';
import type { DateRange } from '@/components/admin/export/export-date-range';
import { ExportCategorySelector } from '@/components/admin/export/export-category-selector';
import { ExportDateRange } from '@/components/admin/export/export-date-range';
import { ExportFormatSelector } from '@/components/admin/export/export-format-selector';
import { ExportProgressDialog } from '@/components/admin/export/export-progress-dialog';
import { ExportSummary } from '@/components/admin/export/export-summary';
import { useDataExport } from '@/hooks/admin/use-data-export';

export function AdminExport(): JSX.Element {
  const { profile } = useAuth();
  const isSuperAdmin = isSuperAdminRole(
    (profile?.role as string) ?? 'viewer'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });

  const { progress, runExport } = useDataExport();

  const selectedLabels = useMemo(
    () =>
      EXPORT_CATEGORIES.filter((c) =>
        selectedIds.includes(c.id)
      ).map((c) => c.label),
    [selectedIds]
  );

  function handleExport(): void {
    runExport(selectedIds, format, dateRange);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <HardDriveDownload className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Data Export</h1>
                <p className="text-indigo-100 text-sm font-normal">
                  Export system data for backup, reporting, or analysis
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: selectors */}
          <div className="lg:col-span-2 space-y-6">
            <ExportCategorySelector
              categories={EXPORT_CATEGORIES}
              selected={selectedIds}
              onSelectionChange={setSelectedIds}
              isSuperAdmin={isSuperAdmin}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExportDateRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <ExportFormatSelector
                format={format}
                onFormatChange={setFormat}
              />
            </div>
          </div>

          {/* Right column: summary + export button */}
          <div className="space-y-6">
            <ExportSummary
              selectedCount={selectedIds.length}
              selectedLabels={selectedLabels}
              format={format}
              dateRange={dateRange}
              onExport={handleExport}
              isExporting={progress.isExporting}
            />
          </div>
        </div>

        {/* Progress dialog (modal) */}
        <ExportProgressDialog progress={progress} />
      </div>
    </div>
  );
}
