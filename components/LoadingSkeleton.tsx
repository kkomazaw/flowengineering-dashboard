"use client";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg p-6 shadow-sm h-32" />

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-5 shadow-sm h-32" />
        ))}
      </div>

      {/* Value Stream Flow Skeleton */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="min-w-[160px] bg-gray-100 rounded-lg h-40"
            />
          ))}
        </div>
      </div>

      {/* Flow Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm h-64" />
        <div className="bg-white rounded-lg p-6 shadow-sm h-64" />
      </div>

      {/* Work Items Skeleton */}
      <div className="bg-white rounded-lg p-6 shadow-sm h-32" />
    </div>
  );
}
