import { WorkItem, ValueStreamMetrics, StageMetrics } from "@/types";

export interface BottleneckDetection {
  stageId: string;
  stageName: string;
  severity: "high" | "medium" | "low";
  score: number;
  indicators: {
    highWIP: boolean;
    longAverageTime: boolean;
    lowTransitionRate: boolean;
  };
  metrics: {
    wip: number;
    averageTime: number;
    transitionEfficiency: number;
  };
  suggestions: string[];
}

export interface BottleneckThresholds {
  wipThreshold: number;
  averageTimeThreshold: number;
  transitionEfficiencyThreshold: number;
}

const DEFAULT_THRESHOLDS: BottleneckThresholds = {
  wipThreshold: 10,
  averageTimeThreshold: 5,
  transitionEfficiencyThreshold: 70,
};

/**
 * Detect bottlenecks in the value stream
 */
export function detectBottlenecks(
  metrics: ValueStreamMetrics,
  thresholds: BottleneckThresholds = DEFAULT_THRESHOLDS
): BottleneckDetection[] {
  const detections: BottleneckDetection[] = [];

  metrics.stageMetrics.forEach((stageMetric) => {
    const indicators = {
      highWIP: stageMetric.workInProgress > thresholds.wipThreshold,
      longAverageTime:
        stageMetric.averageTimeInStage > thresholds.averageTimeThreshold,
      lowTransitionRate:
        stageMetric.transitionEfficiency <
        thresholds.transitionEfficiencyThreshold,
    };

    const activeIndicators = Object.values(indicators).filter(Boolean).length;

    // Only report if at least one indicator is triggered
    if (activeIndicators > 0) {
      const score = (activeIndicators * 100) / 3;
      const severity: "high" | "medium" | "low" =
        score > 66 ? "high" : score > 33 ? "medium" : "low";

      const suggestions = generateSuggestions(
        indicators,
        stageMetric,
        thresholds
      );

      detections.push({
        stageId: stageMetric.stageId,
        stageName: stageMetric.stageName,
        severity,
        score,
        indicators,
        metrics: {
          wip: stageMetric.workInProgress,
          averageTime: stageMetric.averageTimeInStage,
          transitionEfficiency: stageMetric.transitionEfficiency,
        },
        suggestions,
      });
    }
  });

  // Sort by severity score (highest first)
  return detections.sort((a, b) => b.score - a.score);
}

/**
 * Generate actionable suggestions based on bottleneck indicators
 */
function generateSuggestions(
  indicators: {
    highWIP: boolean;
    longAverageTime: boolean;
    lowTransitionRate: boolean;
  },
  stageMetric: StageMetrics,
  thresholds: BottleneckThresholds
): string[] {
  const suggestions: string[] = [];

  if (indicators.highWIP) {
    suggestions.push(
      `Implement WIP limits: Current WIP (${stageMetric.workInProgress}) exceeds threshold (${thresholds.wipThreshold}). Consider limiting work in progress to improve flow.`
    );
    suggestions.push(
      "Pull, don't push: Ensure downstream stages are ready before moving work forward."
    );
  }

  if (indicators.longAverageTime) {
    suggestions.push(
      `Reduce batch size: Average time (${stageMetric.averageTimeInStage.toFixed(1)} days) is high. Break down work into smaller, more manageable pieces.`
    );
    suggestions.push(
      "Identify wait times: Analyze if items are actively being worked on or waiting in queue."
    );
    suggestions.push(
      "Increase capacity: Consider adding resources or improving automation in this stage."
    );
  }

  if (indicators.lowTransitionRate) {
    suggestions.push(
      `Investigate blockers: Low transition efficiency (${stageMetric.transitionEfficiency.toFixed(1)}%) suggests items are getting stuck. Identify and remove impediments.`
    );
    suggestions.push(
      "Review acceptance criteria: Ensure clear definition of done to prevent rework."
    );
    suggestions.push(
      "Improve handoffs: Work on better communication between this stage and the next."
    );
  }

  // Stage-specific suggestions
  if (stageMetric.stageName.toLowerCase().includes("test")) {
    if (indicators.longAverageTime || indicators.highWIP) {
      suggestions.push(
        "Shift left: Move testing earlier in the development process to catch issues sooner."
      );
      suggestions.push(
        "Automate testing: Increase test automation coverage to speed up validation."
      );
    }
  }

  if (stageMetric.stageName.toLowerCase().includes("build")) {
    if (indicators.longAverageTime) {
      suggestions.push(
        "Reduce technical debt: Long build times may indicate accumulating technical debt."
      );
      suggestions.push(
        "Pair programming: Consider pairing to improve code quality and reduce rework."
      );
    }
  }

  if (stageMetric.stageName.toLowerCase().includes("review")) {
    if (indicators.longAverageTime || indicators.highWIP) {
      suggestions.push(
        "Set review SLA: Establish time-boxed review periods to prevent bottlenecks."
      );
      suggestions.push(
        "Distribute review load: Ensure reviews are distributed evenly across team members."
      );
    }
  }

  return suggestions;
}

