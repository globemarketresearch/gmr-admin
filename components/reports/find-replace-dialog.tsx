'use client';

import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Replace, ReplaceAll } from 'lucide-react';
import { toast } from 'sonner';

interface FindReplaceDialogProps {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}

export function FindReplaceDialog({ editor, open, onClose }: FindReplaceDialogProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  const highlightMatch = useCallback(
    (index: number, positions: number[]) => {
      if (positions.length === 0) return;

      const position = positions[index];
      const { state } = editor;
      const { doc } = state;

      let currentPos = 0;
      let targetPos = -1;

      doc.descendants((node, pos) => {
        if (targetPos !== -1) return false;

        if (node.isText) {
          const nodeText = node.text || '';
          const startPos = currentPos;
          const endPos = startPos + nodeText.length;

          if (position >= startPos && position < endPos) {
            targetPos = pos + (position - startPos);
            return false;
          }
          currentPos += nodeText.length;
        }
        return true;
      });

      if (targetPos !== -1) {
        const from = targetPos;
        const to = from + findText.length;

        editor.commands.setTextSelection({ from, to });
        editor.commands.scrollIntoView();
      }
    },
    [editor, findText]
  );

  const findMatches = useCallback(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const content = editor.state.doc.textContent;
    const matchPositions: number[] = [];
    let position = 0;

    while (position < content.length) {
      const index = content.indexOf(findText, position);
      if (index === -1) break;
      matchPositions.push(index);
      position = index + 1;
    }

    setMatches(matchPositions);
    if (matchPositions.length > 0) {
      setCurrentMatchIndex(0);
      highlightMatch(0, matchPositions);
    } else {
      setCurrentMatchIndex(-1);
      toast.info('No matches found');
    }
  }, [editor, findText, highlightMatch]);

  const clearHighlights = useCallback(() => {
    // Clear selection
    const { state } = editor;
    editor.commands.setTextSelection(state.selection.from);
  }, [editor]);

  useEffect(() => {
    if (open && findText) {
      findMatches();
    } else {
      setMatches([]);
      setCurrentMatchIndex(-1);
      clearHighlights();
    }
  }, [findText, open, findMatches, clearHighlights]);

  const findNext = () => {
    if (matches.length === 0) {
      findMatches();
      return;
    }

    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    highlightMatch(nextIndex, matches);
  };

  const findPrevious = () => {
    if (matches.length === 0) {
      findMatches();
      return;
    }

    const prevIndex = currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    highlightMatch(prevIndex, matches);
  };

  const replaceCurrent = () => {
    if (matches.length === 0 || currentMatchIndex === -1) {
      toast.error('No match selected');
      return;
    }

    const { state } = editor;
    const { doc } = state;
    const position = matches[currentMatchIndex];

    let currentPos = 0;
    let targetPos = -1;

    doc.descendants((node, pos) => {
      if (targetPos !== -1) return false;

      if (node.isText) {
        const nodeText = node.text || '';
        const startPos = currentPos;
        const endPos = startPos + nodeText.length;

        if (position >= startPos && position < endPos) {
          targetPos = pos + (position - startPos);
          return false;
        }
        currentPos += nodeText.length;
      }
      return true;
    });

    if (targetPos !== -1) {
      const from = targetPos;
      const to = from + findText.length;

      editor.chain().focus().setTextSelection({ from, to }).insertContent(replaceText).run();

      toast.success('Replaced 1 occurrence');

      // Update matches after replacement
      setTimeout(() => {
        findMatches();
      }, 100);
    }
  };

  const replaceAll = () => {
    if (matches.length === 0) {
      toast.error('No matches found');
      return;
    }

    const content = editor.getHTML();
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replaceText);

    editor.commands.setContent(newContent);

    const count = matches.length;
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);

    setMatches([]);
    setCurrentMatchIndex(-1);
    setFindText('');
  };

  const handleClose = () => {
    clearHighlights();
    setFindText('');
    setReplaceText('');
    setMatches([]);
    setCurrentMatchIndex(-1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
          <DialogDescription>Search for text in the editor and replace it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Find Input */}
          <div className="space-y-2">
            <Label htmlFor="find-text">Find</Label>
            <div className="flex gap-2">
              <Input
                id="find-text"
                placeholder="Enter text to find..."
                value={findText}
                onChange={e => setFindText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    findNext();
                  }
                }}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={findPrevious}
                  disabled={matches.length === 0}
                  title="Previous match"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={findNext}
                  disabled={matches.length === 0}
                  title="Next match"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {findText && (
              <p className="text-sm text-muted-foreground">
                {matches.length > 0
                  ? `${currentMatchIndex + 1} of ${matches.length} matches`
                  : 'No matches found'}
              </p>
            )}
          </div>

          {/* Replace Input */}
          <div className="space-y-2">
            <Label htmlFor="replace-text">Replace with</Label>
            <Input
              id="replace-text"
              placeholder="Enter replacement text..."
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  replaceCurrent();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={replaceCurrent}
              disabled={matches.length === 0 || currentMatchIndex === -1}
            >
              <Replace className="h-4 w-4 mr-2" />
              Replace
            </Button>
            <Button type="button" onClick={replaceAll} disabled={matches.length === 0}>
              <ReplaceAll className="h-4 w-4 mr-2" />
              Replace All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
