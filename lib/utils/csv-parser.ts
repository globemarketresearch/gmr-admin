import type { DataSource, DataSeries } from '@/lib/types/chart-generator';
import { DEFAULT_CHART_COLORS, CHART_CONSTRAINTS } from '@/lib/config/chart-generator';

export interface CSVParseResult {
  success: boolean;
  data?: DataSource;
  error?: string;
  warnings?: string[];
}

export function parseCSV(csvContent: string): CSVParseResult {
  const warnings: string[] = [];

  try {
    // Split by lines and filter empty lines
    const lines = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV must have at least a header row and one data row',
      };
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);

    if (headers.length < 2) {
      return {
        success: false,
        error: 'CSV must have at least one category column and one data series column',
      };
    }

    // First column is the category/label column
    const seriesNames = headers.slice(1);

    // Check series count limit
    if (seriesNames.length > CHART_CONSTRAINTS.MAX_SERIES) {
      return {
        success: false,
        error: `Too many data series. Maximum allowed: ${CHART_CONSTRAINTS.MAX_SERIES}`,
      };
    }

    // Parse data rows
    const dataRows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length > 0) {
        dataRows.push(row);
      }
    }

    if (dataRows.length === 0) {
      return {
        success: false,
        error: 'CSV has no data rows',
      };
    }

    // Check row count limit
    if (dataRows.length > CHART_CONSTRAINTS.MAX_ROWS) {
      warnings.push(
        `CSV has ${dataRows.length} rows. Only the first ${CHART_CONSTRAINTS.MAX_ROWS} will be imported.`
      );
    }

    // Extract labels from first column
    const labels: string[] = [];
    const seriesData: number[][] = Array(seriesNames.length)
      .fill(null)
      .map(() => []);

    const limitedRows = dataRows.slice(0, CHART_CONSTRAINTS.MAX_ROWS);

    for (let i = 0; i < limitedRows.length; i++) {
      const row = limitedRows[i];

      // Get category label
      const label = row[0]?.trim() || `Row ${i + 1}`;
      labels.push(label);

      // Parse numeric values for each series
      for (let seriesIndex = 0; seriesIndex < seriesNames.length; seriesIndex++) {
        const cellValue = row[seriesIndex + 1];
        const numValue = parseFloat(cellValue);

        if (isNaN(numValue)) {
          warnings.push(
            `Row ${i + 1}, column "${seriesNames[seriesIndex]}": "${cellValue}" is not a valid number. Using 0.`
          );
          seriesData[seriesIndex].push(0);
        } else {
          seriesData[seriesIndex].push(numValue);
        }
      }
    }

    // Build DataSource
    const series: DataSeries[] = seriesNames.map((name, index) => ({
      id: `series-${Date.now()}-${index}`,
      name: name.trim() || `Series ${index + 1}`,
      color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
      values: seriesData[index],
    }));

    const dataSource: DataSource = {
      labels,
      series,
    };

    return {
      success: true,
      data: dataSource,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse CSV',
    };
  }
}

/**
 * Parse a single CSV line, handling quoted fields properly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Export DataSource to CSV format
 */
export function exportToCSV(dataSource: DataSource, filename?: string): void {
  const rows: string[] = [];

  // Header row
  const headers = ['Category', ...dataSource.series.map(s => s.name)];
  rows.push(headers.map(escapeCSVField).join(','));

  // Data rows
  for (let i = 0; i < dataSource.labels.length; i++) {
    const row = [dataSource.labels[i], ...dataSource.series.map(s => s.values[i].toString())];
    rows.push(row.map(escapeCSVField).join(','));
  }

  const csvContent = rows.join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitizedFilename = filename
    ? filename.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'chart-data';

  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedFilename}-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field (add quotes if needed)
 */
function escapeCSVField(field: string): string {
  const stringValue = String(field);

  // Quote if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Validate CSV file before parsing
 */
export function validateCSVFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'CSV file is too large. Maximum size is 5MB.',
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.csv')) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a .csv file.',
    };
  }

  return { valid: true };
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
