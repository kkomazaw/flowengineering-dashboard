import { WorkItem } from "@/types";
import { differenceInDays, addDays } from "date-fns";

export interface SimulationResult {
  percentile50: number;
  percentile85: number;
  percentile95: number;
  mean: number;
  min: number;
  max: number;
  distribution: number[];
}

export interface CompletionPrediction {
  completionDate50: Date;
  completionDate85: Date;
  completionDate95: Date;
  confidence: number;
  daysRemaining50: number;
  daysRemaining85: number;
  daysRemaining95: number;
}

/**
 * Run Monte Carlo simulation based on historical cycle times
 */
export function runMonteCarloSimulation(
  historicalCycleTimes: number[],
  iterations: number = 10000
): SimulationResult {
  if (historicalCycleTimes.length === 0) {
    return {
      percentile50: 0,
      percentile85: 0,
      percentile95: 0,
      mean: 0,
      min: 0,
      max: 0,
      distribution: [],
    };
  }

  const distribution: number[] = [];

  // Run simulation
  for (let i = 0; i < iterations; i++) {
    const randomIndex = Math.floor(
      Math.random() * historicalCycleTimes.length
    );
    distribution.push(historicalCycleTimes[randomIndex]);
  }

  // Sort distribution for percentile calculation
  const sorted = distribution.sort((a, b) => a - b);

  return {
    percentile50: sorted[Math.floor(iterations * 0.5)],
    percentile85: sorted[Math.floor(iterations * 0.85)],
    percentile95: sorted[Math.floor(iterations * 0.95)],
    mean: distribution.reduce((sum, val) => sum + val, 0) / iterations,
    min: Math.min(...distribution),
    max: Math.max(...distribution),
    distribution: sorted,
  };
}

/**
 * Predict completion date for a work item
 */
export function predictCompletionDate(
  item: WorkItem,
  historicalData: WorkItem[],
  referenceDate: Date = new Date()
): CompletionPrediction {
  // Filter similar items for more accurate prediction
  const similarItems = historicalData.filter(
    (h) =>
      h.type === item.type &&
      h.estimateSize === item.estimateSize &&
      h.completedAt &&
      h.startedAt
  );

  // Calculate cycle times
  const cycleTimes = similarItems.map((item) =>
    differenceInDays(item.completedAt!, item.startedAt!)
  );

  // Default prediction if insufficient data
  if (cycleTimes.length < 5) {
    const defaultDays = 7;
    return {
      completionDate50: addDays(referenceDate, defaultDays),
      completionDate85: addDays(referenceDate, defaultDays * 1.5),
      completionDate95: addDays(referenceDate, defaultDays * 2),
      confidence: 0.3,
      daysRemaining50: defaultDays,
      daysRemaining85: defaultDays * 1.5,
      daysRemaining95: defaultDays * 2,
    };
  }

  // Run simulation
  const simulation = runMonteCarloSimulation(cycleTimes);

  // Calculate completion dates
  const startDate = item.startedAt || referenceDate;
  const completionDate50 = addDays(startDate, simulation.percentile50);
  const completionDate85 = addDays(startDate, simulation.percentile85);
  const completionDate95 = addDays(startDate, simulation.percentile95);

  // Calculate days remaining from reference date
  const daysRemaining50 = Math.max(
    0,
    differenceInDays(completionDate50, referenceDate)
  );
  const daysRemaining85 = Math.max(
    0,
    differenceInDays(completionDate85, referenceDate)
  );
  const daysRemaining95 = Math.max(
    0,
    differenceInDays(completionDate95, referenceDate)
  );

  // Calculate confidence based on sample size and variance
  const confidence = calculateConfidence(cycleTimes);

  return {
    completionDate50,
    completionDate85,
    completionDate95,
    confidence,
    daysRemaining50,
    daysRemaining85,
    daysRemaining95,
  };
}

/**
 * Predict when N items will be completed
 */
