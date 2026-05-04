'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ReportAuthor } from '@/lib/types/reports';
import { fetchAuthors } from '@/lib/api/authors';
import { cn } from '@/lib/utils';

interface MultiSelectAuthorDropdownProps {
  value: string[]; // author IDs as strings
  onChange: (authorIds: string[]) => void;
  disabled?: boolean;
}

function getAuthorInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function MultiSelectAuthorDropdown({
  value = [],
  onChange,
  disabled = false,
}: MultiSelectAuthorDropdownProps) {
  const [open, setOpen] = useState(false);
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAuthors();
      setAuthors(response.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAuthors = authors.filter(author => value.includes(String(author.id)));

  const toggleAuthor = (authorId: number) => {
    const authorIdStr = String(authorId);
    const isSelected = value.includes(authorIdStr);
    if (isSelected) {
      onChange(value.filter(id => id !== authorIdStr));
    } else {
      onChange([...value, authorIdStr]);
    }
  };

  const removeAuthor = (authorId: number) => {
    const authorIdStr = String(authorId);
    onChange(value.filter(id => id !== authorIdStr));
  };

  return (
    <div className="space-y-2">
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              {selectedAuthors.length > 0
                ? `${selectedAuthors.length} author${selectedAuthors.length > 1 ? 's' : ''} selected`
                : 'Select authors...'}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search authors..." />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Loading authors...</CommandEmpty>
              ) : authors.length === 0 ? (
                <CommandEmpty>No authors found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {authors.map(author => {
                    const isSelected = value.includes(String(author.id));
                    return (
                      <CommandItem
                        key={author.id}
                        value={author.name}
                        onSelect={() => toggleAuthor(author.id)}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                        />
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getAuthorInitials(author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{author.name}</p>
                            {author.role && (
                              <p className="text-xs text-muted-foreground">{author.role}</p>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAuthors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAuthors.map(author => (
            <Badge key={author.id} variant="secondary" className="gap-1 pr-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[10px]">
                  {getAuthorInitials(author.name)}
                </AvatarFallback>
              </Avatar>
              <span>{author.name}</span>
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-muted"
                onClick={() => removeAuthor(author.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
