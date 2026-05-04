'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import type {
  TableOfContentsStructure,
  TOCChapter,
  TOCSection,
  TOCSubsection,
} from '@/lib/types/reports';

interface TOCEditorProps {
  value: TableOfContentsStructure;
  onChange: (value: TableOfContentsStructure) => void;
}

export function TOCEditor({ value, onChange }: TOCEditorProps) {
  // Ensure value has the correct structure
  const tocValue = value || { chapters: [] };
  const chapters = tocValue.chapters || [];

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Auto-expand all chapters when component mounts with existing data
  useEffect(() => {
    if (chapters.length > 0 && expandedChapters.size === 0) {
      const allChapterIds = chapters.map(chapter => chapter.id);
      setExpandedChapters(new Set(allChapterIds));
    }
  }, [chapters, expandedChapters.size]); // Added missing dependencies

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const addChapter = () => {
    const newChapter: TOCChapter = {
      id: crypto.randomUUID(),
      title: '',
      sections: [],
    };
    onChange({
      chapters: [...chapters, newChapter],
    });
    // Auto-expand newly added chapter
    setExpandedChapters(new Set([...expandedChapters, newChapter.id]));
  };

  const updateChapter = (chapterId: string, updates: Partial<TOCChapter>) => {
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, ...updates } : chapter
      ),
    });
  };

  const deleteChapter = (chapterId: string) => {
    onChange({
      chapters: chapters.filter(chapter => chapter.id !== chapterId),
    });
    // Remove from expanded set
    const newExpanded = new Set(expandedChapters);
    newExpanded.delete(chapterId);
    setExpandedChapters(newExpanded);
  };

  const addSection = (chapterId: string) => {
    const newSection: TOCSection = {
      id: crypto.randomUUID(),
      title: '',
      subsections: [],
    };
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, sections: [...chapter.sections, newSection] }
          : chapter
      ),
    });
  };

  const updateSection = (chapterId: string, sectionId: string, updates: Partial<TOCSection>) => {
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
              ),
            }
          : chapter
      ),
    });
  };

  const deleteSection = (chapterId: string, sectionId: string) => {
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.filter(section => section.id !== sectionId),
            }
          : chapter
      ),
    });
  };

  const addSubsection = (chapterId: string, sectionId: string) => {
    const newSubsection: TOCSubsection = {
      id: crypto.randomUUID(),
      title: '',
    };
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.map(section =>
                section.id === sectionId
                  ? { ...section, subsections: [...section.subsections, newSubsection] }
                  : section
              ),
            }
          : chapter
      ),
    });
  };

  const updateSubsection = (
    chapterId: string,
    sectionId: string,
    subsectionId: string,
    updates: Partial<TOCSubsection>
  ) => {
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.map(section =>
                section.id === sectionId
                  ? {
                      ...section,
                      subsections: section.subsections.map(subsection =>
                        subsection.id === subsectionId ? { ...subsection, ...updates } : subsection
                      ),
                    }
                  : section
              ),
            }
          : chapter
      ),
    });
  };

  const deleteSubsection = (chapterId: string, sectionId: string, subsectionId: string) => {
    onChange({
      chapters: chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              sections: chapter.sections.map(section =>
                section.id === sectionId
                  ? {
                      ...section,
                      subsections: section.subsections.filter(
                        subsection => subsection.id !== subsectionId
                      ),
                    }
                  : section
              ),
            }
          : chapter
      ),
    });
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No chapters added yet. Click &ldquo;Add Chapter&rdquo; to start building your table of
            contents.
          </p>
          <Button type="button" onClick={addChapter} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters.has(chapter.id);
        return (
          <Card key={chapter.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleChapter(chapter.id)}
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Chapter ${chapterIndex + 1} title...`}
                  value={chapter.title}
                  onChange={e => updateChapter(chapter.id, { title: e.target.value })}
                  className="flex-1 font-semibold"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteChapter(chapter.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3">
                {chapter.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={`Section ${chapterIndex + 1}.${sectionIndex + 1} title...`}
                        value={section.title}
                        onChange={e =>
                          updateSection(chapter.id, section.id, { title: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSection(chapter.id, section.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {section.subsections.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {section.subsections.map((subsection, subsectionIndex) => (
                          <div key={subsection.id} className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">•</span>
                            <Input
                              placeholder={`Subsection ${chapterIndex + 1}.${sectionIndex + 1}.${subsectionIndex + 1} title...`}
                              value={subsection.title}
                              onChange={e =>
                                updateSubsection(chapter.id, section.id, subsection.id, {
                                  title: e.target.value,
                                })
                              }
                              className="flex-1 text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteSubsection(chapter.id, section.id, subsection.id)
                              }
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ml-8">
                      <Button
                        type="button"
                        onClick={() => addSubsection(chapter.id, section.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Subsection
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="ml-8 pt-2">
                  <Button
                    type="button"
                    onClick={() => addSection(chapter.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Button type="button" onClick={addChapter} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Chapter
      </Button>
    </div>
  );
}
