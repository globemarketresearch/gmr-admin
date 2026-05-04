'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchAuthors } from '@/lib/api/authors';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData, ReportAuthor } from '@/lib/types/reports';

interface PublishSettingsTabProps {
  form: UseFormReturn<any>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
}

export function PublishSettingsTab({
  form,
  onSubmit,
  onPreview,
  isSaving,
}: PublishSettingsTabProps) {
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setIsLoadingAuthors(true);
      const response = await fetchAuthors();
      setAuthors(response.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setIsLoadingAuthors(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Research Team Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="authorIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Authors</FormLabel>
                <FormDescription>
                  Choose the researchers and analysts who contributed to this report
                </FormDescription>
                {isLoadingAuthors ? (
                  <div className="text-sm text-muted-foreground py-4">Loading authors...</div>
                ) : authors.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    No authors available. Please add authors first.
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {authors.map(author => (
                      <div
                        key={author.id}
                        className="flex items-start space-x-3 border rounded-lg p-3"
                      >
                        <Checkbox
                          checked={field.value?.includes(String(author.id))}
                          onCheckedChange={checked => {
                            const updated = checked
                              ? [...(field.value || []), String(author.id)]
                              : field.value?.filter((id: string) => id !== String(author.id)) || [];
                            field.onChange(updated);
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{author.name}</div>
                          {author.role && (
                            <div className="text-sm text-muted-foreground">{author.role}</div>
                          )}
                          {author.bio && (
                            <div className="text-xs text-muted-foreground mt-1">{author.bio}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publish Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Status</FormLabel>
                  <FormDescription>
                    {field.value === 'published'
                      ? 'Report is visible to users'
                      : 'Report is hidden (draft mode)'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'published'}
                    onCheckedChange={checked => field.onChange(checked ? 'published' : 'draft')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Report'}
              </Button>
              {onPreview && (
                <Button type="button" variant="outline" onClick={onPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
