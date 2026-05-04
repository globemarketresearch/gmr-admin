'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { TableOfContentsStructure } from '@/lib/types/reports';

interface TOCViewerProps {
  value: TableOfContentsStructure;
}

export function TOCViewer({ value }: TOCViewerProps) {
  const tocValue = value || { chapters: [] };
  const chapters = tocValue.chapters || [];

  if (!chapters || chapters.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No table of contents has been generated yet. Use &ldquo;Generate from Template&rdquo; to create one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, chapterIndex) => (
        <Card key={chapter.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="font-semibold text-base">
              {chapterIndex + 1}. {chapter.title || `Chapter ${chapterIndex + 1}`}
            </div>
          </CardHeader>

          {chapter.sections.length > 0 && (
            <CardContent className="space-y-3">
              {chapter.sections.map((section, sectionIndex) => (
                <div key={section.id} className="ml-8 space-y-2">
                  <div className="text-base">
                    {chapterIndex + 1}.{sectionIndex + 1}. {section.title || `Section ${chapterIndex + 1}.${sectionIndex + 1}`}
                  </div>

                  {section.subsections.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {section.subsections.map((subsection, subsectionIndex) => (
                        <div key={subsection.id} className="flex items-start gap-2">
                          <span className="text-gray-400 text-sm">•</span>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {chapterIndex + 1}.{sectionIndex + 1}.{subsectionIndex + 1}. {subsection.title || `Subsection ${chapterIndex + 1}.${sectionIndex + 1}.${subsectionIndex + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
