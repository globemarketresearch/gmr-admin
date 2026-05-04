'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportImagesManager } from '../report-images-manager';
import type { ReportFormData } from '@/lib/types/reports';
import { Image, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChartsTabProps {
  form: UseFormReturn<ReportFormData>;
  reportId?: string | number;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function ChartsTab({ form, reportId, onSaveTab: _onSaveTab, isSaving }: ChartsTabProps) {
  // If no reportId, show message to save report first
  if (!reportId) {
    return (
      <div className="space-y-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Save Report First</AlertTitle>
          <AlertDescription>
            Please save the report first before adding charts and images. Use the &quot;Save
            Report&quot; button in the Settings tab or any other tab to create the report, then
            return here to add charts and images.
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/50 opacity-75">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Charts & Images - Locked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Once you save the report, you&apos;ll be able to:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create custom charts from your market research data</li>
              <li>Upload custom images (JPG, PNG, WebP, GIF - Max 10MB)</li>
              <li>Edit image titles and manage visibility</li>
              <li>Reference images in the report content using their URLs</li>
            </ul>
            <p className="pt-2 text-xs italic">
              All images are uploaded to Cloudflare for fast, reliable delivery.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Charts & Images
          </CardTitle>
          <CardDescription>
            Create custom charts or upload images for your report. All images are stored on
            Cloudflare and can be referenced in the report content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportImagesManager
            reportId={reportId}
            disabled={isSaving}
            reportData={form.getValues()}
          />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">How to use charts and images in your report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Creating Charts:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Click &quot;Add Chart&quot; to create a custom chart from your data</li>
            <li>Choose from bar charts, pie charts, donut charts, or world maps</li>
            <li>Charts are automatically converted to images and uploaded</li>
          </ul>

          <p className="pt-3">
            <strong>Uploading Images:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Click &quot;Upload Image&quot; to add custom images</li>
            <li>Supported formats: JPG, PNG, WebP, GIF (Max 10MB)</li>
            <li>Add titles to your images for easy identification</li>
          </ul>

          <p className="pt-3">
            <strong>Using Images in Content:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Click on any image to preview it and copy its URL</li>
            <li>Use the image URL in the rich text editor when editing report sections</li>
            <li>Toggle image visibility with the Show/Hide button</li>
          </ul>

          <p className="text-xs italic pt-2">
            Images can be deactivated without deleting them. Inactive images won&apos;t appear in
            the report but remain accessible in the admin panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
