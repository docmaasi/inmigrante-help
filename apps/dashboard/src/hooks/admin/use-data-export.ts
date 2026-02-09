import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/services/admin-activity-logger';
import {
  EXPORT_CATEGORIES,
  type ExportFormat,
  type ExportCategory,
} from '@/lib/export/export-config';
import { transformRows, formatDateForFilename } from '@/lib/export/data-transformer';
import { exportToCsv } from '@/lib/export/csv-exporter';
import { exportToExcel } from '@/lib/export/excel-exporter';
import { exportToPdf } from '@/lib/export/pdf-exporter';
import type { ExportProgress } from '@/components/admin/export/export-progress-dialog';
import type { DateRange } from '@/components/admin/export/export-date-range';

interface CategoryResult {
  category: ExportCategory;
  headers: string[];
  rows: Record<string, string>[];
  count: number;
}

interface UseDataExportReturn {
  progress: ExportProgress;
  runExport: (
    selectedIds: string[],
    format: ExportFormat,
    dateRange: DateRange
  ) => Promise<void>;
}

const INITIAL_PROGRESS: ExportProgress = {
  isExporting: false,
  currentCategory: '',
  completedCount: 0,
  totalCount: 0,
  isDone: false,
};

export function useDataExport(): UseDataExportReturn {
  const [progress, setProgress] =
    useState<ExportProgress>(INITIAL_PROGRESS);

  const runExport = useCallback(
    async (
      selectedIds: string[],
      format: ExportFormat,
      dateRange: DateRange
    ): Promise<void> => {
      const categories = EXPORT_CATEGORIES.filter((c) =>
        selectedIds.includes(c.id)
      );

      setProgress({
        isExporting: true,
        currentCategory: categories[0]?.label ?? '',
        completedCount: 0,
        totalCount: categories.length,
        isDone: false,
      });

      const results: CategoryResult[] = [];

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        setProgress((prev) => ({
          ...prev,
          currentCategory: cat.label,
          completedCount: i,
        }));

        const result = await fetchCategoryData(cat, dateRange);
        results.push(result);
      }

      setProgress((prev) => ({
        ...prev,
        completedCount: categories.length,
        currentCategory: 'Generating file...',
      }));

      const datestamp = formatDateForFilename();
      generateFile(results, format, datestamp);

      await logExportAction(results, format, dateRange);

      setProgress((prev) => ({
        ...prev,
        isDone: true,
        currentCategory: '',
      }));

      setTimeout(() => {
        setProgress(INITIAL_PROGRESS);
      }, 2000);
    },
    []
  );

  return { progress, runExport };
}

async function fetchCategoryData(
  category: ExportCategory,
  dateRange: DateRange
): Promise<CategoryResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from(category.table) as any).select('*');

  if (dateRange.startDate) {
    query = query.gte(
      category.dateField,
      `${dateRange.startDate}T00:00:00`
    );
  }
  if (dateRange.endDate) {
    query = query.lte(
      category.dateField,
      `${dateRange.endDate}T23:59:59`
    );
  }

  query = query.order(category.dateField, { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error(
      `Export fetch error for ${category.table}:`,
      error.message
    );
    return {
      category,
      headers: [],
      rows: [],
      count: 0,
    };
  }

  const { headers, data: rows } = transformRows(data ?? []);
  return { category, headers, rows, count: rows.length };
}

function generateFile(
  results: CategoryResult[],
  format: ExportFormat,
  datestamp: string
): void {
  const filename = `familycare-export-${datestamp}`;

  if (format === 'csv') {
    generateCsvExport(results, filename);
  } else if (format === 'excel') {
    generateExcelExport(results, filename);
  } else {
    generatePdfExport(results, filename);
  }
}

function generateCsvExport(
  results: CategoryResult[],
  filename: string
): void {
  if (results.length === 1) {
    const r = results[0];
    exportToCsv(r.headers, r.rows, `${filename}-${r.category.id}.csv`);
    return;
  }
  for (const r of results) {
    if (r.count > 0) {
      exportToCsv(
        r.headers,
        r.rows,
        `${filename}-${r.category.id}.csv`
      );
    }
  }
}

function generateExcelExport(
  results: CategoryResult[],
  filename: string
): void {
  const sheets = results
    .filter((r) => r.count > 0)
    .map((r) => ({
      sheetName: r.category.label,
      headers: r.headers,
      rows: r.rows,
    }));

  if (sheets.length === 0) return;
  exportToExcel(sheets, `${filename}.xlsx`);
}

function generatePdfExport(
  results: CategoryResult[],
  filename: string
): void {
  const sheets = results
    .filter((r) => r.count > 0)
    .map((r) => ({
      title: r.category.label,
      headers: r.headers,
      rows: r.rows,
    }));

  if (sheets.length === 0) return;
  exportToPdf(sheets, `${filename}.pdf`);
}

async function logExportAction(
  results: CategoryResult[],
  format: ExportFormat,
  dateRange: DateRange
): Promise<void> {
  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.category.id] = r.count;
  }

  await logAdminAction({
    action: 'data_exported',
    targetType: 'setting',
    details: {
      categories: results.map((r) => r.category.id),
      format,
      dateRange: dateRange.startDate
        ? `${dateRange.startDate} to ${dateRange.endDate}`
        : 'all',
      recordCounts: counts,
      totalRecords: results.reduce(
        (sum, r) => sum + r.count,
        0
      ),
    },
  });
}
