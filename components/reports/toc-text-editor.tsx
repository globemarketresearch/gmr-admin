'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type {
  TableOfContentsStructure,
  TOCChapter,
  TOCSection,
  TOCSubsection,
} from '@/lib/types/reports';

interface TOCTextEditorProps {
  value: TableOfContentsStructure;
  onChange: (value: TableOfContentsStructure) => void;
}

let globalIdCounter = 0;

/**
 * Parse text format TOC into structured format
 * Expected format:
 * Chapter 1. Title
 *   1.1 Section Title
 *   1.2 Another Section
 *     1.2.1 Subsection Title
 *     1.2.2 Another Subsection
 */
function parseTextToTOC(text: string): TableOfContentsStructure {
  const lines = text.split('\n').map(line => line.trimEnd());
  const chapters: TOCChapter[] = [];
  let currentChapter: TOCChapter | null = null;
  let currentSection: TOCSection | null = null;

  // Use a global counter for stable IDs across re-renders
  const generateId = (type: string) => `${type}-${++globalIdCounter}`;

  for (const line of lines) {
    if (!line.trim()) continue;

    const trimmedLine = line.trim();

    // Subsection pattern: 1.1.1 Title or 1.1.1. Title
    // Checked first so it takes priority over the section pattern
    const subsectionMatch = trimmedLine.match(/^(\d+)\.(\d+)\.(\d+)\.?\s+(.+)$/);
    if (subsectionMatch && currentSection) {
      const [, chapterNum, sectionNum, subsectionNum, title] = subsectionMatch;
      const subsection: TOCSubsection = {
        id: generateId(`subsection-${chapterNum}-${sectionNum}-${subsectionNum}`),
        title: title.trim(),
      };
      currentSection.subsections.push(subsection);
      continue;
    }

    // Section pattern: 1.1 Title or 1.1. Title
    // The regex cannot match 3-number patterns (e.g. 1.1.1.) so subsections won't fall through here
    const sectionMatch = trimmedLine.match(/^(\d+)\.(\d+)\.?\s+(.+)$/);
    if (sectionMatch && currentChapter) {
      const [, chapterNum, sectionNum, title] = sectionMatch;
      currentSection = {
        id: generateId(`section-${chapterNum}-${sectionNum}`),
        title: title.trim(),
        subsections: [],
      };
      currentChapter.sections.push(currentSection);
      continue;
    }

    // Chapter pattern: Chapter 1. Title or 1. Title
    // Negative lookahead (?!\d) prevents matching section patterns like "1.1. Title"
    const chapterMatch = trimmedLine.match(/^(?:Chapter\s+)?(\d+)\.(?!\d)\s*(.+)$/i);
    if (chapterMatch) {
      const [, chapterNum, title] = chapterMatch;
      currentChapter = {
        id: generateId(`chapter-${chapterNum}`),
        title: title.trim(),
        sections: [],
      };
      chapters.push(currentChapter);
      currentSection = null;
      continue;
    }
  }

  return { chapters };
}

/**
 * Convert structured TOC to text format
 */
export function tocToText(toc: TableOfContentsStructure): string {
  if (!toc.chapters || toc.chapters.length === 0) return '';

  const lines: string[] = [];

  toc.chapters.forEach((chapter, chapterIndex) => {
    const chapterNum = chapterIndex + 1;
    lines.push(`Chapter ${chapterNum}. ${chapter.title}`);

    chapter.sections.forEach((section, sectionIndex) => {
      const sectionNum = sectionIndex + 1;
      lines.push(`  ${chapterNum}.${sectionNum} ${section.title}`);

      section.subsections.forEach((subsection, subsectionIndex) => {
        const subsectionNum = subsectionIndex + 1;
        lines.push(`    ${chapterNum}.${sectionNum}.${subsectionNum} ${subsection.title}`);
      });
    });
  });

  return lines.join('\n');
}

export function TOCTextEditor({ value, onChange }: TOCTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [textValue, setTextValue] = useState(() => tocToText(value));
  const [parseError, setParseError] = useState<string | null>(null);

  // Track the last TOC structure we pushed via onChange so we can distinguish
  // between our own updates and external changes (e.g. "Generate from Template")
  const lastPushedTOC = useRef<string>(JSON.stringify(value));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only sync text from the prop when the value was changed externally
  useEffect(() => {
    const incoming = JSON.stringify(value);
    if (incoming !== lastPushedTOC.current) {
      lastPushedTOC.current = incoming;
      setTextValue(tocToText(value));
    }
  }, [value]);

  if (!isMounted) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const handleTextChange = (newText: string) => {
    setTextValue(newText);

    // Real-time parsing and validation
    try {
      const parsed = parseTextToTOC(newText);
      // Record what we're pushing so the effect doesn't echo it back
      lastPushedTOC.current = JSON.stringify(parsed);
      onChange(parsed);
      setParseError(null);
    } catch (error) {
      setParseError('Invalid format. Please check the guide below.');
      console.error('TOC parse error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-muted/50 p-3 text-xs space-y-1">
        <p className="font-medium">Format Guide:</p>
        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
          <li>
            Chapters: <code className="bg-background px-1 rounded">Chapter 1. Title</code> or{' '}
            <code className="bg-background px-1 rounded">1. Title</code> (no indentation)
          </li>
          <li>
            Sections: <code className="bg-background px-1 rounded">1.1 Section Title</code> (2
            spaces indent)
          </li>
          <li>
            Subsections: <code className="bg-background px-1 rounded">1.1.1 Subsection Title</code>{' '}
            (4 spaces indent)
          </li>
        </ul>
        <p className="text-muted-foreground pt-1">Changes are saved automatically as you type.</p>
      </div>

      <Textarea
        value={textValue}
        onChange={e => handleTextChange(e.target.value)}
        className="font-mono text-sm min-h-[500px]"
        placeholder="Chapter 1. Preface&#10;  1.1 Report Description and Scope&#10;  1.2 Research scope&#10;  1.3 Research methodology&#10;    1.3.1 Market Research Type&#10;    1.3.2 Market research methodology&#10;Chapter 2. Executive Summary&#10;  2.1 Global Market&#10;  2.2 Market Snapshot"
      />
    </div>
  );
}
