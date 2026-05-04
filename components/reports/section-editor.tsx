'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TiptapEditor } from './tiptap-editor';
import { InternalLinkPanel } from '@/components/editor/internal-link-panel';
import { REPORT_SECTIONS } from '@/lib/config/reports';
import type { ReportSectionKey, InternalLinkEntry } from '@/lib/types/reports';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TiptapEditorLike } from '@/hooks/use-internal-link-keywords';

interface SectionEditorProps {
  sections: any;
  onChange: (sections: any) => void;
  reportId?: number | string;
  onInternalLinksChange?: (links: InternalLinkEntry[]) => void;
  initialLinks?: InternalLinkEntry[];
}

export function SectionEditor({
  sections,
  onChange,
  reportId,
  onInternalLinksChange,
  initialLinks,
}: SectionEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<ReportSectionKey>>(
    new Set(REPORT_SECTIONS.map(section => section.key))
  );
  const [marketDetailsEditor, setMarketDetailsEditor] = useState<TiptapEditorLike | null>(null);

  const toggleSection = (key: ReportSectionKey) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSectionChange = (key: ReportSectionKey, content: string) => {
    onChange({
      ...sections,
      [key]: content,
    });
  };

  return (
    <div className="space-y-4">
      {REPORT_SECTIONS.map(section => {
        const isExpanded = expandedSections.has(section.key);
        const sectionValue = sections[section.key];
        const hasContent =
          typeof sectionValue === 'string'
            ? sectionValue.trim().length > 0
            : Array.isArray(sectionValue)
              ? sectionValue.length > 0
              : sectionValue && typeof sectionValue === 'object' && 'chapters' in sectionValue
                ? sectionValue.chapters.length > 0
                : false;

        return (
          <Card key={section.key}>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection(section.key)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{section.label}</CardTitle>
                  {section.required && <Badge variant="destructive">Required</Badge>}
                  {hasContent && <Badge variant="outline">✓</Badge>}
                </div>
                <Button variant="ghost" size="sm" type="button">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <TiptapEditor
                  content={(sections[section.key] as string) || ''}
                  onChange={content => handleSectionChange(section.key, content)}
                  placeholder={section.placeholder}
                  reportId={reportId}
                  onEditorReady={
                    section.key === 'marketDetails'
                      ? ed => setMarketDetailsEditor(ed as TiptapEditorLike | null)
                      : undefined
                  }
                />
                {section.key === 'marketDetails' && (
                  <InternalLinkPanel
                    editor={marketDetailsEditor}
                    onContentChange={content => handleSectionChange('marketDetails', content)}
                    onLinksChange={onInternalLinksChange}
                    initialLinks={initialLinks}
                  />
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
