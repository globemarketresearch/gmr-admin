'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SimpleChartBuilder } from './charts/simple-chart-builder';
import type { ReportChart, ReportFormData } from '@/lib/types/reports';

interface ChartBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (chart: ReportChart) => void;
  reportData?: ReportFormData;
}

export function ChartBuilderDialog({
  open,
  onOpenChange,
  onSave,
  reportData,
}: ChartBuilderDialogProps) {
  const handleSave = (chart: ReportChart) => {
    onSave(chart);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[85vw] lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[65vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
          <DialogDescription>
            Build a custom chart with your data. The chart will be saved as an image.
          </DialogDescription>
        </DialogHeader>
        <SimpleChartBuilder onSave={handleSave} onCancel={handleCancel} reportData={reportData} />
      </DialogContent>
    </Dialog>
  );
}
