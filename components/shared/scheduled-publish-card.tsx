'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledPublishCardProps {
  currentScheduledDate?: string;
  currentStatus: 'draft' | 'review' | 'published';
  onSchedule: (date: Date) => Promise<void>;
  onCancelSchedule: () => Promise<void>;
  isSaving: boolean;
}

export function ScheduledPublishCard({
  currentScheduledDate,
  currentStatus,
  onSchedule,
  onCancelSchedule,
  isSaving,
}: ScheduledPublishCardProps) {
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

  const isScheduled = currentScheduledDate && currentStatus !== 'published';
  const canSchedule = currentStatus !== 'published';
  const minDate = new Date();

  const handleSchedule = async () => {
    if (selectedDate) {
      // Validate that the selected date is in the future
      if (selectedDate <= new Date()) {
        alert('Please select a future date and time');
        return;
      }
      await onSchedule(selectedDate);
    }
  };

  const handleCancelSchedule = async () => {
    await onCancelSchedule();
    setSelectedDate(undefined);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Publishing
        </CardTitle>
        <CardDescription>
          {canSchedule
            ? 'Schedule automatic publication at a specific date and time'
            : 'This content is already published'}
        </CardDescription>
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
                    {format(new Date(currentScheduledDate), 'PPP')} at{' '}
                    {format(new Date(currentScheduledDate), 'p')}
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

        {canSchedule && (
          <>
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
              onClick={handleSchedule}
              disabled={!selectedDate || selectedDate <= new Date() || isSaving}
              className="w-full"
            >
              {isSaving ? 'Scheduling...' : isScheduled ? 'Update Schedule' : 'Schedule Publish'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
