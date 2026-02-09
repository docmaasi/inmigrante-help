/**
 * Generates a tabular PDF using jsPDF (already installed).
 * Creates one page-section per data category with a simple table layout.
 */
import { jsPDF } from 'jspdf';

interface PdfSheetData {
  title: string;
  headers: string[];
  rows: Record<string, string>[];
}

const MARGIN = 14;
const ROW_HEIGHT = 7;
const HEADER_HEIGHT = 10;
const FONT_SIZE = 8;
const HEADER_FONT_SIZE = 9;
const TITLE_FONT_SIZE = 12;
const MAX_COL_WIDTH = 40;

export function exportToPdf(
  sheets: PdfSheetData[],
  filename: string
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  sheets.forEach((sheet, sheetIndex) => {
    if (sheetIndex > 0) doc.addPage();

    let y = MARGIN;
    doc.setFontSize(TITLE_FONT_SIZE);
    doc.setFont('helvetica', 'bold');
    doc.text(sheet.title, MARGIN, y);
    y += 8;

    doc.setFontSize(FONT_SIZE);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${sheet.rows.length} record(s) exported`,
      MARGIN,
      y
    );
    y += 8;

    const visibleHeaders = sheet.headers.slice(0, 8);
    const colWidth = Math.min(
      MAX_COL_WIDTH,
      (pageWidth - MARGIN * 2) / visibleHeaders.length
    );

    drawHeaderRow(doc, visibleHeaders, colWidth, y);
    y += HEADER_HEIGHT;

    for (const row of sheet.rows) {
      if (y + ROW_HEIGHT > pageHeight - MARGIN) {
        doc.addPage();
        y = MARGIN;
        drawHeaderRow(doc, visibleHeaders, colWidth, y);
        y += HEADER_HEIGHT;
      }
      drawDataRow(doc, visibleHeaders, row, colWidth, y);
      y += ROW_HEIGHT;
    }
  });

  doc.save(filename);
}

function drawHeaderRow(
  doc: jsPDF,
  headers: string[],
  colWidth: number,
  y: number
): void {
  doc.setFillColor(79, 70, 229);
  doc.rect(
    MARGIN,
    y - 4,
    colWidth * headers.length,
    HEADER_HEIGHT,
    'F'
  );
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(HEADER_FONT_SIZE);
  doc.setFont('helvetica', 'bold');

  headers.forEach((header, i) => {
    const x = MARGIN + i * colWidth + 2;
    doc.text(truncateText(header, colWidth - 4), x, y + 2);
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}

function drawDataRow(
  doc: jsPDF,
  headers: string[],
  row: Record<string, string>,
  colWidth: number,
  y: number
): void {
  doc.setFontSize(FONT_SIZE);
  headers.forEach((header, i) => {
    const x = MARGIN + i * colWidth + 2;
    const value = row[header] ?? '';
    doc.text(truncateText(value, colWidth - 4), x, y + 2);
  });
}

function truncateText(text: string, maxWidth: number): string {
  const approxChars = Math.floor(maxWidth / 1.8);
  if (text.length <= approxChars) return text;
  return text.slice(0, approxChars - 2) + '..';
}
