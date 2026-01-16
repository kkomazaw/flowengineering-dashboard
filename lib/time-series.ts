import {
  startOfWeek,
  startOfMonth,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  differenceInDays,
} from "date-fns";
import { WorkItem } from "@/types";

export interface TimeSeriesDataPoint {
  date: Date;
  dateLabel: string;
  leadTime: number;
  cycleTime: number;
  throughput: number;
  flowEfficiency: number;
}

export type TimeInterval = "week" | "month";

/**
 * Aggregate work items by time intervals (week or month)
 */
export function aggregateByInterval(
  items: WorkItem[],
  startDate: Date,
  endDate: Date,
  interval: TimeInterval = "week"
): TimeSeriesDataPoint[] {
  const intervals =
    interval === "week"
      ? eachWeekOfInterval({ start: startDate, end: endDate })
      : eachMonthOfInterval({ start: startDate, end: endDate });

  return intervals.map((intervalStart) => {
    const intervalEnd = new Date(intervalStart);
    if (interval === "week") {
      intervalEnd.setDate(intervalEnd.getDate() + 7);
    } else {
      intervalEnd.setMonth(intervalEnd.getMonth() + 1);
    }

    // Get items completed in this interval
    const intervalItems = items.filter(
      (item) =>
        item.completedAt &&
        isWithinInterval(item.completedAt, {
          start: intervalStart,
          end: intervalEnd,
        })
    );

    const leadTime = calculateAverageLeadTime(intervalItems);
    const cycleTime = calculateAverageCycleTime(intervalItems);
    const flowEfficiency = calculateFlowEfficiency(intervalItems);

    return {
      date: intervalStart,
      dateLabel:
        interval === "week"
          ? formatWeekLabel(intervalStart)
          : formatMonthLabel(intervalStart),
      leadTime,
      cycleTime,
      throughput: intervalItems.length,
      flowEfficiency,
    };
  });
}

/**
 * Calculate rolling average for smoothing trend lines
 */
export function calculateRollingAverage(
  data: TimeSeriesDataPoint[],
  windowSize: number = 3
): TimeSeriesDataPoint[] {
  if (data.length < windowSize) {
    return data;
  }

  return data.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);

    return {
      ...point,
      leadTime: average(window.map((d) => d.leadTime)),
      cycleTime: average(window.map((d) => d.cycleTime)),
      throughput: average(window.map((d) => d.throughput)),
      flowEfficiency: average(window.map((d) => d.flowEfficiency)),
    };
  });
}

/**
 * Calculate trend direction (increasing, decreasing, stable)
 */
export function calculateTrend(
  data: TimeSeriesDataPoint[],
  metric: keyof Pick<
    TimeSeriesDataPoint,
    "leadTime" | "cycleTime" | "throughput" | "flowEfficiency"
  >
): {
  direction: "increasing" | "decreasing" | "stable";
  percentageChange: number;
} {
  if (data.length < 2) {
    return { direction: "stable", percentageChange: 0 };
  }

  // Compare first half average to second half average
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstAvg = average(firstHalf.map((d) => d[metric]));
  const secondAvg = average(secondHalf.map((d) => d[metric]));

  const percentageChange =
    firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  // Consider ±5% as stable
  if (Math.abs(percentageChange) < 5) {
    return { direction: "stable", percentageChange: 0 };
  }

  return {
    direction: percentageChange > 0 ? "increasing" : "decreasing",
    percentageChange,
  };
}

/**
 * Detect anomalies in time series data
 */
export function detectAnomalies(
  data: TimeSeriesDataPoint[],
  metric: keyof Pick<
    TimeSeriesDataPoint,
    "leadTime" | "cycleTime" | "throughput" | "flowEfficiency"
  >,
  threshold: number = 2
): number[] {
  const values = data.map((d) => d[metric]);
  const mean = average(values);
  const stdDev = standardDeviation(values);

  const anomalyIndices: number[] = [];

  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      anomalyIndices.push(index);
    }
  });

  return anomalyIndices;
}

/**
 * Format week label (e.g., "Week of Jan 1")
 */
function formatWeekLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return `Week of ${date.toLocaleDateString("en-US", options)}`;
}

/**
 * Format month label (e.g., "Jan 2025")
 */
function formatMonthLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Calculate average of array
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = average(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate average lead time
 */
function calculateAverageLeadTime(items: WorkItem[]): number {
  const completedItems = items.filter((i) => i.completedAt);
  if (completedItems.length === 0) return 0;

  const leadTimes = completedItems.map((item) =>
    differenceInDays(item.completedAt!, item.createdAt)
  );

  return average(leadTimes);
}

/**
 * Calculate average cycle time
 */
function calculateAverageCycleTime(items: WorkItem[]): number {
  const completedItems = items.filter((i) => i.completedAt && i.startedAt);
  if (completedItems.length === 0) return 0;

  const cycleTimes = completedItems.map((item) =>
    differenceInDays(item.completedAt!, item.startedAt!)
  );

  return average(cycleTimes);
}

/**
 * Calculate flow efficiency
 */
function calculateFlowEfficiency(items: WorkItem[]): number {
  // Active stages where actual work happens
  const activeStages = ["build", "test"];

  let totalActiveTime = 0;
  let totalCycleTime = 0;

  items.forEach((item) => {
    if (!item.completedAt || !item.startedAt) return;

    const cycleTime = differenceInDays(item.completedAt, item.startedAt);
    totalCycleTime += cycleTime;

    // Sum time in active stages
    const activeTime = item.stageHistory
      .filter((h) => activeStages.includes(h.stageId) && h.durationMs)
      .reduce((sum, h) => sum + (h.durationMs || 0), 0);

    // Convert ms to days
    totalActiveTime += activeTime / (1000 * 60 * 60 * 24);
  });

  if (totalCycleTime === 0) return 0;
  return (totalActiveTime / totalCycleTime) * 100;
}
