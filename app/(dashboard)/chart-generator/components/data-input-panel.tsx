'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { DataTableEditor } from './data-table-editor';
import { MapDataEditor } from './map-data-editor';
import { LogoUploader } from './logo-uploader';
import { CSVImportExport } from './csv-import-export';
import { CHART_CONSTRAINTS } from '@/lib/config/chart-generator';

export function DataInputPanel() {
  const { chartConfig, metadata, updateMetadata } = useChartGenerator();

  return (
    <div className="space-y-6">
      {/* Chart Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Chart Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={e => updateMetadata({ title: e.target.value })}
              placeholder="e.g., Global Market Size Analysis"
              maxLength={CHART_CONSTRAINTS.TITLE_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">
              {metadata.title.length} / {CHART_CONSTRAINTS.TITLE_MAX_LENGTH} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (Optional)</Label>
            <Input
              id="subtitle"
              value={metadata.subtitle || ''}
              onChange={e => updateMetadata({ subtitle: e.target.value })}
              placeholder="e.g., Market size by segment, 2020-2024"
              maxLength={CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">
              {(metadata.subtitle || '').length} / {CHART_CONSTRAINTS.SUBTITLE_MAX_LENGTH}{' '}
              characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source (Optional)</Label>
            <Input
              id="source"
              value={metadata.source || ''}
              onChange={e => updateMetadata({ source: e.target.value })}
              placeholder="www.healthcareforesights.com"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Displayed at the bottom of the chart as &quot;Source: [your text]&quot;
            </p>
          </div>

          {/* Only show axis labels for charts that have axes */}
          {chartConfig.chartType !== 'pie' &&
            chartConfig.chartType !== 'donut' &&
            chartConfig.chartType !== 'world-map' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="x-axis-label">X-Axis Label</Label>
                    <Input
                      id="x-axis-label"
                      value={metadata.xAxisLabel || ''}
                      onChange={e => updateMetadata({ xAxisLabel: e.target.value })}
                      placeholder="e.g., Year"
                      maxLength={CHART_CONSTRAINTS.LABEL_MAX_LENGTH}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="y-axis-label">Y-Axis Label</Label>
                    <Input
                      id="y-axis-label"
                      value={metadata.yAxisLabel || ''}
                      onChange={e => updateMetadata({ yAxisLabel: e.target.value })}
                      placeholder="e.g., Revenue"
                      maxLength={CHART_CONSTRAINTS.LABEL_MAX_LENGTH}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="axis-label-display">Bar Value Labels</Label>
                  <Select
                    value={metadata.axisLabelDisplay || 'first-second-last'}
                    onValueChange={value =>
                      updateMetadata({
                        axisLabelDisplay: value as
                          | 'all'
                          | 'first-second-last'
                          | 'first-last'
                          | 'none',
                      })
                    }
                  >
                    <SelectTrigger id="axis-label-display">
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
              </>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit-suffix">Unit Suffix</Label>
              <Input
                id="unit-suffix"
                value={metadata.unitSuffix || ''}
                onChange={e => updateMetadata({ unitSuffix: e.target.value })}
                placeholder="e.g., B, M, K"
                maxLength={CHART_CONSTRAINTS.UNIT_SUFFIX_MAX_LENGTH}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimal-precision">Decimal Precision</Label>
              <Select
                value={metadata.decimalPrecision.toString()}
                onValueChange={value =>
                  updateMetadata({ decimalPrecision: parseInt(value) as 0 | 1 | 2 })
                }
              >
                <SelectTrigger id="decimal-precision">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 decimals</SelectItem>
                  <SelectItem value="1">1 decimal</SelectItem>
                  <SelectItem value="2">2 decimals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-legend" className="cursor-pointer">
                Show Legend
              </Label>
              <Switch
                id="show-legend"
                checked={metadata.showLegend}
                onCheckedChange={checked => updateMetadata({ showLegend: checked })}
              />
            </div>

            {/* Only show gridlines toggle for bar charts */}
            {chartConfig.chartType !== 'pie' &&
              chartConfig.chartType !== 'donut' &&
              chartConfig.chartType !== 'world-map' && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-gridlines" className="cursor-pointer">
                    Show Gridlines
                  </Label>
                  <Switch
                    id="show-gridlines"
                    checked={metadata.showGridlines}
                    onCheckedChange={checked => updateMetadata({ showGridlines: checked })}
                  />
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Logo Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUploader />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CSVImportExport />
          {chartConfig.chartType === 'world-map' ? <MapDataEditor /> : <DataTableEditor />}
        </CardContent>
      </Card>
    </div>
  );
}
