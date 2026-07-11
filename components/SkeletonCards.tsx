import React from 'react';

interface SkeletonCardsProps {
  cols?: number;
  rows?: number;
  className?: string;
}

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export default function SkeletonCards({
  cols = 4,
  rows = 2,
  className = '',
}: SkeletonCardsProps) {
  const totalCards = cols * rows;
  const gridClass = colClasses[cols] || 'grid';
  const gridStyle = cols in colClasses ? {} : { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };

  return (
    <div
      className={`grid gap-4 md:gap-6 ${gridClass} ${className}`}
      style={gridStyle}
    >
      {Array.from({ length: totalCards }).map((_, index) => (
        <article
          key={index}
          className="flex flex-col w-full overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 p-3 space-y-4 animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="w-full h-32 md:h-48 bg-slate-200 rounded-lg" />

          {/* Body Content Placeholder */}
          <div className="flex flex-1 flex-col gap-3">
            {/* Brand/Category Label */}
            <div className="h-3 w-1/4 bg-slate-200 rounded" />

            {/* Title (2 lines) */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>

            {/* Description (2 lines) */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-5/6 bg-slate-100 rounded" />
            </div>

            {/* Price and CTA Button */}
            <div className="mt-auto pt-3 flex items-center justify-between gap-2">
              {/* Price */}
              <div className="space-y-1">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
              </div>

              {/* Add to Cart Button */}
              <div className="h-8 w-24 bg-slate-200 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
