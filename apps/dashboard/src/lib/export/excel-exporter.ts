/**
 * Generates an Excel (.xlsx) file using the SheetJS library
 * and triggers a download.
 */
import * as XLSX from 'xlsx';

interface SheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, string>[];
}

export function exportToExcel(
  sheets: SheetData[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const wsData = [
      sheet.headers,
      ...sheet.rows.map((row) =>
        sheet.headers.map((h) => row[h] ?? '')
      ),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const safeName = sheet.sheetName.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  }

  XLSX.writeFile(workbook, filename);
}
