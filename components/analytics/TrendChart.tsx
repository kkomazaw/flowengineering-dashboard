"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TimeSeriesDataPoint } from "@/lib/time-series";

interface TrendChartProps {
  data: TimeSeriesDataPoint[];
  metric: "leadTime" | "cycleTime" | "throughput" | "flowEfficiency";
  title: string;
  color?: string;
}

export function TrendChart({
  data,
  metric,
  title,
  color = "#3b82f6",
}: TrendChartProps) {
  const formatYAxis = (value: number) => {
    if (metric === "flowEfficiency") {
      return `${value.toFixed(0)}%`;
    }
    if (metric === "throughput") {
      return value.toFixed(0);
    }
    return `${value.toFixed(1)}d`;
  };

  const formatTooltip = (value: number) => {
    if (metric === "flowEfficiency") {
      return `${value.toFixed(1)}%`;
    }
    if (metric === "throughput") {
      return `${value} items`;
    }
    return `${value.toFixed(1)} days`;
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              formatter={(value: number) => [formatTooltip(value), title]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Average:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatTooltip(
                  data.reduce((sum, d) => sum + d[metric], 0) / data.length
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Min:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatTooltip(Math.min(...data.map((d) => d[metric])))}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatTooltip(Math.max(...data.map((d) => d[metric])))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
