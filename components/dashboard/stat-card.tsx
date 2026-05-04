import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  change?: number;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  change,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = change !== undefined && change >= 0;
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon
              className={`h-3 w-3 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}
            />
            <span
              className={`text-xs font-medium ${
                isPositiveChange ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositiveChange ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
