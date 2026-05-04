'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

interface TOCWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TOCWizardDialog({ open, onOpenChange }: TOCWizardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[98vw] !w-[98vw] !h-[98vh] p-0 !gap-0 !flex !flex-col">
        <DialogHeader className="px-6 pt-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-5 w-5" />
            Table of Contents Generator Wizard
          </DialogTitle>
          <DialogDescription className="text-sm">
            Use this tool to generate comprehensive table of contents for your market research
            reports.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <iframe
            src="/TOC_generator_external_tool.html"
            className="w-full h-full border-0 block"
            title="TOC Generator Tool"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            style={{ display: 'block', border: 'none' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
