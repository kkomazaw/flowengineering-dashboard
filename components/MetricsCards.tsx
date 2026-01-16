"use client";

import { ValueStreamMetrics } from "@/types";

interface MetricsCardsProps {
  metrics: ValueStreamMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Lead Time",
      value: `${Math.round(metrics.leadTime)} Days`,
      description: "全体のリードタイム",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
    },
    {
      title: "Cycle Time",
      value: `${Math.round(metrics.cycleTime)} Days`,
      description: "作業開始から完了まで",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-900",
    },
    {
      title: "Flow Efficiency",
      value: `${Math.round(metrics.flowEfficiency)}%`,
      description: "Active Work / Total Time",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-900",
    },
    {
      title: "Throughput",
      value: metrics.throughput.toString(),
      description: "完了したアイテム数",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border-2 rounded-lg p-5 shadow-sm`}
        >
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {card.title}
          </h3>
          <p className={`text-3xl font-bold ${card.textColor} mb-1`}>
            {card.value}
          </p>
          <p className="text-xs text-gray-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
