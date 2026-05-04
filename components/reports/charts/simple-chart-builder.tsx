'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SimpleDataEditor } from './simple-data-editor';
import { SimpleChartPreview, type SimpleChartPreviewRef } from './simple-chart-preview';
import type { ReportChart, ReportChartType, ReportFormData } from '@/lib/types/reports';
import { DEFAULT_CHART_COLORS } from '@/lib/config/chart-generator';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Loader2, Minimize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SimpleChartBuilderProps {
  chart?: ReportChart;
  onSave: (chart: ReportChart) => void;
  onCancel: () => void;
  reportData?: ReportFormData;
}

// Helper function to generate default chart data from report metrics
function generateDefaultChartData(reportData?: ReportFormData): ReportChart {
  const metrics = reportData?.marketMetrics;
  const title = reportData?.title || '';

  // Extract market name from title (e.g., "3D Printing in Healthcare" -> "3D Printing in Healthcare")
  const marketName = title.split(' Market')[0] || 'Market';

  // Generate default labels and values
  let labels: string[] = ['2020', '2021', '2022', '2023'];
  let values: number[] = [10, 20, 30, 40];

  // If we have market metrics, use those to generate more realistic data
  if (metrics) {
    const { currentYear, forecastYear, currentRevenue, forecastRevenue } = metrics;

    if (currentYear && forecastYear && currentRevenue && forecastRevenue) {
      // Parse revenue values (remove B, M, etc. and convert to numbers)
      const parseRevenue = (rev: string): number => {
        const num = parseFloat(rev.replace(/[^0-9.]/g, ''));
        if (rev.includes('B') || rev.includes('billion')) return num;
        if (rev.includes('M') || rev.includes('million')) return num / 1000;
        return num;
      };

      const currentVal = parseRevenue(currentRevenue);
      const forecastVal = parseRevenue(forecastRevenue);
      const years = forecastYear - currentYear;

      // Generate year labels and interpolated values
      labels = [];
      values = [];
      for (let i = 0; i <= years; i++) {
        const year = currentYear + i;
        labels.push(year.toString());

        // Linear interpolation
        const value = currentVal + (forecastVal - currentVal) * (i / years);
        values.push(parseFloat(value.toFixed(2)));
      }
    }
  }

  return {
    id: `temp-${Date.now()}`,
    name: `${marketName} - Market Size`,
    chartType: 'bar',
    orientation: 'vertical',
    title: `Global ${marketName} Market Size`,
    subtitle:
      metrics?.currentYear && metrics?.forecastYear
        ? `${metrics.currentYear}-${metrics.forecastYear}`
        : undefined,
    xAxisLabel: 'Year',
    yAxisLabel: 'Revenue',
    unitSuffix: 'B',
    decimalPrecision: 1,
    showLegend: true,
    showGridlines: true,
    axisLabelDisplay: 'first-second-last',
    source: 'www.healthcareforesights.com', // POC default
    logoUrl: undefined, // No logo by default
    logoPosition: 'top-right', // Default position
    logoOpacity: 80, // Default opacity
    data: {
      labels,
      series: [
        {
          id: 'series-1',
          name: 'Market Size (USD Billion)',
          color: DEFAULT_CHART_COLORS[0],
          values,
        },
      ],
    },
  };
}

