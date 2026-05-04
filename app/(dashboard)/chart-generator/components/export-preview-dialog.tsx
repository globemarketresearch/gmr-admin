'use client';

import React from 'react';
import { Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ExportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  isGenerating: boolean;
  format: 'png' | 'webp';
  resolution: string;
  onConfirmDownload: () => void;
}

export function ExportPreviewDialog({
  open,
  onOpenChange,
  previewUrl,
  isGenerating,
  format,
  resolution,
  onConfirmDownload,
}: ExportPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto">
        <DialogHeader>
          <DialogTitle>Export Preview</DialogTitle>
          <DialogDescription>
            Preview your chart before downloading as {format.toUpperCase()} ({resolution})
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center min-h-[400px] max-h-[60vh] overflow-auto bg-gray-50 rounded-md p-4">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-[800px] h-[500px]" />
              <p className="text-sm text-muted-foreground">Generating preview...</p>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Chart preview"
              className="max-w-full max-h-full object-contain border border-border rounded-sm shadow-sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No preview available</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onConfirmDownload} disabled={!previewUrl || isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
