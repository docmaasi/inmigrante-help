import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2 } from 'lucide-react';

export interface ExportProgress {
  isExporting: boolean;
  currentCategory: string;
  completedCount: number;
  totalCount: number;
  isDone: boolean;
}

interface ExportProgressDialogProps {
  progress: ExportProgress;
}

export function ExportProgressDialog({
  progress,
}: ExportProgressDialogProps): JSX.Element {
  const {
    isExporting,
    currentCategory,
    completedCount,
    totalCount,
    isDone,
  } = progress;

  const percent =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <Dialog open={isExporting}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            )}
            {isDone ? 'Export Complete' : 'Exporting Data...'}
          </DialogTitle>
          <DialogDescription>
            {isDone
              ? 'Your file has been downloaded.'
              : `Fetching ${currentCategory}...`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Progress value={percent} className="h-2" />
          <p className="text-xs text-slate-500 text-center">
            {completedCount} of {totalCount} categories
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
