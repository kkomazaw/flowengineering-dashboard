"use client";

import { Stage, StageMetrics } from "@/types";

interface ValueStreamFlowProps {
  stages: Stage[];
  stageMetrics: StageMetrics[];
  onStageClick?: (stageId: string) => void;
}

export default function ValueStreamFlow({
  stages,
  stageMetrics,
  onStageClick,
}: ValueStreamFlowProps) {
  const getMetricsForStage = (stageId: string) => {
    return stageMetrics.find((m) => m.stageId === stageId);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "bg-green-500";
    if (efficiency >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Value Stream Flow
      </h2>

      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {stages.map((stage, index) => {
          const metrics = getMetricsForStage(stage.id);
          const efficiency = metrics?.transitionEfficiency || 0;

          return (
            <div key={stage.id} className="flex items-center gap-4">
              {/* Stage Box */}
              <div
                className={`min-w-[160px] bg-gray-100 border-2 border-gray-300 rounded-lg p-4 ${
                  onStageClick ? "cursor-pointer hover:bg-gray-200" : ""
                }`}
                onClick={() => onStageClick?.(stage.id)}
              >
                <h3 className="font-semibold text-gray-900 text-center mb-2">
                  {stage.name}
                </h3>

                {metrics && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(metrics.averageTimeInStage)} Days
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        WIP: {metrics.workInProgress}
                      </p>
                    </div>

                    {/* Efficiency Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Flow</span>
                        <span>{efficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getEfficiencyColor(
                            efficiency
                          )}`}
                          style={{ width: `${efficiency}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Arrow */}
              {index < stages.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {efficiency}%
                  </div>
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
