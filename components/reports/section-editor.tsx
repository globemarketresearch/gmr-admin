'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TiptapEditor } from './tiptap-editor';
import { AutoLinkReportsPanel } from '@/components/editor/auto-link-reports-panel';
import { REPORT_SECTIONS } from '@/lib/config/reports';
import type { ReportSectionKey, InternalLinkEntry } from '@/lib/types/reports';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionEditorProps {
  sections: any;
  onChange: (sections: any) => void;
  reportId?: number | string;
  onInternalLinksChange?: (links: InternalLinkEntry[]) => void;
  initialLinks?: InternalLinkEntry[];
  /** Settings for the "Auto-link reports" panel under Market Details. */
  autoLink?: {
    selfTitle?: string;
    categoryId?: number | string | null;
    /** Sync internal_links from the content on load (new reports) vs. only after use (older ones). */
    syncOnLoad?: boolean;
  };
}

export function SectionEditor({
  sections,
  onChange,
  reportId,
  onInternalLinksChange,
  initialLinks,
  autoLink,
}: SectionEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<ReportSectionKey>>(
    new Set(REPORT_SECTIONS.map(section => section.key))
  );

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
                />
                {section.key === 'marketDetails' && (
                  <AutoLinkReportsPanel
                    html={(sections.marketDetails as string) || ''}
                    onHtmlChange={content => handleSectionChange('marketDetails', content)}
                    onLinksChange={onInternalLinksChange}
                    initialLinks={initialLinks}
                    excludeReportId={reportId}
                    selfTitle={autoLink?.selfTitle}
                    categoryId={autoLink?.categoryId}
                    syncOnLoad={autoLink?.syncOnLoad ?? true}
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
