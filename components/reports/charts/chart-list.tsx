'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Eye, FileImage } from 'lucide-react';
import type { ReportChart } from '@/lib/types/reports';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

interface ChartListProps {
  charts: ReportChart[];
  onDelete: (chartId: string) => void;
  onEdit: (chart: ReportChart) => void;
}

export function ChartList({ charts, onDelete, onEdit }: ChartListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [chartToDelete, setChartToDelete] = React.useState<string | null>(null);
  const [previewChart, setPreviewChart] = React.useState<ReportChart | null>(null);

  const handleDeleteClick = (chartId: string) => {
    setChartToDelete(chartId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chartToDelete) {
      onDelete(chartToDelete);
      setChartToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  if (charts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No charts yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first chart to get started. Charts can be referenced in the report content.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charts.map(chart => (
          <Card key={chart.id} className="p-4 space-y-3">
            {/* Preview */}
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              {chart.imageData || chart.imageUrl ? (
                <Image
                  src={chart.imageData || chart.imageUrl || ''}
                  alt={chart.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h4 className="font-medium text-sm mb-1">{chart.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{chart.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {chart.chartType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {chart.data.series.length} series
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPreviewChart(chart)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(chart)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDeleteClick(chart.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chart? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      {previewChart && (
        <AlertDialog open={!!previewChart} onOpenChange={() => setPreviewChart(null)}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{previewChart.name}</AlertDialogTitle>
              <AlertDialogDescription>{previewChart.title}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              {previewChart.imageData || previewChart.imageUrl ? (
                <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
                  <Image
                    src={previewChart.imageData || previewChart.imageUrl || ''}
                    alt={previewChart.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                  <FileImage className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
