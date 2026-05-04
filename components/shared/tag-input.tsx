'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BaseTag {
  id: string;
  name: string;
}

interface TagInputProps<T extends BaseTag> {
  value: T[];
  onChange: (tags: T[]) => void;
  placeholder?: string;
  fetchTags: () => Promise<{ tags: T[] }>;
  createTag: (name: string) => Promise<{ tag: T }>;
}

export function TagInput<T extends BaseTag>({
  value,
  onChange,
  placeholder = 'Add tags...',
  fetchTags,
  createTag,
}: TagInputProps<T>) {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const { tags } = await fetchTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (tag: T) => {
    const isSelected = value.some(t => t.id === tag.id);
    if (isSelected) {
      onChange(value.filter(t => t.id !== tag.id));
    } else {
      onChange([...value, tag]);
    }
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter(t => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;

    try {
      const { tag } = await createTag(newTagInput.trim());
      setAvailableTags(prev => [...prev, tag]);
      onChange([...value, tag]);
      setNewTagInput('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const filteredTags = availableTags.filter(
    tag =>
      !value.some(selected => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(newTagInput.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <Badge key={tag.id} variant="secondary" className="gap-1">
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Tag selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={newTagInput}
              onValueChange={setNewTagInput}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Loading tags...</CommandEmpty>
              ) : filteredTags.length === 0 && newTagInput ? (
                <CommandEmpty>
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      No tags found. Create &quot;{newTagInput}&quot;?
                    </p>
                    <Button type="button" size="sm" onClick={handleCreateTag} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create tag
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredTags.map(tag => (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => handleSelect(tag)}>
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value.some(t => t.id === tag.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
