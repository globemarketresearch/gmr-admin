'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, List, Save, AlertCircle, Wand2, Eye, Edit3, Type } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TOCViewer } from '../toc-viewer';
import { TOCEditor } from '../toc-editor';
import { TOCTextEditor } from '../toc-text-editor';
import { TOCGeneratorDialog } from '../toc-generator-dialog';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

type TOCMode = 'view' | 'visual-edit' | 'text-edit';

interface TOCTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function TOCTab({ form, onSaveTab, isSaving }: TOCTabProps) {
  const [tocDialogOpen, setTocDialogOpen] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [tocMode, setTocMode] = useState<TOCMode>('text-edit');

  const handleSaveTab = async () => {
    if (onSaveTab) {
      const isValid = await form.trigger();

      if (!isValid) {
        setShowValidationError(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setShowValidationError(false);
      const values = form.getValues();
      await onSaveTab('toc', values);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Error Alert */}
      {showValidationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            Please fix the validation errors before saving. Required fields are marked with an
            asterisk (*) in the Report Details tab.
          </AlertDescription>
        </Alert>
      )}

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Table of Contents
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  type="button"
                  variant={tocMode === 'view' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTocMode('view')}
                  className="h-7 px-2"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  type="button"
                  variant={tocMode === 'text-edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTocMode('text-edit')}
                  className="h-7 px-2"
                >
                  <Type className="h-3.5 w-3.5 mr-1.5" />
                  Edit as Text
                </Button>
                <Button
                  type="button"
                  variant={tocMode === 'visual-edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTocMode('visual-edit')}
                  className="h-7 px-2"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Visual Edit
                </Button>
              </div>
              <div className="h-4 w-px bg-border" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open('/TOC_generator_external_tool.html', '_blank')}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                TOC Wizard
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTocDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate from Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="sections.tableOfContents"
            render={({ field }) => (
              <FormItem>
                <FormDescription>
                  {tocMode === 'view' &&
                    'View your hierarchical table of contents with chapters, sections, and subsections. Use "Generate from Template" to create or modify the structure.'}
                  {tocMode === 'text-edit' &&
                    'Edit your table of contents using text format with indentation. Changes are saved automatically.'}
                  {tocMode === 'visual-edit' &&
                    'Edit your table of contents using the visual editor. Add, remove, or reorder chapters, sections, and subsections.'}
                </FormDescription>
                <div>
                  {tocMode === 'view' && <TOCViewer value={field.value || { chapters: [] }} />}
                  {tocMode === 'text-edit' && (
                    <TOCTextEditor
                      value={field.value || { chapters: [] }}
                      onChange={value => field.onChange(value)}
                    />
                  )}
                  {tocMode === 'visual-edit' && (
                    <TOCEditor
                      value={field.value || { chapters: [] }}
                      onChange={value => field.onChange(value)}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <TOCGeneratorDialog
            open={tocDialogOpen}
            onOpenChange={setTocDialogOpen}
            reportTitle={form.watch('title')}
            currentTOC={form.watch('sections.tableOfContents') || { chapters: [] }}
            onImport={toc => {
              form.setValue('sections.tableOfContents', toc);
              setTocDialogOpen(false);
            }}
          />
        </CardContent>
      </Card>

      {onSaveTab && (
        <div className="flex justify-end">
          <Button onClick={handleSaveTab} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      )}
    </div>
  );
}