/**
 * Calculate bottleneck impact on overall flow
 */
export function calculateBottleneckImpact(
  bottleneck: BottleneckDetection,
  totalThroughput: number
): {
  estimatedDelay: number;
  percentageImpact: number;
} {
  // Estimate delay caused by this bottleneck
  const estimatedDelay = bottleneck.metrics.averageTime;

  // Calculate percentage impact on overall throughput
  const wipImpact = (bottleneck.metrics.wip / totalThroughput) * 100;
  const efficiencyImpact = 100 - bottleneck.metrics.transitionEfficiency;
  const percentageImpact = (wipImpact + efficiencyImpact) / 2;

  return {
    estimatedDelay,
    percentageImpact,
  };
}

/**
 * Predict improvement if bottleneck is resolved
 */
export function predictImprovement(
  currentMetrics: ValueStreamMetrics,
  bottleneck: BottleneckDetection
): {
  potentialLeadTimeReduction: number;
  potentialCycleTimeReduction: number;
  potentialThroughputIncrease: number;
} {
  // Simple estimation: assume resolving bottleneck reduces its time by 50%
  const timeReduction = bottleneck.metrics.averageTime * 0.5;

  // Calculate impact on overall metrics
  const potentialLeadTimeReduction =
    (timeReduction / currentMetrics.leadTime) * 100;
  const potentialCycleTimeReduction =
    (timeReduction / currentMetrics.cycleTime) * 100;

  // Throughput increase estimate based on WIP reduction
  const wipReduction = Math.max(0, bottleneck.metrics.wip - 5);
  const potentialThroughputIncrease =
    (wipReduction / currentMetrics.throughput) * 100;

  return {
    potentialLeadTimeReduction: Math.min(potentialLeadTimeReduction, 100),
    potentialCycleTimeReduction: Math.min(potentialCycleTimeReduction, 100),
    potentialThroughputIncrease: Math.min(potentialThroughputIncrease, 100),
  };
}

/**
 * Prioritize bottlenecks for resolution
 */
export function prioritizeBottlenecks(
  bottlenecks: BottleneckDetection[],
  currentMetrics: ValueStreamMetrics
): Array<
  BottleneckDetection & {
    priority: number;
    improvement: ReturnType<typeof predictImprovement>;
  }
> {
  return bottlenecks
    .map((bottleneck) => {
      const improvement = predictImprovement(currentMetrics, bottleneck);
      const impact = calculateBottleneckImpact(
        bottleneck,
        currentMetrics.throughput
      );

      // Priority score based on severity, impact, and potential improvement
      const priority =
        bottleneck.score * 0.4 +
        impact.percentageImpact * 0.3 +
        improvement.potentialLeadTimeReduction * 0.3;

      return {
        ...bottleneck,
        priority,
        improvement,
      };
    })
    .sort((a, b) => b.priority - a.priority);
}
