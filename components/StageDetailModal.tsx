"use client";

import { WorkItem, Stage } from "@/types";

interface StageDetailModalProps {
  stage: Stage;
  workItems: WorkItem[];
  isOpen: boolean;
  onClose: () => void;
  onWorkItemClick: (itemId: string) => void;
}

export default function StageDetailModal({
  stage,
  workItems,
  isOpen,
  onClose,
  onWorkItemClick,
}: StageDetailModalProps) {
  if (!isOpen) return null;

  const inProgressItems = workItems.filter((item) => !item.completedAt);
  const completedItems = workItems.filter((item) => item.completedAt);

  const getWorkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-100 text-blue-800",
      bug: "bg-red-100 text-red-800",
      "tech-debt": "bg-purple-100 text-purple-800",
      spike: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const formatDuration = (item: WorkItem) => {
    const transition = item.stageHistory.find((h) => h.stageId === stage.id);
    if (!transition) return "-";

    if (transition.exitedAt) {
      const durationMs =
        transition.exitedAt.getTime() - transition.enteredAt.getTime();
      const days = Math.round(durationMs / (1000 * 60 * 60 * 24));
      return `${days}d`;
    }

    const now = new Date();
    const durationMs = now.getTime() - transition.enteredAt.getTime();
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));
    return `${days}d (in progress)`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{stage.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {workItems.length} items • {inProgressItems.length} in progress •{" "}
              {completedItems.length} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {workItems.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No items in this stage
            </div>
          ) : (
            <div className="space-y-3">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onWorkItemClick(item.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-600">
                          {item.key}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getWorkTypeColor(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                        {!item.completedAt && (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                            In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {item.assignee && (
                          <span>👤 {item.assignee}</span>
                        )}
                        {item.team && <span>🏢 {item.team}</span>}
                        <span>⏱️ {formatDuration(item)}</span>
                      </div>
                    </div>
                  </div>

                  {item.labels.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.labels.map((label, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
