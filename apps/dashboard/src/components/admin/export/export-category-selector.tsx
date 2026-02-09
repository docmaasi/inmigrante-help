import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import type { ExportCategory } from '@/lib/export/export-config';

interface ExportCategorySelectorProps {
  categories: ExportCategory[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  isSuperAdmin: boolean;
}

export function ExportCategorySelector({
  categories,
  selected,
  onSelectionChange,
  isSuperAdmin,
}: ExportCategorySelectorProps): JSX.Element {
  const available = categories.filter(
    (c) => !c.superAdminOnly || isSuperAdmin
  );

  function handleToggle(id: string, checked: boolean): void {
    if (checked) {
      onSelectionChange([...selected, id]);
    } else {
      onSelectionChange(selected.filter((s) => s !== id));
    }
  }

  function handleSelectAll(): void {
    onSelectionChange(available.map((c) => c.id));
  }

  function handleClearAll(): void {
    onSelectionChange([]);
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Data Categories
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {categories.map((category) => {
            const isLocked =
              category.superAdminOnly && !isSuperAdmin;
            const isChecked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                className={`flex items-center gap-3 rounded-md border px-3 py-2
                  ${isLocked ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : ''}
                  ${isChecked && !isLocked ? 'border-purple-200 bg-purple-50' : 'border-slate-200'}
                  ${!isLocked ? 'cursor-pointer hover:bg-slate-50' : ''}
                `}
              >
                <Checkbox
                  checked={isChecked}
                  disabled={isLocked}
                  onCheckedChange={(checked) =>
                    handleToggle(
                      category.id,
                      checked === true
                    )
                  }
                />
                <Label
                  className={`flex-1 text-sm ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {category.label}
                </Label>
                {category.superAdminOnly && (
                  <Badge
                    variant="outline"
                    className="text-[10px] gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Super Admin
                  </Badge>
                )}
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
