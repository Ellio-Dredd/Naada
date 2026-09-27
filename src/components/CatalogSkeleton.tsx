'use client';

import React from 'react';

interface CatalogSkeletonProps {
  count?: number;
}

export function CatalogSkeleton({ count = 6 }: CatalogSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="p-4 rounded-2xl border border-purple-100/80 bg-white/70 shadow-2xs space-y-3"
        >
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-5 rounded-md skeleton-shimmer" />
            <div className="w-14 h-4 rounded-md skeleton-shimmer" />
          </div>

          {/* Title and artist */}
          <div className="space-y-2 pt-1">
            <div className="w-3/4 h-5 rounded-lg skeleton-shimmer" />
            <div className="w-1/2 h-3.5 rounded-md skeleton-shimmer" />
          </div>

          {/* Card footer */}
          <div className="pt-3 border-t border-purple-50 flex items-center justify-between">
            <div className="w-16 h-3 rounded skeleton-shimmer" />
            <div className="w-10 h-4 rounded-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
