'use client';

import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface SEOValidationAlertProps {
  warnings: any[];
  className?: string;
}

export function SEOValidationAlert({ warnings, className }: SEOValidationAlertProps) {
  if (warnings.length === 0) {
    return (
      <Alert variant="default" className={cn('border-green-200 bg-green-50', className)}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">SEO Optimized</AlertTitle>
        <AlertDescription className="text-green-700">
          All SEO best practices are being followed.
        </AlertDescription>
      </Alert>
    );
  }

  const errors = warnings.filter(w => w.severity === 'error');
  const warningsOnly = warnings.filter(w => w.severity === 'warning');
  const info = warnings.filter(w => w.severity === 'info');

  return (
    <div className={cn('space-y-2', className)}>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SEO Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {errors.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningsOnly.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">SEO Recommendations</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {warningsOnly.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {info.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="info" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900">Additional SEO Tips ({info.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {info.map((w, i) => (
                  <li key={i}>{w.message}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
