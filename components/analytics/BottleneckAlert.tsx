"use client";

import { BottleneckDetection } from "@/lib/bottleneck-detection";

interface BottleneckAlertProps {
  bottlenecks: BottleneckDetection[];
  onViewDetails?: (bottleneck: BottleneckDetection) => void;
}

export function BottleneckAlert({
  bottlenecks,
  onViewDetails,
}: BottleneckAlertProps) {
  if (bottlenecks.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              No Bottlenecks Detected
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Your value stream is flowing smoothly! All stages are within
              acceptable thresholds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Bottleneck Alerts
        </h3>
        <span className="text-sm text-gray-600">
          {bottlenecks.length} {bottlenecks.length === 1 ? "issue" : "issues"}{" "}
          detected
        </span>
      </div>

      {bottlenecks.map((bottleneck) => (
        <div
          key={bottleneck.stageId}
          className={`border rounded-lg p-4 ${getSeverityStyles(bottleneck.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeStyles(bottleneck.severity)}`}>
                  {bottleneck.severity.toUpperCase()}
                </span>
                <h4 className="text-base font-semibold text-gray-900">
                  {bottleneck.stageName}
                </h4>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600">WIP</p>
                  <p className={`text-lg font-bold ${bottleneck.indicators.highWIP ? "text-red-600" : "text-gray-900"}`}>
                    {bottleneck.metrics.wip}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Avg Time</p>
                  <p className={`text-lg font-bold ${bottleneck.indicators.longAverageTime ? "text-red-600" : "text-gray-900"}`}>
                    {bottleneck.metrics.averageTime.toFixed(1)}d
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Transition Efficiency</p>
                  <p className={`text-lg font-bold ${bottleneck.indicators.lowTransitionRate ? "text-red-600" : "text-gray-900"}`}>
                    {bottleneck.metrics.transitionEfficiency.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Suggestions:
                </p>
                <ul className="space-y-1">
                  {bottleneck.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-600 flex items-start"
                    >
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
                {bottleneck.suggestions.length > 2 && onViewDetails && (
                  <button
                    onClick={() => onViewDetails(bottleneck)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {bottleneck.suggestions.length} suggestions →
                  </button>
                )}
              </div>
            </div>

            <div className="ml-4 flex-shrink-0">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${getSeverityTextColor(bottleneck.severity)}`}
                >
                  {bottleneck.score.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getSeverityStyles(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "bg-red-50 border-red-300";
    case "medium":
      return "bg-yellow-50 border-yellow-300";
    case "low":
      return "bg-blue-50 border-blue-300";
  }
}

function getSeverityBadgeStyles(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-blue-100 text-blue-800";
  }
}

function getSeverityTextColor(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-blue-600";
  }
}
