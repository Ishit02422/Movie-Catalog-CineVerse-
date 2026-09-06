import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/60 overflow-hidden animate-pulse"
        >
          {/* Poster Skeleton */}
          <div className="aspect-[2/3] w-full bg-slate-800/60 relative">
            <div className="absolute top-3 left-3 w-16 h-6 rounded-full bg-slate-700/60" />
            <div className="absolute top-3 right-3 w-12 h-6 rounded-full bg-slate-700/60" />
          </div>

          {/* Details Skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-4 bg-slate-800 rounded" />
              <div className="w-16 h-4 bg-slate-800 rounded" />
            </div>
            <div className="w-3/4 h-5 bg-slate-800 rounded" />
            <div className="w-full h-3.5 bg-slate-800/60 rounded" />
            <div className="w-2/3 h-3.5 bg-slate-800/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
