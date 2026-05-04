'use client';

import React, { useRef, useState } from 'react';
import { Download, RefreshCw, FileDown, FileUp, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { ChartPreview, type ChartPreviewRef } from './chart-preview';
import { ExportPreviewDialog } from './export-preview-dialog';
import { exportChartAsImage, generateChartPreview } from '@/lib/utils/chart-export';
import { EXPORT_RESOLUTIONS, GRAPH_SIZE_CONSTRAINTS } from '@/lib/config/chart-generator';
import { toast } from 'sonner';
import type { ExportOptions, ResolutionPreset } from '@/lib/types/chart-generator';

export function PreviewExportPanel() {
  const chartRef = useRef<ChartPreviewRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    metadata,
    validationResult,
    validateConfiguration,
    resetConfiguration,
    exportConfiguration,
    importConfiguration,
  } = useChartGenerator();

  const [exportFormat, setExportFormat] = useState<'png' | 'webp'>('png');
  const [resolution, setResolution] = useState<ResolutionPreset>('1200x700');
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(700);
  const [graphWidth, setGraphWidth] = useState(GRAPH_SIZE_CONSTRAINTS.DEFAULT_WIDTH);
  const [graphHeight, setGraphHeight] = useState(GRAPH_SIZE_CONSTRAINTS.DEFAULT_HEIGHT);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleShowPreview = async () => {
    // Validate before preview
    const validation = validateConfiguration();

    if (!validation.isValid) {
      toast.error('Please fix validation errors before previewing');
      return;
    }

    try {
      setIsGeneratingPreview(true);
      setShowPreview(true);
      setPreviewUrl(null);

      const exportContainer = chartRef.current?.getExportContainer();
      const chartInstance = chartRef.current?.getChartInstance();

      if (!exportContainer || !chartInstance) {
        toast.error('Chart not ready for preview');
        setShowPreview(false);
        return;
      }

      const options: ExportOptions = {
        format: exportFormat,
        resolution,
        ...(resolution === 'custom' && { customWidth, customHeight }),
      };

      const dataUrl = await generateChartPreview(exportContainer, chartInstance, options);
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview. Please try again.');
      setShowPreview(false);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleConfirmDownload = async () => {
    if (!previewUrl) return;

    try {
      setIsExporting(true);

      // Use the preview URL to download
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const sanitizedTitle = metadata.title
        ? metadata.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 50)
        : 'chart';

      link.download = `${sanitizedTitle}-${timestamp}.${exportFormat}`;
      link.href = previewUrl;
      link.click();

      toast.success(`Chart downloaded as ${exportFormat.toUpperCase()}`);
      setShowPreview(false);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download chart. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    // Validate before export
    const validation = validateConfiguration();

    if (!validation.isValid) {
      toast.error('Please fix validation errors before exporting');
      return;
    }

    try {
      setIsExporting(true);

      const exportContainer = chartRef.current?.getExportContainer();
      const chartInstance = chartRef.current?.getChartInstance();

      if (!exportContainer || !chartInstance) {
        toast.error('Chart not ready for export');
        return;
      }

      const options: ExportOptions = {
        format: exportFormat,
        resolution,
        ...(resolution === 'custom' && { customWidth, customHeight }),
      };

      await exportChartAsImage(exportContainer, chartInstance, options, metadata.title);
      toast.success(`Chart exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export chart. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all configuration? This cannot be undone.')) {
      resetConfiguration();
    }
  };

  const handleExportConfig = () => {
    try {
      const configJson = exportConfiguration();
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-config-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Configuration exported successfully');
    } catch {
      toast.error('Failed to export configuration');
    }
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = e.target?.result as string;
        importConfiguration(json);
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getResolutionDisplay = () => {
    if (resolution === 'custom') {
      return `Custom (${customWidth} × ${customHeight})`;
    }
    return EXPORT_RESOLUTIONS[resolution]?.label || resolution;
  };

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Graph Size Configuration */}
          <div className="grid grid-cols-2 gap-3 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="graph-width">Preview Width (px)</Label>
              <Input
                id="graph-width"
                type="number"
                min={GRAPH_SIZE_CONSTRAINTS.MIN_WIDTH}
                max={GRAPH_SIZE_CONSTRAINTS.MAX_WIDTH}
                value={graphWidth}
                onChange={e => setGraphWidth(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graph-height">Preview Height (px)</Label>
              <Input
                id="graph-height"
                type="number"
                min={GRAPH_SIZE_CONSTRAINTS.MIN_HEIGHT}
                max={GRAPH_SIZE_CONSTRAINTS.MAX_HEIGHT}
                value={graphHeight}
                onChange={e => setGraphHeight(Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>

          <ChartPreview ref={chartRef} width={graphWidth} height={graphHeight} />
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: 'png' | 'webp') => setExportFormat(value)}
            >
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-resolution">Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(value: ResolutionPreset) => setResolution(value)}
            >
              <SelectTrigger id="export-resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1200x700">{EXPORT_RESOLUTIONS['1200x700'].label}</SelectItem>
                <SelectItem value="1920x1080">{EXPORT_RESOLUTIONS['1920x1080'].label}</SelectItem>
                <SelectItem value="2400x1400">{EXPORT_RESOLUTIONS['2400x1400'].label}</SelectItem>
                <SelectItem value="3840x2160">{EXPORT_RESOLUTIONS['3840x2160'].label}</SelectItem>
                <SelectItem value="custom">Custom Resolution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {resolution === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="custom-width">Width (px)</Label>
                <Input
                  id="custom-width"
                  type="number"
                  min={400}
                  max={7680}
                  value={customWidth}
                  onChange={e => setCustomWidth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-height">Height (px)</Label>
                <Input
                  id="custom-height"
                  type="number"
                  min={300}
                  max={4320}
                  value={customHeight}
                  onChange={e => setCustomHeight(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleShowPreview}
              disabled={!validationResult.isValid}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Preview
            </Button>

            <Button
              onClick={handleExport}
              disabled={!validationResult.isValid || isExporting}
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Management */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExportConfig} variant="outline" className="w-full">
            <FileDown className="mr-2 h-4 w-4" />
            Export Config (JSON)
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import Config (JSON)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportConfig}
            className="hidden"
          />

          <Button onClick={handleReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Export Preview Dialog */}
      <ExportPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        previewUrl={previewUrl}
        isGenerating={isGeneratingPreview}
        format={exportFormat}
        resolution={getResolutionDisplay()}
        onConfirmDownload={handleConfirmDownload}
      />
    </div>
  );
}
