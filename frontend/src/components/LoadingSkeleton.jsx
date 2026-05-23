export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-gray-800" />
        <div className="h-10 w-32 rounded-lg bg-gray-800" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        {/* Header row */}
        <div className="flex gap-4 p-4 bg-gray-900/50 border-b border-gray-800">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-700" />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 p-4 border-b border-gray-800/50 last:border-0">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-4 flex-1 rounded bg-gray-800"
                style={{ maxWidth: colIdx === 0 ? '60%' : '100%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
