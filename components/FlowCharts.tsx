"use client";

import { FlowDistribution, FlowContribution } from "@/types";

interface FlowChartsProps {
  distribution: FlowDistribution[];
  contribution: FlowContribution[];
}

export default function FlowCharts({
  distribution,
  contribution,
}: FlowChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Flow Distribution */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Flow Distribution
        </h3>

        <div className="space-y-3">
          {distribution.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.category}</span>
                <span className="text-gray-600">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Contribution */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Flow Contribution
        </h3>

        <div className="space-y-3">
          {contribution.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.contributor}</span>
                <span className="text-gray-600">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
