'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import type { DataSource, DataSeries } from '@/lib/types/chart-generator';

export function ColorPicker() {
  const { dataSource, updateSeriesColor, chartConfig } = useChartGenerator();

  if (chartConfig.colorTheme !== 'custom') {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Series Colors</Label>
      <div className="space-y-2">
        {(dataSource as DataSource).series?.map((series: DataSeries) => (
          <div key={series.id} className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor={`color-${series.id}`} className="text-sm font-normal">
                {series.name}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`color-${series.id}`}
                type="color"
                value={series.color}
                onChange={e => updateSeriesColor(series.id, e.target.value)}
                className="w-12 h-9 rounded border border-input cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono w-20">{series.color}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
