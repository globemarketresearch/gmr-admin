'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SitemapManager } from './components/sitemap-manager';
import { RobotsTxtEditor } from './components/robots-txt-editor';
import { useSEO } from '@/hooks/use-seo';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/stats-cards-skeleton';
import { Search, FileText, Image, Code } from 'lucide-react';

export default function SEOManagementPage() {
  const { stats, isLoading, fetchStats } = useSEO();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Management</h1>
        <p className="text-muted-foreground">
          Manage your website&apos;s SEO settings, sitemap, and search engine visibility
        </p>
      </div>

      {/* SEO Stats Overview */}
      {isLoading && !stats ? (
        <StatsCardsSkeleton count={4} columns={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalIndexedPages || 0}</div>
              <p className="text-xs text-muted-foreground">Indexed pages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Descriptions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pagesWithMetaDescription || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalIndexedPages
                  ? Math.round(
                      ((stats?.pagesWithMetaDescription || 0) / stats.totalIndexedPages) * 100
                    )
                  : 0}
                % coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OG Images</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pagesWithOGImage || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalIndexedPages
                  ? Math.round(((stats?.pagesWithOGImage || 0) / stats.totalIndexedPages) * 100)
                  : 0}
                % coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Structured Data</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pagesWithSchema || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalIndexedPages
                  ? Math.round(((stats?.pagesWithSchema || 0) / stats.totalIndexedPages) * 100)
                  : 0}
                % coverage
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Quality Metrics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Quality Metrics</CardTitle>
            <CardDescription>Average character lengths for meta tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Meta Title Length</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.averageMetaTitleLength / 60) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono">{stats.averageMetaTitleLength}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Optimal: 50-60 characters</p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Meta Description Length</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.averageMetaDescriptionLength / 160) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono">{stats.averageMetaDescriptionLength}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Optimal: 150-160 characters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sitemap Management */}
      <SitemapManager />

      {/* Robots.txt Editor */}
      <RobotsTxtEditor />
    </div>
  );
}
