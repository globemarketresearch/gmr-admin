'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save, RotateCcw, ExternalLink } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function RobotsTxtEditor() {
  const { robotsTxt, isLoading, fetchRobotsTxt, updateRobotsTxt } = useSEO();
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchRobotsTxt();
  }, [fetchRobotsTxt]);

  useEffect(() => {
    if (robotsTxt) {
      setContent(robotsTxt.content);
    }
  }, [robotsTxt]);

  const handleSave = async () => {
    await updateRobotsTxt(content);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (robotsTxt) {
      setContent(robotsTxt.content);
      setHasChanges(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== robotsTxt?.content);
  };

  if (isLoading && !robotsTxt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Robots.txt Editor</CardTitle>
          <CardDescription>Loading robots.txt...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Robots.txt Editor</CardTitle>
            <CardDescription>Control how search engines crawl your website</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/robots.txt', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About robots.txt</AlertTitle>
          <AlertDescription>
            The robots.txt file tells search engine crawlers which pages they can access. Changes
            will take effect immediately after saving.
          </AlertDescription>
        </Alert>

        <div>
          <Textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://example.com/sitemap.xml"
            className="font-mono text-sm min-h-[300px]"
          />
          {robotsTxt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last modified: {new Date(robotsTxt.lastModified).toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Common Directives</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              <code>User-agent: *</code> - Applies to all robots
            </div>
            <div>
              <code>Allow: /</code> - Allow crawling of all content
            </div>
            <div>
              <code>Disallow: /admin/</code> - Block specific directory
            </div>
            <div>
              <code>Sitemap: [URL]</code> - Location of your sitemap
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
