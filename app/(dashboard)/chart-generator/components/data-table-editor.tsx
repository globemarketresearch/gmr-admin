'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChartGenerator } from '@/hooks/use-chart-generator';
import { CHART_CONSTRAINTS } from '@/lib/config/chart-generator';
import type { DataSource, DataSeries } from '@/lib/types/chart-generator';

export function DataTableEditor() {
  const {
    dataSource,
    addDataRow,
    removeDataRow,
    updateDataLabel,
    addDataSeries,
    removeDataSeries,
    updateSeriesName,
    updateSeriesValue,
  } = useChartGenerator();

  const typedDataSource = dataSource as DataSource;
  const canAddRow = typedDataSource.labels.length < CHART_CONSTRAINTS.MAX_ROWS;
  const canRemoveRow = typedDataSource.labels.length > CHART_CONSTRAINTS.MIN_ROWS;
  const canAddSeries = typedDataSource.series.length < CHART_CONSTRAINTS.MAX_SERIES;
  const canRemoveSeries = typedDataSource.series.length > CHART_CONSTRAINTS.MIN_SERIES;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Data Table</h3>
          <p className="text-sm text-muted-foreground">
            {typedDataSource.labels.length} / {CHART_CONSTRAINTS.MAX_ROWS} rows,{' '}
            {typedDataSource.series.length} / {CHART_CONSTRAINTS.MAX_SERIES} series
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addDataSeries} disabled={!canAddSeries} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Series
          </Button>
          <Button onClick={addDataRow} disabled={!canAddRow} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] sticky left-0 bg-background z-10">Category</TableHead>
              {typedDataSource.series.map((series: DataSeries) => (
                <TableHead key={series.id} className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Input
                      value={series.name}
                      onChange={e => updateSeriesName(series.id, e.target.value)}
                      className="h-8 text-sm font-medium"
                      placeholder="Series name"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeDataSeries(series.id)}
                      disabled={!canRemoveSeries}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typedDataSource.labels.map((label: string, rowIndex: number) => (
              <TableRow key={rowIndex}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <Input
                    value={label}
                    onChange={e => updateDataLabel(rowIndex, e.target.value)}
                    placeholder="Category label"
                    className="h-9"
                  />
                </TableCell>
                {typedDataSource.series.map((series: DataSeries) => (
                  <TableCell key={series.id}>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={series.values[rowIndex] || 0}
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          updateSeriesValue(series.id, rowIndex, value);
                        }
                      }}
                      className="h-9"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeDataRow(rowIndex)}
                    disabled={!canRemoveRow}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!canAddRow && (
        <p className="text-sm text-muted-foreground">
          Maximum row limit reached ({CHART_CONSTRAINTS.MAX_ROWS} rows)
        </p>
      )}
      {!canAddSeries && (
        <p className="text-sm text-muted-foreground">
          Maximum series limit reached ({CHART_CONSTRAINTS.MAX_SERIES} series)
        </p>
      )}
    </div>
  );
}
