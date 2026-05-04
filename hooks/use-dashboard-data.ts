'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { DashboardStats, Activity } from '@/lib/types/dashboard';
import { fetchDashboardStats, fetchRecentActivity } from '@/lib/api/dashboard';

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch both stats and activities in parallel
      const [statsData, activitiesData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(10),
      ]);

      setStats(statsData);
      setActivities(activitiesData.activities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);

      // Show toast notification for errors (but not on initial load)
      if (!showLoading) {
        toast.error(errorMessage);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial data fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refetch - don't show loading state
      fetchData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Manual refetch function (with loading state)
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    stats,
    activities,
    isLoading,
    error,
    refetch,
  };
}