export function predictBatchCompletion(
  itemCount: number,
  historicalData: WorkItem[],
  referenceDate: Date = new Date()
): CompletionPrediction {
  // Calculate historical throughput per week
  const weeklyThroughputs = calculateWeeklyThroughput(historicalData);

  if (weeklyThroughputs.length < 3) {
    const defaultWeeks = Math.ceil(itemCount / 5); // Assume 5 items per week
    const defaultDays = defaultWeeks * 7;
    return {
      completionDate50: addDays(referenceDate, defaultDays),
      completionDate85: addDays(referenceDate, defaultDays * 1.3),
      completionDate95: addDays(referenceDate, defaultDays * 1.5),
      confidence: 0.3,
      daysRemaining50: defaultDays,
      daysRemaining85: defaultDays * 1.3,
      daysRemaining95: defaultDays * 1.5,
    };
  }

  // Run simulation for batch completion
  const simulation = runBatchSimulation(itemCount, weeklyThroughputs);

  const completionDate50 = addDays(referenceDate, simulation.percentile50);
  const completionDate85 = addDays(referenceDate, simulation.percentile85);
  const completionDate95 = addDays(referenceDate, simulation.percentile95);

  return {
    completionDate50,
    completionDate85,
    completionDate95,
    confidence: calculateConfidence(weeklyThroughputs),
    daysRemaining50: simulation.percentile50,
    daysRemaining85: simulation.percentile85,
    daysRemaining95: simulation.percentile95,
  };
}

/**
 * Run simulation for batch completion
 */
function runBatchSimulation(
  itemCount: number,
  weeklyThroughputs: number[],
  iterations: number = 10000
): SimulationResult {
  const daysToComplete: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let remainingItems = itemCount;
    let weeks = 0;

    while (remainingItems > 0) {
      const randomIndex = Math.floor(Math.random() * weeklyThroughputs.length);
      const throughput = weeklyThroughputs[randomIndex];
      remainingItems -= throughput;
      weeks++;

      // Safety limit
      if (weeks > 100) break;
    }

    daysToComplete.push(weeks * 7);
  }

  const sorted = daysToComplete.sort((a, b) => a - b);

  return {
    percentile50: sorted[Math.floor(iterations * 0.5)],
    percentile85: sorted[Math.floor(iterations * 0.85)],
    percentile95: sorted[Math.floor(iterations * 0.95)],
    mean: daysToComplete.reduce((sum, val) => sum + val, 0) / iterations,
    min: Math.min(...daysToComplete),
    max: Math.max(...daysToComplete),
    distribution: sorted,
  };
}

/**
 * Calculate weekly throughput from historical data
 */
function calculateWeeklyThroughput(items: WorkItem[]): number[] {
  const completedItems = items.filter((i) => i.completedAt);

  // Group by week
  const weeklyGroups = new Map<string, number>();

  completedItems.forEach((item) => {
    const weekKey = getWeekKey(item.completedAt!);
    weeklyGroups.set(weekKey, (weeklyGroups.get(weekKey) || 0) + 1);
  });

  return Array.from(weeklyGroups.values());
}

/**
 * Get week key for grouping (YYYY-WW format)
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-${week.toString().padStart(2, "0")}`;
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Calculate confidence level based on sample size and variance
 */
function calculateConfidence(samples: number[]): number {
  if (samples.length === 0) return 0;

  // Confidence increases with sample size
  const sampleSizeScore = Math.min(samples.length / 20, 1);

  // Confidence decreases with high variance
  const variance = calculateVariance(samples);
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  const coefficientOfVariation = mean !== 0 ? Math.sqrt(variance) / mean : 1;
  const varianceScore = Math.max(0, 1 - coefficientOfVariation / 2);

  // Combined score
  return (sampleSizeScore * 0.6 + varianceScore * 0.4) * 100;
}

/**
 * Calculate variance
 */
function calculateVariance(samples: number[]): number {
  if (samples.length === 0) return 0;

  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  const squaredDiffs = samples.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / samples.length;
}
