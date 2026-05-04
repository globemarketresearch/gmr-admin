'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Search, User, AlertCircle, Clock, X, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MultiSelectAuthorDropdown } from '../multi-select-author-dropdown';
import { CharacterCounter } from '@/components/seo/character-counter';
import { SEO_LIMITS } from '@/lib/config/seo';
import { measureTextWidth, SERP_FONTS } from '@/lib/utils/text-measurement';
import { format } from 'date-fns';
import type { UseFormReturn } from 'react-hook-form';
import type { ReportFormData } from '@/lib/types/reports';

interface SettingsTabProps {
  form: UseFormReturn<ReportFormData>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
  currentScheduledDate?: string;
  onSchedule?: (date: Date) => Promise<void>;
  onCancelSchedule?: () => Promise<void>;
}

export function SettingsTab({
  form,
  onSubmit,
  onPreview,
  isSaving,
  currentScheduledDate,
  onSchedule,
  onCancelSchedule,
}: SettingsTabProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentScheduledDate ? new Date(currentScheduledDate) : undefined
  );

  // Sync with external changes
  useEffect(() => {
    if (currentScheduledDate) {
      setSelectedDate(new Date(currentScheduledDate));
    } else {
      setSelectedDate(undefined);
    }
  }, [currentScheduledDate]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      setShowValidationError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setShowValidationError(false);
    const values = form.getValues();
    await onSubmit(values as ReportFormData);
  };

  const currentStatus = form.watch('status');
  const isScheduled = currentScheduledDate && currentStatus !== 'published';
  const canSchedule = currentStatus !== 'published' && onSchedule && onCancelSchedule;
  const minDate = new Date();

  const handleSchedule = async () => {
    if (selectedDate && onSchedule) {
      // Validate that the selected date is in the future
      if (selectedDate <= new Date()) {
        alert('Please select a future date and time');
        return;
      }
      await onSchedule(selectedDate);
    }
  };

  const handleCancelSchedule = async () => {
    if (onCancelSchedule) {
      await onCancelSchedule();
      setSelectedDate(undefined);
    }
  };

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const timeString = selectedDate ? format(selectedDate, 'HH:mm') : '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) {
      setSelectedDate(undefined);
      return;
    }

    const [year, month, day] = newDate.split('-');
    const newDateObj = selectedDate ? new Date(selectedDate) : new Date();
    newDateObj.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    setSelectedDate(newDateObj);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime) return;

    const [hours, minutes] = newTime.split(':');
    const newDateObj = selectedDate ? new Date(selectedDate) : new Date();
    newDateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setSelectedDate(newDateObj);
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

      {/* Research Team Selection */}
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
                <FormControl>
                  <MultiSelectAuthorDropdown value={field.value || []} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* SEO Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic SEO</h3>
            <FormField
              control={form.control}
              name="metadata.metaTitle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Meta Title</FormLabel>
                    <CharacterCounter
                      current={field.value?.length || 0}
                      max={SEO_LIMITS.metaTitle.max}
                      optimal={SEO_LIMITS.metaTitle.optimal}
                      pixelWidth={{
                        current: measureTextWidth(field.value || '', SERP_FONTS.title),
                        max: SEO_LIMITS.metaTitle.pixelWidth.max,
                      }}
                      variant="inline"
                    />
                  </div>
                  <FormControl>
                    <Input placeholder="SEO-friendly title (optional)" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty to use report title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Meta Description</FormLabel>
                    <CharacterCounter
                      current={field.value?.length || 0}
                      max={SEO_LIMITS.metaDescription.max}
                      optimal={SEO_LIMITS.metaDescription.optimal}
                      pixelWidth={{
                        current: measureTextWidth(field.value || '', SERP_FONTS.description),
                        max: SEO_LIMITS.metaDescription.pixelWidth.max,
                      }}
                      variant="inline"
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="SEO description (120-160 characters)"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (keywordInput.trim()) {
                            field.onChange([...(field.value || []), keywordInput.trim()]);
                            setKeywordInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (keywordInput.trim()) {
                          field.onChange([...(field.value || []), keywordInput.trim()]);
                          setKeywordInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((keyword: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {keyword}
                        <button
                          type="button"
                          className="ml-2"
                          onClick={() => {
                            field.onChange(
                              field.value?.filter((_: string, idx: number) => idx !== i)
                            );
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Publish Settings and Scheduled Publishing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publish Settings */}
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
          </CardContent>
        </Card>

        {/* Scheduled Publishing */}
        {canSchedule && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isScheduled && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Scheduled for publication
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {format(new Date(currentScheduledDate!), 'PPP')} at{' '}
                          {format(new Date(currentScheduledDate!), 'p')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSchedule}
                      disabled={isSaving}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date and Time</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateString}
                    onChange={handleDateChange}
                    disabled={isSaving}
                    min={format(minDate, 'yyyy-MM-dd')}
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="time"
                    value={timeString}
                    onChange={handleTimeChange}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                {selectedDate && selectedDate <= new Date() && (
                  <p className="text-xs text-destructive">Please select a future date and time</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSchedule}
                disabled={!selectedDate || selectedDate <= new Date() || isSaving}
                className="w-full"
                variant="secondary"
              >
                {isSaving ? 'Scheduling...' : isScheduled ? 'Update Schedule' : 'Schedule Publish'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button type="button" onClick={handleSubmit} disabled={isSaving}>
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
