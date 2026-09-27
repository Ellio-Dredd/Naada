'use client';

import React from 'react';

export function SongViewerSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 pt-2 pb-44 animate-fade-in space-y-8">
      {/* Top back & toggles */}
      <div className="flex items-center justify-between">
        <div className="w-28 h-7 rounded-full skeleton-shimmer" />
        <div className="flex items-center gap-2">
          <div className="w-20 h-7 rounded-full skeleton-shimmer" />
          <div className="w-28 h-7 rounded-full skeleton-shimmer" />
        </div>
      </div>

      {/* Title & Artist */}
      <div className="space-y-3 pt-2">
        <div className="w-2/3 h-10 rounded-2xl skeleton-shimmer" />
        <div className="w-1/3 h-5 rounded-lg skeleton-shimmer" />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 pt-1">
        <div className="w-24 h-7 rounded-xl skeleton-shimmer" />
        <div className="w-28 h-7 rounded-xl skeleton-shimmer" />
      </div>

      <div className="h-px bg-purple-100 my-6" />

      {/* Manuscript Lines */}
      <div className="space-y-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`sheet-skel-${i}`} className="space-y-2">
            <div className="flex gap-4">
              <div className="w-10 h-5 rounded skeleton-shimmer" />
              <div className="w-10 h-5 rounded skeleton-shimmer" />
              <div className="w-10 h-5 rounded skeleton-shimmer" />
            </div>
            <div className="w-full h-6 rounded-md skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
