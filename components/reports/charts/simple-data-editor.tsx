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
import type { ReportChartData } from '@/lib/types/reports';
import { CHART_CONSTRAINTS } from '@/lib/config/chart-generator';

interface SimpleDataEditorProps {
  data: ReportChartData;
  onChange: (data: ReportChartData) => void;
}

export function SimpleDataEditor({ data, onChange }: SimpleDataEditorProps) {
  const canAddRow = data.labels.length < CHART_CONSTRAINTS.MAX_ROWS;
  const canRemoveRow = data.labels.length > CHART_CONSTRAINTS.MIN_ROWS;
  const canAddSeries = data.series.length < CHART_CONSTRAINTS.MAX_SERIES;
  const canRemoveSeries = data.series.length > CHART_CONSTRAINTS.MIN_SERIES;

  const addRow = () => {
    if (!canAddRow) return;
    onChange({
      ...data,
      labels: [...data.labels, `Category ${data.labels.length + 1}`],
      series: data.series.map(s => ({
        ...s,
        values: [...s.values, 0],
      })),
    });
  };

  const removeRow = (index: number) => {
    if (!canRemoveRow) return;
    onChange({
      ...data,
      labels: data.labels.filter((_, i) => i !== index),
      series: data.series.map(s => ({
        ...s,
        values: s.values.filter((_, i) => i !== index),
      })),
    });
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...data.labels];
    newLabels[index] = value;
    onChange({ ...data, labels: newLabels });
  };

  const addSeries = () => {
    if (!canAddSeries) return;
    const colors = [
      '#5B8EBC',
      '#7FC9A0',
      '#F4A261',
      '#E76F51',
      '#8E7CC3',
      '#6A9FB5',
      '#C9ADA7',
      '#9A8C98',
    ];
    onChange({
      ...data,
      series: [
        ...data.series,
        {
          id: `series-${Date.now()}`,
          name: `Series ${data.series.length + 1}`,
          color: colors[data.series.length % colors.length],
          values: data.labels.map(() => 0),
        },
      ],
    });
  };

  const removeSeries = (seriesId: string) => {
    if (!canRemoveSeries) return;
    onChange({
      ...data,
      series: data.series.filter(s => s.id !== seriesId),
    });
  };

  const updateSeriesName = (seriesId: string, name: string) => {
    onChange({
      ...data,
      series: data.series.map(s => (s.id === seriesId ? { ...s, name } : s)),
    });
  };

  const updateSeriesValue = (seriesId: string, index: number, value: number) => {
    onChange({
      ...data,
      series: data.series.map(s =>
        s.id === seriesId
          ? {
              ...s,
              values: s.values.map((v, i) => (i === index ? value : v)),
            }
          : s
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Chart Data</h3>
          <p className="text-xs text-muted-foreground">
            {data.labels.length} / {CHART_CONSTRAINTS.MAX_ROWS} rows, {data.series.length} /{' '}
            {CHART_CONSTRAINTS.MAX_SERIES} series
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addSeries} disabled={!canAddSeries} size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Add Series
          </Button>
          <Button onClick={addRow} disabled={!canAddRow} size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-auto max-h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] sticky left-0 bg-background z-10">Category</TableHead>
              {data.series.map(series => (
                <TableHead key={series.id} className="min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <Input
                      value={series.name}
                      onChange={e => updateSeriesName(series.id, e.target.value)}
                      className="h-7 text-xs"
                      placeholder="Series name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSeries(series.id)}
                      disabled={!canRemoveSeries}
                      className="h-7 w-7 shrink-0"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.labels.map((label, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <Input
                    value={label}
                    onChange={e => updateLabel(rowIndex, e.target.value)}
                    placeholder="Label"
                    className="h-8 text-sm"
                  />
                </TableCell>
                {data.series.map(series => (
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
                      className="h-8 text-sm"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(rowIndex)}
                    disabled={!canRemoveRow}
                    className="h-7 w-7"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
