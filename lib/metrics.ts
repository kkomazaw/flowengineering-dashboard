import {
  WorkItem,
  ValueStreamMetrics,
  StageMetrics,
  Stage,
  FlowDistribution,
  FlowContribution,
} from "@/types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateValueStreamMetrics(
  workItems: WorkItem[],
  stages: Stage[]
): ValueStreamMetrics {
  const completedItems = workItems.filter((item) => item.completedAt);

  const leadTime = calculateAverageLeadTime(completedItems);
  const cycleTime = calculateAverageCycleTime(completedItems);
  const leadTimeForChanges = calculateLeadTimeForChanges(completedItems);
  const flowEfficiency = calculateFlowEfficiency(completedItems);
  const throughput = completedItems.length;

  const stageMetrics = stages.map((stage) =>
    calculateStageMetrics(stage, workItems)
  );

  return {
    leadTime,
    cycleTime,
    leadTimeForChanges,
    flowEfficiency,
    throughput,
    stageMetrics,
  };
}

function calculateAverageLeadTime(items: WorkItem[]): number {
  if (items.length === 0) return 0;

  const totalLeadTime = items.reduce((sum, item) => {
    if (!item.completedAt) return sum;
    const leadTimeMs = item.completedAt.getTime() - item.createdAt.getTime();
    return sum + leadTimeMs;
  }, 0);

  return Math.round((totalLeadTime / items.length / MS_PER_DAY) * 10) / 10;
}

function calculateAverageCycleTime(items: WorkItem[]): number {
  if (items.length === 0) return 0;

  const itemsWithStartDate = items.filter((item) => item.startedAt);
  if (itemsWithStartDate.length === 0) return 0;

  const totalCycleTime = itemsWithStartDate.reduce((sum, item) => {
    if (!item.completedAt || !item.startedAt) return sum;
    const cycleTimeMs =
      item.completedAt.getTime() - item.startedAt.getTime();
    return sum + cycleTimeMs;
  }, 0);

  return (
    Math.round((totalCycleTime / itemsWithStartDate.length / MS_PER_DAY) * 10) /
    10
  );
}

function calculateLeadTimeForChanges(items: WorkItem[]): number {
  const changes = items.filter(
    (item) => item.type === "feature" || item.type === "bug"
  );
  return calculateAverageLeadTime(changes);
}

function calculateFlowEfficiency(items: WorkItem[]): number {
  if (items.length === 0) return 0;

  const itemsWithHistory = items.filter(
    (item) => item.stageHistory.length > 0 && item.completedAt
  );
  if (itemsWithHistory.length === 0) return 0;

  let totalActiveTime = 0;
  let totalCycleTime = 0;

  itemsWithHistory.forEach((item) => {
    if (!item.completedAt) return;

    const cycleTime = item.completedAt.getTime() - item.createdAt.getTime();
    totalCycleTime += cycleTime;

    const activeTime = item.stageHistory.reduce((sum, transition) => {
      if (transition.durationMs) {
        return sum + transition.durationMs;
      }
      return sum;
    }, 0);
    totalActiveTime += activeTime;
  });

  if (totalCycleTime === 0) return 0;

  return Math.round((totalActiveTime / totalCycleTime) * 100 * 10) / 10;
}

function calculateStageMetrics(
  stage: Stage,
  workItems: WorkItem[]
): StageMetrics {
  const itemsInStage = workItems.filter((item) =>
    item.stageHistory.some((h) => h.stageId === stage.id)
  );

  const completedItemsInStage = itemsInStage.filter((item) => {
    const stageTransition = item.stageHistory.find(
      (h) => h.stageId === stage.id && h.exitedAt
    );
    return !!stageTransition;
  });

  const totalTimeInStage = completedItemsInStage.reduce((sum, item) => {
    const stageTransition = item.stageHistory.find(
      (h) => h.stageId === stage.id && h.exitedAt
    );
    if (!stageTransition || !stageTransition.exitedAt) return sum;

    const duration =
      stageTransition.exitedAt.getTime() -
      stageTransition.enteredAt.getTime();
    return sum + duration;
  }, 0);

  const averageTimeInStage =
    completedItemsInStage.length > 0
      ? Math.round(
          (totalTimeInStage / completedItemsInStage.length / MS_PER_DAY) * 10
        ) / 10
      : 0;

  const workInProgress = workItems.filter(
    (item) => item.currentStage === stage.id && !item.completedAt
  ).length;

  const transitionEfficiency =
    itemsInStage.length > 0
      ? Math.round((completedItemsInStage.length / itemsInStage.length) * 100)
      : 100;

  return {
    stageId: stage.id,
    stageName: stage.name,
    averageTimeInStage,
    workInProgress,
    transitionEfficiency,
    completedItems: completedItemsInStage.length,
  };
}

export function calculateFlowDistribution(
  workItems: WorkItem[]
): FlowDistribution[] {
  const labelCounts = new Map<string, number>();

  workItems.forEach((item) => {
    item.labels.forEach((label) => {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    });
  });

  const total = workItems.length;
  const distributions: FlowDistribution[] = [];

  const colors = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];
  let colorIndex = 0;

  labelCounts.forEach((count, label) => {
    distributions.push({
      category: label,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
      color: colors[colorIndex % colors.length],
    });
    colorIndex++;
  });

  return distributions.sort((a, b) => b.count - a.count).slice(0, 5);
}

export function calculateFlowContribution(
  workItems: WorkItem[]
): FlowContribution[] {
  const contributorCounts = new Map<string, number>();

  workItems.forEach((item) => {
    const contributor = item.team || item.assignee || "Unassigned";
    contributorCounts.set(
      contributor,
      (contributorCounts.get(contributor) || 0) + 1
    );
  });

  const total = workItems.length;
  const contributions: FlowContribution[] = [];

  const colors = [
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#6366f1",
  ];
  let colorIndex = 0;

  contributorCounts.forEach((count, contributor) => {
    contributions.push({
      contributor,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
      color: colors[colorIndex % colors.length],
    });
    colorIndex++;
  });

  return contributions.sort((a, b) => b.count - a.count).slice(0, 5);
}
