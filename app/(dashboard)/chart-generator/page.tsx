'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ChartGeneratorProvider } from '@/contexts/chart-generator-context';
import { ChartConfigPanel } from './components/chart-config-panel';
import { DataInputPanel } from './components/data-input-panel';
import { PreviewExportPanel } from './components/preview-export-panel';

export default function ChartGeneratorPage() {
  return (
    <ChartGeneratorProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Chart Generator (POC)</h1>
              <p className="text-muted-foreground mt-1">
                Create professional market-research charts and export as high-quality images
              </p>
            </div>
          </div>
        </div>

        {/* 3-Panel Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel: Chart Configuration */}
          <div className="xl:col-span-1">
            <ChartConfigPanel />
          </div>

          {/* Middle Panel: Data & Metadata Input */}
          <div className="xl:col-span-1">
            <DataInputPanel />
          </div>

          {/* Right Panel: Preview & Export */}
          <div className="xl:col-span-1">
            <PreviewExportPanel />
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t pt-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Start by selecting your chart type and configuring the data</li>
              <li>Upload a logo (PNG/SVG, max 2MB) to brand your charts</li>
              <li>Export your configuration as JSON to reuse chart templates</li>
              <li>Use high-resolution export (2400×1400) for print-ready images</li>
            </ul>
          </div>
        </div>
      </div>
    </ChartGeneratorProvider>
  );
}
