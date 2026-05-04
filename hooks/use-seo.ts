'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  getSitemap,
  regenerateSitemap,
  getRobotsTxt,
  updateRobotsTxt,
  getSEOStats,
} from '@/lib/api/seo';
import type { SitemapData, RobotsTxtData, SEOStats } from '@/lib/types/seo';

export function useSEO() {
  const [sitemap, setSitemap] = useState<SitemapData | null>(null);
  const [robotsTxt, setRobotsTxt] = useState<RobotsTxtData | null>(null);
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSitemap = async () => {
    setIsLoading(true);
    try {
      const response = await getSitemap();
      if (response.success && response.sitemap) {
        setSitemap(response.sitemap);
      } else {
        toast.error('Failed to fetch sitemap');
      }
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      toast.error('Error fetching sitemap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setIsLoading(true);
    try {
      const response = await regenerateSitemap();
      if (response.success && response.sitemap) {
        setSitemap(response.sitemap);
        toast.success(response.message || 'Sitemap regenerated successfully');
      } else {
        toast.error('Failed to regenerate sitemap');
      }
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      toast.error('Error regenerating sitemap');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRobotsTxt = async () => {
    setIsLoading(true);
    try {
      const response = await getRobotsTxt();
      if (response.success && response.robots) {
        setRobotsTxt(response.robots);
      } else {
        toast.error('Failed to fetch robots.txt');
      }
    } catch (error) {
      console.error('Error fetching robots.txt:', error);
      toast.error('Error fetching robots.txt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRobotsTxt = async (content: string) => {
    setIsLoading(true);
    try {
      const response = await updateRobotsTxt(content);
      if (response.success && response.robots) {
        setRobotsTxt(response.robots);
        toast.success(response.message || 'robots.txt updated successfully');
      } else {
        toast.error('Failed to update robots.txt');
      }
    } catch (error) {
      console.error('Error updating robots.txt:', error);
      toast.error('Error updating robots.txt');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await getSEOStats();
      if (response.success && response.stats) {
        setStats(response.stats);
      } else {
        toast.error('Failed to fetch SEO stats');
      }
    } catch (error) {
      console.error('Error fetching SEO stats:', error);
      toast.error('Error fetching SEO stats');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sitemap,
    robotsTxt,
    stats,
    isLoading,
    fetchSitemap,
    regenerateSitemap: handleRegenerateSitemap,
    fetchRobotsTxt,
    updateRobotsTxt: handleUpdateRobotsTxt,
    fetchStats,
  };
}
