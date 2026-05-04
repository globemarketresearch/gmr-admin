'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityItem, ActivityItemSkeleton } from '@/components/dashboard/activity-item';
import { QuickActionButton } from '@/components/dashboard/quick-action-button';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { formatNumber } from '@/lib/utils/format';
import {
  FileText,
  FileEdit,
  PenSquare,
  Users,
  TrendingUp,
  MessageSquare,
  Image,
  RefreshCw,
  Megaphone,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, activities, isLoading, error, refetch } = useDashboardData();

  // Quick actions configuration with role-based filtering
  const quickActions = [
    {
      title: 'Create New Report',
      description: 'Start a new market research report',
      icon: FileText,
      href: '/reports/new',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Write Blog Post',
      description: 'Publish a new blog article',
      icon: PenSquare,
      href: '/blog/new',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Upload Media',
      description: 'Add images and charts',
      icon: Image,
      href: '/media',
      roles: ['admin', 'editor'],
    },
    {
      title: 'View Leads',
      description: 'Manage inquiries and leads',
      icon: MessageSquare,
      href: '/leads',
      roles: ['admin', 'editor'],
    },
  ];

  // Filter quick actions by user role
  const visibleActions = quickActions.filter(action =>
    action.roles.includes(user?.role || 'viewer')
  );

  // Error state - show in progress template
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.email}! Here&apos;s an overview of your admin panel.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/30">
          <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
          <p className="text-lg font-semibold mb-2">Dashboard is syncing</p>
          <p className="text-sm text-muted-foreground">
            Your dashboard data is being updated. Please wait...
          </p>
        </div>

        {/* Quick Actions still visible during sync */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visibleActions.map(action => (
                <QuickActionButton
                  key={action.href}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.email}! Here&apos;s an overview of your admin panel.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards - 7 cards in responsive grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Total Reports Card */}
        <StatCard
          title="Total Reports"
          value={stats ? stats.reports.total : 0}
          subtext={
            stats ? `${stats.reports.published} published, ${stats.reports.draft} drafts` : ''
          }
          icon={FileText}
          change={stats?.reports.change}
          isLoading={isLoading}
        />

        {/* Draft Reports Card */}
        <StatCard
          title="Draft Reports"
          value={stats ? stats.reports.draft : 0}
          subtext={stats ? 'Pending publication' : ''}
          icon={FileEdit}
          isLoading={isLoading}
        />

        {/* Blog Posts Card */}
        <StatCard
          title="Blog Posts"
          value={stats ? stats.blogs.total : 0}
          subtext={stats ? `${stats.blogs.published} published, ${stats.blogs.draft} drafts` : ''}
          icon={PenSquare}
          change={stats?.blogs.change}
          isLoading={isLoading}
        />

        {/* Press Releases Card */}
        <StatCard
          title="Press Releases"
          value={stats ? stats.pressReleases.total : 0}
          subtext={
            stats
              ? `${stats.pressReleases.published} published, ${stats.pressReleases.draft} drafts`
              : ''
          }
          icon={Megaphone}
          change={stats?.pressReleases.change}
          isLoading={isLoading}
        />

        {/* Active Users Card - Only show for admins */}
        {stats?.users && (
          <StatCard
            title="Active Users"
            value={stats ? formatNumber(stats.users.active) : 0}
            subtext={stats ? `Total: ${formatNumber(stats.users.total)}` : ''}
            icon={Users}
            change={stats?.users.change}
            isLoading={isLoading}
          />
        )}

        {/* Content Creation Card */}
        <StatCard
          title="Content This Month"
          value={
            stats
              ? stats.contentCreation.reportsThisMonth +
                stats.contentCreation.blogsThisMonth +
                stats.contentCreation.pressReleasesThisMonth
              : 0
          }
          subtext={
            stats
              ? `${stats.contentCreation.reportsThisMonth} reports, ${stats.contentCreation.blogsThisMonth} blogs`
              : ''
          }
          icon={TrendingUp}
          isLoading={isLoading}
        />

        {/* Leads Card */}
        <StatCard
          title="Total Leads"
          value={stats ? stats.leads.total : 0}
          subtext={stats ? `${stats.leads.pending} pending, ${stats.leads.recent.today} today` : ''}
          icon={MessageSquare}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <ActivityItemSkeleton key={i} />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visibleActions.map(action => (
                <QuickActionButton
                  key={action.href}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
