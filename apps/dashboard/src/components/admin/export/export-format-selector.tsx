import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import type { ExportFormat } from '@/lib/export/export-config';

interface ExportFormatSelectorProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

const FORMAT_OPTIONS = [
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'Comma-separated values. Opens in Excel, Sheets, etc.',
    icon: FileText,
  },
  {
    value: 'excel' as const,
    label: 'Excel (.xlsx)',
    description: 'Native Excel workbook with one sheet per category.',
    icon: FileSpreadsheet,
  },
  {
    value: 'pdf' as const,
    label: 'PDF',
    description: 'Printable document with formatted tables.',
    icon: FileDown,
  },
] as const;

export function ExportFormatSelector({
  format,
  onFormatChange,
}: ExportFormatSelectorProps): JSX.Element {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Export Format</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={format}
          onValueChange={(v) => onFormatChange(v as ExportFormat)}
          className="space-y-2"
        >
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = format === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer
                  ${isSelected ? 'border-purple-200 bg-purple-50' : 'border-slate-200 hover:bg-slate-50'}
                `}
              >
                <RadioGroupItem value={opt.value} />
                <Icon
                  className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}
                />
                <div className="flex-1">
                  <Label className="text-sm font-medium cursor-pointer">
                    {opt.label}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {opt.description}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
