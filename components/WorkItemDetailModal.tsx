"use client";

import { WorkItem } from "@/types";
import { format } from "date-fns";

interface WorkItemDetailModalProps {
  workItem: WorkItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkItemDetailModal({
  workItem,
  isOpen,
  onClose,
}: WorkItemDetailModalProps) {
  if (!isOpen || !workItem) return null;

  const getWorkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-100 text-blue-800 border-blue-200",
      bug: "bg-red-100 text-red-800 border-red-200",
      "tech-debt": "bg-purple-100 text-purple-800 border-purple-200",
      spike: "bg-yellow-100 text-yellow-800 border-yellow-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || colors.other;
  };

  const calculateLeadTime = () => {
    if (!workItem.completedAt) return "In progress";
    const durationMs =
      workItem.completedAt.getTime() - workItem.createdAt.getTime();
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const calculateCycleTime = () => {
    if (!workItem.completedAt || !workItem.startedAt) return "N/A";
    const durationMs =
      workItem.completedAt.getTime() - workItem.startedAt.getTime();
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-mono text-gray-600">
                  {workItem.key}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded border ${getWorkTypeColor(
                    workItem.type
                  )}`}
                >
                  {workItem.type}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {workItem.title}
              </h2>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Lead Time</p>
              <p className="text-2xl font-bold text-blue-900">
                {calculateLeadTime()}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Cycle Time</p>
              <p className="text-2xl font-bold text-green-900">
                {calculateCycleTime()}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <p className="text-gray-900">{workItem.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Current Stage
                </p>
                <p className="text-gray-900">{workItem.currentStage}</p>
              </div>
            </div>

            {workItem.assignee && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Assignee
                </p>
                <p className="text-gray-900">👤 {workItem.assignee}</p>
              </div>
            )}

            {workItem.team && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Team</p>
                <p className="text-gray-900">🏢 {workItem.team}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Created
                </p>
                <p className="text-gray-900">
                  {format(workItem.createdAt, "PPP")}
                </p>
              </div>
              {workItem.completedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Completed
                  </p>
                  <p className="text-gray-900">
                    {format(workItem.completedAt, "PPP")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Labels */}
          {workItem.labels.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Labels</p>
              <div className="flex flex-wrap gap-2">
                {workItem.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stage History Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stage History
            </h3>
            <div className="space-y-3">
              {workItem.stageHistory.map((transition, idx) => {
                const duration = transition.durationMs
                  ? Math.round(transition.durationMs / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 border-l-2 border-gray-300 pl-4 pb-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {transition.stageName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(transition.enteredAt, "PPP p")}
                        {transition.exitedAt &&
                          ` → ${format(transition.exitedAt, "PPP p")}`}
                      </p>
                      {duration !== null && (
                        <p className="text-sm text-gray-500 mt-1">
                          Duration: {duration} days
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
