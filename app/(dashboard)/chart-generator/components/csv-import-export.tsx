'use client';

import React, { useRef, useState } from 'react';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { parseCSV, exportToCSV, validateCSVFile, readFileAsText } from '@/lib/utils/csv-parser';
import { toast } from 'sonner';

export function CSVImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { dataSource, updateDataSource, metadata } = useChartGenerator();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset warnings
    setWarnings([]);

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsProcessing(true);

    try {
      // Read file content
      const content = await readFileAsText(file);

      // Parse CSV
      const result = parseCSV(content);

      if (!result.success) {
        toast.error(result.error || 'Failed to parse CSV file');
        return;
      }

      if (result.data) {
        // Update data source
        updateDataSource(result.data);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          setWarnings(result.warnings);
          toast.success('CSV imported with warnings. Please review.');
        } else {
          toast.success('CSV imported successfully');
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Failed to import CSV file');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    try {
      // Type guard: CSV export only works for DataSource (not MapDataSource)
      if ('data' in dataSource) {
        toast.error('CSV export is not available for map charts');
        return;
      }

      exportToCSV(dataSource, metadata.title || 'chart-data');
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleImportClick}
          disabled={isProcessing}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isProcessing ? 'Importing...' : 'Import CSV'}
        </Button>
        <Button variant="outline" onClick={handleExport} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {warnings.length > 0 && (
        <Alert variant="default" className="border-yellow-600 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <p className="font-medium mb-2">Import Warnings:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <strong>CSV Format:</strong> First column = categories, other columns = data series
        </p>
        <p className="ml-4">
          Example: Category,Series1,Series2
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2020,100,200
        </p>
        <p className="ml-4">
          <a
            href="/sample-chart-data.csv"
            download
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Download sample CSV template
          </a>
        </p>
      </div>
    </div>
  );
}
