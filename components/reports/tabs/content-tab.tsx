'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, FileText, Building2, HelpCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SectionEditor } from '../section-editor';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface ContentTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
  reportId?: number | string;
}

export function ContentTab({ form, onSaveTab, isSaving, reportId }: ContentTabProps) {
  const [showValidationError, setShowValidationError] = useState(false);
  const playerInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const faqInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSaveTab = async () => {
    if (onSaveTab) {
      // Wait for React to complete any pending state updates from the TiptapEditor
      // This ensures we capture the latest editor content before saving
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      // Trigger validation for the entire form
      const isValid = await form.trigger();

      if (!isValid) {
        // Validation failed - show error alert and scroll to top
        setShowValidationError(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Hide validation error if it was showing
      setShowValidationError(false);

      const values = form.getValues();
      // Send all form values, not just fields from this tab
      await onSaveTab('content', values);
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
            asterisk (*).
          </AlertDescription>
        </Alert>
      )}

      {/* Report Content Sections */}
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
                  <SectionEditor
                    sections={field.value}
                    onChange={field.onChange}
                    reportId={reportId}
                    onInternalLinksChange={links =>
                      form.setValue('internalLinks', links as ReportFormData['internalLinks'])
                    }
                    initialLinks={
                      form.getValues('internalLinks') as ReportFormData['internalLinks']
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Key Market Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Key Market Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="sections.keyPlayers"
            render={({ field }) => (
              <FormItem>
                <FormDescription>Add key companies and their market share data</FormDescription>
                <div className="space-y-4">
                  {field.value?.map((player: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <Input
                            ref={el => {
                              playerInputRefs.current[index] = el;
                            }}
                            placeholder="Company Name"
                            value={player.name}
                            onChange={e => {
                              const updated = [...(field.value || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              field.onChange(updated);
                            }}
                          />
                        </div>
                        <div className="flex">
                          <Input
                            placeholder="XX%"
                            value={player.marketShare || ''}
                            onChange={e => {
                              const updated = [...(field.value || [])];
                              updated[index] = { ...updated[index], marketShare: e.target.value };
                              field.onChange(updated);
                            }}
                          />
                          <Button
                            className="col-span-1"
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
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const updated = [
                      ...(field.value || []),
                      { name: '', marketShare: 'XX', rank: undefined },
                    ];
                    field.onChange(updated);
                    const newIndex = updated.length - 1;
                    setTimeout(() => {
                      playerInputRefs.current[newIndex]?.focus();
                    }, 0);
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key Player
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* FAQs */}
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
                            ref={el => {
                              faqInputRefs.current[index] = el;
                            }}
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
                    const newIndex = updated.length - 1;
                    setTimeout(() => {
                      faqInputRefs.current[newIndex]?.focus();
                    }, 0);
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
