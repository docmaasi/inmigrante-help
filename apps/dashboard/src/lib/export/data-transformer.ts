/**
 * Transforms raw Supabase data into flat, export-friendly rows.
 * - Arrays become comma-separated strings
 * - Objects become JSON strings
 * - Dates stay as ISO strings
 * - null/undefined become empty strings
 */

type RawRow = Record<string, unknown>;

export function flattenRow(row: RawRow): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    flat[key] = formatCellValue(value);
  }
  return flat;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function transformRows(
  rows: RawRow[]
): { headers: string[]; data: Record<string, string>[] } {
  if (rows.length === 0) return { headers: [], data: [] };

  const data = rows.map(flattenRow);
  const headers = Object.keys(data[0]);
  return { headers, data };
}

export function formatDateForFilename(): string {
  return new Date().toISOString().split('T')[0];
}
