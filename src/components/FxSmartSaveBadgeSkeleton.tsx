import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface FxSmartSaveBadgeSkeletonProps {
  className?: string;
}

export function FxSmartSaveBadgeSkeleton({ className = '' }: FxSmartSaveBadgeSkeletonProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-muted/50 text-transparent gap-1 ${className}`}
    >
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </Badge>
  );
}

export default FxSmartSaveBadgeSkeleton;
