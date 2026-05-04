'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
}

export function DateTimePicker({ value, onChange, disabled, minDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = useState<string>(value ? format(value, 'HH:mm') : '10:00');

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTimeValue(format(value, 'HH:mm'));
    } else {
      setSelectedDate(undefined);
      setTimeValue('10:00');
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange(undefined);
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    setSelectedDate(combined);
    onChange(combined);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const updated = new Date(selectedDate);
      updated.setHours(hours, minutes, 0, 0);
      setSelectedDate(updated);
      onChange(updated);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={date => {
              if (!minDate) return false;
              // Disable dates before minDate (ignoring time)
              const dateOnly = new Date(date);
              dateOnly.setHours(0, 0, 0, 0);
              const minDateOnly = new Date(minDate);
              minDateOnly.setHours(0, 0, 0, 0);
              return dateOnly < minDateOnly;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="w-full">
        <Input
          type="time"
          value={timeValue}
          onChange={e => handleTimeChange(e.target.value)}
          disabled={disabled || !selectedDate}
          className="h-10"
        />
      </div>
    </div>
  );
}
