'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Building2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface KeyPlayersTabProps {
  form: UseFormReturn<ReportFormData>;
  onSaveTab?: (tabKey: string, data: Partial<ReportFormData>) => Promise<void>;
  isSaving: boolean;
}

export function KeyPlayersTab({ form, onSaveTab, isSaving }: KeyPlayersTabProps) {
  const playerInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSaveTab = async () => {
    const values = form.getValues();
    if (onSaveTab) {
      await onSaveTab('keyPlayers', values);
    }
  };

  return (
    <div className="space-y-6">
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
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Player #{index + 1}
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
                        <div className="grid grid-cols-2 gap-3">
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
                          <Input
                            placeholder="%"
                            value={player.marketShare || ''}
                            onChange={e => {
                              const updated = [...(field.value || [])];
                              updated[index] = { ...updated[index], marketShare: e.target.value };
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
                    const updated = [...(field.value || []), { name: '', marketShare: 'XX' }];
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
