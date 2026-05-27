import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('skeleton', className)} />
);

export const CarCardSkeleton: React.FC = () => (
  <div className="rounded-2xl overflow-hidden border bg-card">
    <Skeleton className="h-52 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CarDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-96 w-full rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);
