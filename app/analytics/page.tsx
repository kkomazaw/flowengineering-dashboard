"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDashboardStore, useFilteredWorkItems } from "@/store/dashboard-store";
import { aggregateByInterval, TimeInterval } from "@/lib/time-series";
import { detectBottlenecks } from "@/lib/bottleneck-detection";
import { calculateValueStreamMetrics } from "@/lib/metrics";
import { TrendChart } from "@/components/analytics/TrendChart";
import { BottleneckAlert } from "@/components/analytics/BottleneckAlert";

export default function AnalyticsPage() {
  const config = useDashboardStore((state) => state.config);
  const filters = useDashboardStore((state) => state.filters);
  const filteredItems = useFilteredWorkItems();

  const [interval, setInterval] = useState<TimeInterval>("week");
  const [selectedPeriod, setSelectedPeriod] = useState<"1m" | "3m" | "6m" | "1y">("3m");

  // Calculate date range based on selected period
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    switch (selectedPeriod) {
      case "1m":
        start.setMonth(start.getMonth() - 1);
        break;
      case "3m":
        start.setMonth(start.getMonth() - 3);
        break;
      case "6m":
        start.setMonth(start.getMonth() - 6);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  };

  const { start, end } = getDateRange();

  // Aggregate data for trends
  const trendData = aggregateByInterval(filteredItems, start, end, interval);

  // Calculate current metrics
  const currentMetrics = calculateValueStreamMetrics(
    filteredItems,
    config.stages
  );

  // Detect bottlenecks
  const bottlenecks = detectBottlenecks(currentMetrics);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Advanced Analytics
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Trend analysis, bottleneck detection, and predictions
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {(["1m", "3m", "6m", "1y"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === period
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Interval Selector */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {(["week", "month"] as const).map((int) => (
                  <button
                    key={int}
                    onClick={() => setInterval(int)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      interval === int
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {int === "week" ? "Weekly" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Bottleneck Alerts */}
        <section>
          <BottleneckAlert bottlenecks={bottlenecks} />
        </section>

        {/* Trend Charts */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Metric Trends
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              data={trendData}
              metric="leadTime"
              title="Lead Time Trend"
              color="#3b82f6"
            />
            <TrendChart
              data={trendData}
              metric="cycleTime"
              title="Cycle Time Trend"
              color="#8b5cf6"
            />
            <TrendChart
              data={trendData}
              metric="throughput"
              title="Throughput Trend"
              color="#10b981"
            />
            <TrendChart
              data={trendData}
              metric="flowEfficiency"
              title="Flow Efficiency Trend"
              color="#f59e0b"
            />
          </div>
        </section>

        {/* Summary Statistics */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Summary Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Items Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredItems.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredItems.filter((i) => i.completedAt).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredItems.filter((i) => !i.completedAt).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Bottlenecks</p>
              <p className={`text-2xl font-bold mt-1 ${bottlenecks.length > 0 ? "text-red-600" : "text-green-600"}`}>
                {bottlenecks.length}
              </p>
            </div>
          </div>
        </section>

        {/* Insights */}
        {trendData.length > 0 && (
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Key Insights
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-blue-800">
                <span className="mr-2">📊</span>
                <span>
                  Analyzing {trendData.length} data points over the selected
                  period ({selectedPeriod.toUpperCase()})
                </span>
              </li>
              {bottlenecks.length > 0 && (
                <li className="flex items-start text-sm text-blue-800">
                  <span className="mr-2">⚠️</span>
                  <span>
                    {bottlenecks.filter((b) => b.severity === "high").length}{" "}
                    high-severity bottleneck
                    {bottlenecks.filter((b) => b.severity === "high").length !==
                    1
                      ? "s"
                      : ""}{" "}
                    detected - focus on these for maximum impact
                  </span>
                </li>
              )}
              <li className="flex items-start text-sm text-blue-800">
                <span className="mr-2">💡</span>
                <span>
                  Use the trend charts to identify patterns and predict future
                  performance
                </span>
              </li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
