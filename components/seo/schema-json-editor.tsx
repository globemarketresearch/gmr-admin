'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormDescription } from '@/components/ui/form';
import { SCHEMA_TEMPLATES, type SchemaTemplateType } from '@/lib/config/seo';

interface SchemaJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  contentType: 'blog' | 'report';
  contentData?: {
    title: string;
    description: string;
    author?: string;
    organization?: string;
    publishDate?: string;
    category?: string;
  };
}

export function SchemaJsonEditor({ value, onChange, contentData }: SchemaJsonEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setError(null);
    } catch {
      setError('Invalid JSON format');
    }
  };

  const handleLoadTemplate = (templateType: SchemaTemplateType) => {
    if (!contentData) {
      setError('Content data not available');
      return;
    }

    const template = SCHEMA_TEMPLATES[templateType](contentData);
    onChange(JSON.stringify(template, null, 2));
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select onValueChange={v => handleLoadTemplate(v as SchemaTemplateType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Load template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="newsArticle">News Article</SelectItem>
            <SelectItem value="report">Report</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" size="sm" onClick={handleFormat}>
          Format JSON
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setError(null);
        }}
        placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
        className="font-mono text-xs min-h-[200px]"
        onBlur={() => {
          if (value) {
            try {
              JSON.parse(value);
              setError(null);
            } catch {
              setError('Invalid JSON format');
            }
          }
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <FormDescription>
        Add Schema.org structured data (JSON-LD) for rich search results.{' '}
        <a
          href="https://schema.org/Article"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Learn more
        </a>
      </FormDescription>
    </div>
  );
}