export function SimpleChartBuilder({
  chart,
  onSave,
  onCancel,
  reportData,
}: SimpleChartBuilderProps) {
  const [chartData, setChartData] = useState<ReportChart>(() => {
    if (chart) {
      // Editing existing chart - apply defaults for missing fields
      return {
        ...chart,
        source: chart.source ?? 'www.healthcareforesights.com',
        logoPosition: chart.logoPosition ?? 'top-right',
        logoOpacity: chart.logoOpacity ?? 80,
        axisLabelDisplay: chart.axisLabelDisplay ?? 'first-second-last',
      };
    }
    return generateDefaultChartData(reportData);
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const previewRef = useRef<SimpleChartPreviewRef>(null);

  const handleGeneratePreview = async () => {
    if (!chartData.name.trim()) {
      toast.error('Please enter a chart name');
      return;
    }
    if (!chartData.title.trim()) {
      toast.error('Please enter a chart title');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Generate chart image preview
      const exportContainer = previewRef.current?.getExportContainer();
      if (!exportContainer) {
        throw new Error('Chart preview not ready');
      }

      const dataUrl = await toPng(exportContainer, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      setPreviewImageUrl(dataUrl);
      setShowImagePreview(true);
      toast.success('Image preview generated');
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!chartData.name.trim()) {
      toast.error('Please enter a chart name');
      return;
    }
    if (!chartData.title.trim()) {
      toast.error('Please enter a chart title');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate chart image
      const exportContainer = previewRef.current?.getExportContainer();
      if (!exportContainer) {
        throw new Error('Chart preview not ready');
      }

      const dataUrl = await toPng(exportContainer, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Save with image data (will be uploaded when form is submitted)
      onSave({
        ...chartData,
        imageData: dataUrl,
      });

      toast.success('Chart saved successfully');
    } catch (error) {
      console.error('Failed to generate chart image:', error);
      toast.error('Failed to generate chart image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chart-name">Chart Name *</Label>
              <Input
                id="chart-name"
                value={chartData.name}
                onChange={e => setChartData({ ...chartData, name: e.target.value })}
                placeholder="e.g., Market Size by Region"
              />
              <p className="text-xs text-muted-foreground">Internal name to identify this chart</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select
                value={chartData.chartType}
                onValueChange={(value: ReportChartType) =>
                  setChartData({ ...chartData, chartType: value })
                }
              >
                <SelectTrigger id="chart-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="donut">Donut Chart</SelectItem>
                  {/* <SelectItem value="world-map">World Map</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {(chartData.chartType === 'bar' || chartData.chartType === 'stacked-bar') && (
              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select
                  value={chartData.orientation}
                  onValueChange={(value: 'vertical' | 'horizontal') =>
                    setChartData({ ...chartData, orientation: value })
                  }
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="chart-title">Chart Title *</Label>
              <Input
                id="chart-title"
                value={chartData.title}
                onChange={e => setChartData({ ...chartData, title: e.target.value })}
                placeholder="e.g., Global Market Size (USD Billion)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-subtitle">Subtitle</Label>
              <Input
                id="chart-subtitle"
                value={chartData.subtitle || ''}
                onChange={e => setChartData({ ...chartData, subtitle: e.target.value })}
                placeholder="e.g., 2020-2024"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="x-axis-label">X-Axis</Label>
                <Input
                  id="x-axis-label"
                  value={chartData.xAxisLabel || ''}
                  onChange={e => setChartData({ ...chartData, xAxisLabel: e.target.value })}
                  placeholder="e.g., Year"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="y-axis-label">Y-Axis</Label>
                <Input
                  id="y-axis-label"
                  value={chartData.yAxisLabel || ''}
                  onChange={e => setChartData({ ...chartData, yAxisLabel: e.target.value })}
                  placeholder="e.g., Revenue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-suffix">Unit</Label>
                <Input
                  id="unit-suffix"
                  value={chartData.unitSuffix || ''}
                  onChange={e => setChartData({ ...chartData, unitSuffix: e.target.value })}
                  placeholder="e.g., B, M, %"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-legend"
                  checked={chartData.showLegend}
                  onCheckedChange={checked => setChartData({ ...chartData, showLegend: checked })}
                />
                <Label htmlFor="show-legend" className="cursor-pointer text-sm">
                  Legend
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show-gridlines"
                  checked={chartData.showGridlines}
                  onCheckedChange={checked =>
                    setChartData({ ...chartData, showGridlines: checked })
                  }
                />
                <Label htmlFor="show-gridlines" className="cursor-pointer text-sm">
                  Gridlines
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="decimal-precision" className="text-sm">
                  Decimals:
                </Label>
                <Select
                  value={chartData.decimalPrecision.toString()}
                  onValueChange={value =>
                    setChartData({ ...chartData, decimalPrecision: parseInt(value) as 0 | 1 | 2 })
                  }
                >
                  <SelectTrigger id="decimal-precision" className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bar Value Labels Display */}
            {(chartData.chartType === 'bar' || chartData.chartType === 'stacked-bar') && (
              <div className="space-y-2">
                <Label htmlFor="bar-value-labels">Bar Value Labels</Label>
                <Select
                  value={chartData.axisLabelDisplay || 'first-second-last'}
                  onValueChange={(value: 'all' | 'first-second-last' | 'first-last' | 'none') =>
                    setChartData({ ...chartData, axisLabelDisplay: value })
                  }
                >
                  <SelectTrigger id="bar-value-labels">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All Values</SelectItem>
                    <SelectItem value="first-second-last">
                      Show 1st, 2nd & Last (Default)
                    </SelectItem>
                    <SelectItem value="first-last">Show 1st & Last Only</SelectItem>
                    <SelectItem value="none">Hide All Values</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Control which value labels are displayed above the bars
                </p>
              </div>
            )}

            {/* Source Attribution */}
            <div className="space-y-2">
              <Label htmlFor="source">Source Attribution</Label>
              <Input
                id="source"
                value={chartData.source || ''}
                onChange={e => setChartData({ ...chartData, source: e.target.value })}
                placeholder="e.g., Towards Healthcare"
              />
              <p className="text-xs text-muted-foreground">
                Attribution text shown at bottom of chart
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo (Optional)</Label>
              {chartData.logoUrl ? (
                <div className="space-y-2">
                  <img
                    src={chartData.logoUrl}
                    alt="Logo preview"
                    className="h-16 w-auto border rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChartData({ ...chartData, logoUrl: undefined })}
                  >
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate: PNG or SVG only, max 2MB
                    const validTypes = ['image/png', 'image/svg+xml'];
                    if (!validTypes.includes(file.type)) {
                      toast.error('Logo must be PNG or SVG');
                      return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Logo must be under 2MB');
                      return;
                    }

                    // Convert to base64 data URL for preview
                    const reader = new FileReader();
                    reader.onload = e => {
                      const dataUrl = e.target?.result as string;
                      setChartData({
                        ...chartData,
                        logoUrl: dataUrl,
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              )}
              <p className="text-xs text-muted-foreground">Upload a PNG or SVG logo (max 2MB)</p>
            </div>

            {/* Logo Configuration */}
            {chartData.logoUrl && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-position">Logo Position</Label>
                  <Select
                    value={chartData.logoPosition}
                    onValueChange={(value: 'top-left' | 'top-right' | 'bottom-right') =>
                      setChartData({ ...chartData, logoPosition: value })
                    }
                  >
                    <SelectTrigger id="logo-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-opacity">Logo Opacity (%)</Label>
                  <Input
                    id="logo-opacity"
                    type="number"
                    min="0"
                    max="100"
                    value={chartData.logoOpacity ?? 80}
                    onChange={e =>
                      setChartData({ ...chartData, logoOpacity: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <SimpleDataEditor
            data={chartData.data}
            onChange={data => setChartData({ ...chartData, data })}
          />
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Live Preview</Label>
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFullscreenPreview(true)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button> */}
          </div>
          <div className="border rounded-lg p-4 bg-muted/30 overflow-auto">
            <SimpleChartPreview ref={previewRef} chart={chartData} width={800} height={600} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Chart updates automatically as you make changes
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={handleGeneratePreview}
          disabled={isGenerating || isGeneratingPreview}
        >
          {isGeneratingPreview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGeneratingPreview ? 'Generating...' : 'Preview Final Image'}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isGenerating || isGeneratingPreview}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isGenerating || isGeneratingPreview}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Save Chart'}
          </Button>
        </div>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={showFullscreenPreview} onOpenChange={setShowFullscreenPreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chart Preview</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFullscreenPreview(false)}
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Close
              </Button>
            </DialogTitle>
            <DialogDescription>
              {chartData.title}
              {chartData.subtitle && ` - ${chartData.subtitle}`}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full overflow-auto">
            <SimpleChartPreview chart={chartData} width={1200} height={600} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog - Shows what will be saved */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Final Chart Image Preview</DialogTitle>
            <DialogDescription>
              This is exactly what will be saved and uploaded as an image
            </DialogDescription>
          </DialogHeader>
          {previewImageUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30 overflow-auto max-h-[70vh]">
                <img src={previewImageUrl} alt="Chart preview" className="w-full h-auto mx-auto" />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>High-resolution PNG image (2x pixel ratio)</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${chartData.name || 'chart'}.png`;
                    link.href = previewImageUrl;
                    link.click();
                  }}
                >
                  Download Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
