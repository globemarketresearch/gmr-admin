'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, ExternalLink } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';
import { Skeleton } from '@/components/ui/skeleton';

export function SitemapManager() {
  const { sitemap, isLoading, fetchSitemap, regenerateSitemap } = useSEO();

  useEffect(() => {
    fetchSitemap();
  }, [fetchSitemap]);

  const handleDownload = () => {
    // In a real implementation, this would download the sitemap.xml file
    window.open('/sitemap.xml', '_blank');
  };

  if (isLoading && !sitemap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Management</CardTitle>
          <CardDescription>Loading sitemap data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sitemap Management</CardTitle>
            <CardDescription>
              Manage your website&apos;s sitemap for search engine crawlers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={regenerateSitemap} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sitemap && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-2xl font-bold">{sitemap.totalUrls}</div>
                <div className="text-sm text-muted-foreground">Total URLs</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium">Last Generated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(sitemap.lastGenerated).toLocaleString()}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium">Status</div>
                <Badge variant="default" className="mt-1">
                  Active
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Recent Entries</h4>
              <div className="border rounded-lg divide-y">
                {sitemap.entries.slice(0, 5).map((entry, index) => (
                  <div key={index} className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{entry.url}</div>
                      <div className="text-xs text-muted-foreground">
                        Last modified: {new Date(entry.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {entry.changeFrequency}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(entry.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Sitemap Location</h4>
              <code className="text-sm">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/sitemap.xml`
                  : 'https://example.com/sitemap.xml'}
              </code>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
