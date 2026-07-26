'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchLinkSuggestions, type LinkSuggestionItem } from '@/lib/api/reports.api';
import { cn } from '@/lib/utils';

interface ReportSelectorProps {
  value?: number | null;
  onChange: (report: LinkSuggestionItem | null) => void;
  initialLabel?: string;
  disabled?: boolean;
}

export function ReportSelector({
  value,
  onChange,
  initialLabel,
  disabled = false,
}: ReportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<LinkSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetchLinkSuggestions();
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReport = reports.find(r => r.id === value);
  const triggerLabel = selectedReport?.title ?? (value ? initialLabel : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {triggerLabel ? (
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{triggerLabel}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              Select report...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search reports..." />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading reports...</CommandEmpty>
            ) : reports.length === 0 ? (
              <CommandEmpty>No published reports found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {value !== undefined && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear selection
                  </CommandItem>
                )}
                {reports.map(rep => (
                  <CommandItem
                    key={rep.id}
                    value={rep.title}
                    onSelect={() => {
                      onChange(rep);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', value === rep.id ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="truncate">{rep.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
