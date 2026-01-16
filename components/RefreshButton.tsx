"use client";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export default function RefreshButton({
  onRefresh,
  isLoading,
  lastUpdated,
}: RefreshButtonProps) {
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-sm text-gray-600">
          Last updated: {formatLastUpdated()}
        </span>
      )}

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
          isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <svg
          className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLoading ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  );
}
