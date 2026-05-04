'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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
import type { ReportAuthor } from '@/lib/types/reports';
import { fetchAuthors } from '@/lib/api/authors';
import { cn } from '@/lib/utils';

interface AuthorSelectorProps {
  value: string; // author ID
  onChange: (authorId: string) => void;
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

export function AuthorSelector({ value, onChange, disabled = false }: AuthorSelectorProps) {
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

  const selectedAuthor = authors.find(a => a.id === Number(value));

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
          {selectedAuthor ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getAuthorInitials(selectedAuthor.name)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedAuthor.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Select author...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search authors..." />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading authors...</CommandEmpty>
            ) : authors.length === 0 ? (
              <CommandEmpty>No authors found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {authors.map(author => (
                  <CommandItem
                    key={author.id}
                    value={author.name}
                    onSelect={() => {
                      onChange(String(author.id));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        Number(value) === author.id ? 'opacity-100' : 'opacity-0'
                      )}
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
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
