'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, HelpCircle } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface FAQsTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function FAQsTab({ form, onSaveTab, isSaving }: FAQsTabProps) {
  const handleSaveTab = async () => {
    const values = form.getValues();
    if (onSaveTab) {
      await onSaveTab('faqs', {
        faqs: values.faqs,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="faqs"
            render={({ field }) => (
              <FormItem>
                <FormDescription>
                  Add questions and answers to help users understand this report better
                </FormDescription>
                <div className="space-y-4">
                  {field.value?.map((faq: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            FAQ #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = field.value?.filter(
                                (_: any, i: number) => i !== index
                              );
                              field.onChange(updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter your question..."
                            value={faq.question}
                            onChange={e => {
                              const updated = [...(field.value || [])];
                              updated[index] = { ...updated[index], question: e.target.value };
                              field.onChange(updated);
                            }}
                          />
                          <Textarea
                            placeholder="Enter the answer..."
                            rows={3}
                            value={faq.answer}
                            onChange={e => {
                              const updated = [...(field.value || [])];
                              updated[index] = { ...updated[index], answer: e.target.value };
                              field.onChange(updated);
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const updated = [...(field.value || []), { question: '', answer: '' }];
                    field.onChange(updated);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
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
