import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface FormSkeletonProps {
  sections?: number;
  fieldsPerSection?: number;
  showTabs?: boolean;
}

export function FormSkeleton({
  sections = 1,
  fieldsPerSection = 4,
  showTabs = false,
}: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {showTabs && (
        <div className="flex gap-2 border-b">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32" />
          ))}
        </div>
      )}

      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
