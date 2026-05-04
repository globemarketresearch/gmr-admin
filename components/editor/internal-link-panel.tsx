'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Link2,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Loader2,
  FileText,
  BookOpen,
  Newspaper,
  AlertCircle,
} from 'lucide-react';
import {
  useInternalLinkKeywords,
  MAX_LINKS,
  type TiptapEditorLike,
  type InternalLinkEntry,
} from '@/hooks/use-internal-link-keywords';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_META: Record<
  InternalLinkEntry['targetType'],
  { label: string; icon: React.ElementType; color: string }
> = {
  report: { label: 'Report', icon: FileText, color: 'text-blue-600' },
  blog: { label: 'Blog', icon: BookOpen, color: 'text-emerald-600' },
  'press-release': { label: 'PR', icon: Newspaper, color: 'text-violet-600' },
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface InternalLinkPanelProps {
  editor: TiptapEditorLike | null;
  /** Called after every link insertion so the parent form can persist the new HTML. */
  onContentChange?: (html: string) => void;
  /** Called whenever the linked-entries list changes (for saving to DB). */
  onLinksChange?: (links: InternalLinkEntry[]) => void;
  /** Pre-populate from a saved record. */
  initialLinks?: InternalLinkEntry[];
}

export function InternalLinkPanel({
  editor,
  onContentChange,
  onLinksChange,
  initialLinks,
}: InternalLinkPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { entries, addKeyword, removeKeyword, getSerializable } =
    useInternalLinkKeywords(initialLinks);

  // Notify parent whenever entries change
  useEffect(() => {
    onLinksChange?.(getSerializable());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const linkedCount = entries.filter(e => e.linked !== null).length;
  const atLimit = linkedCount >= MAX_LINKS;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (atLimit) return;
    addKeyword(trimmed, editor).then(() => {
      // After linking, push new HTML to parent form so changes are captured
      if (editor) {
        onContentChange?.(editor.getHTML());
      }
    });
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader
        className="py-3 px-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(v => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Internal Links</CardTitle>
            {linkedCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {linkedCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" type="button" className="h-6 w-6 p-0">
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          {/* Keyword input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add keyword to auto-link…"
              className="h-8 text-sm"
              disabled={atLimit}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0"
              onClick={handleAdd}
              disabled={!inputValue.trim() || atLimit}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {atLimit && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Maximum of {MAX_LINKS} internal links reached. Remove one to add another.
            </p>
          )}

          {/* Linked keyword chips */}
          {entries.length > 0 && (
            <div className="space-y-1.5">
              {entries.map(entry => {
                const meta = entry.linked ? TYPE_META[entry.linked.targetType] : null;

                return (
                  <div
                    key={entry.keyword}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30 text-sm"
                  >
                    {/* Searching state */}
                    {entry.isSearching && (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-muted-foreground truncate">
                          Searching for &ldquo;{entry.keyword}&rdquo;…
                        </span>
                      </>
                    )}

                    {/* Not found state */}
                    {!entry.isSearching && entry.notFound && (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate font-medium">{entry.keyword}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          No match found
                        </span>
                      </>
                    )}

                    {/* Linked state */}
                    {!entry.isSearching && entry.linked && meta && (
                      <>
                        <meta.icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                        <span className="flex-1 min-w-0">
                          <span className="font-medium">{entry.keyword}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <span
                            className="truncate text-foreground/80"
                            title={entry.linked.targetTitle}
                          >
                            {entry.linked.targetTitle}
                          </span>
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${meta.color} border-current`}
                        >
                          {meta.label}
                        </Badge>
                        {entry.linked.linkedCount > 0 && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            ×{entry.linked.linkedCount}
                          </span>
                        )}
                      </>
                    )}

                    {/* Remove button — always visible */}
                    {!entry.isSearching && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-destructive ml-1"
                        onClick={() => removeKeyword(entry.keyword)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {entries.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              Add keywords to auto-link them to matching reports, blogs, or press releases.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
