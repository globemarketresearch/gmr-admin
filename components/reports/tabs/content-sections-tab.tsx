'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText } from 'lucide-react';
import { SectionEditor } from '../section-editor';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface ContentSectionsTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function ContentSectionsTab({ form, onSaveTab, isSaving }: ContentSectionsTabProps) {
  const handleSaveTab = async () => {
    const values = form.getValues();
    if (onSaveTab) {
      await onSaveTab('content', {
        sections: values.sections,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Content Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="sections"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SectionEditor sections={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
