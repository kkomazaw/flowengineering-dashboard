"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DateRange, WorkItem, WorkType, EstimateSize } from "@/types";
import { getDefaultVSMConfig } from "@/lib/data-transformer";
import {
  calculateValueStreamMetrics,
  calculateFlowDistribution,
  calculateFlowContribution,
} from "@/lib/metrics";
import ValueStreamFlow from "./ValueStreamFlow";
import MetricsCards from "./MetricsCards";
import FlowCharts from "./FlowCharts";
import DateRangeFilter from "./DateRangeFilter";
import AdvancedFilters from "./AdvancedFilters";
import StageDetailModal from "./StageDetailModal";
import WorkItemDetailModal from "./WorkItemDetailModal";
import RefreshButton from "./RefreshButton";
import ErrorBanner from "./ErrorBanner";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ValueStreamDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return { start, end };
  });

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter states
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedEstimateSizes, setSelectedEstimateSizes] = useState<
    EstimateSize[]
  >([]);

  // Modal states
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(
    null
  );

  const config = getDefaultVSMConfig();

  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sampleItems: WorkItem[] = [
      {
        id: "1",
        key: "#101",
        title: "Implement user authentication",
        type: "feature",
        status: "done",
        currentStage: "done",
        labels: ["feature", "high-priority"],
        assignee: "Alice",
        team: "Backend",
        createdAt: new Date("2025-10-01"),
        startedAt: new Date("2025-10-05"),
        completedAt: new Date("2025-10-28"),
        stageHistory: [
          {
            stageId: "discovery",
            stageName: "Discovery",
            enteredAt: new Date("2025-10-01"),
            exitedAt: new Date("2025-10-05"),
            durationMs: 4 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "build",
            stageName: "Build",
            enteredAt: new Date("2025-10-05"),
            exitedAt: new Date("2025-10-20"),
            durationMs: 15 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "test",
            stageName: "Test",
            enteredAt: new Date("2025-10-20"),
            exitedAt: new Date("2025-10-25"),
            durationMs: 5 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "done",
            stageName: "Done",
            enteredAt: new Date("2025-10-28"),
          },
        ],
      },
      {
        id: "2",
        key: "#102",
        title: "Fix payment gateway bug",
        type: "bug",
        status: "done",
        currentStage: "done",
        labels: ["bug", "critical"],
        assignee: "Bob",
        team: "Backend",
        createdAt: new Date("2025-11-01"),
        startedAt: new Date("2025-11-01"),
        completedAt: new Date("2025-11-10"),
        stageHistory: [
          {
            stageId: "build",
            stageName: "Build",
            enteredAt: new Date("2025-11-01"),
            exitedAt: new Date("2025-11-07"),
            durationMs: 6 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "test",
            stageName: "Test",
            enteredAt: new Date("2025-11-07"),
            exitedAt: new Date("2025-11-10"),
            durationMs: 3 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "done",
            stageName: "Done",
            enteredAt: new Date("2025-11-10"),
          },
        ],
      },
      {
        id: "3",
        key: "#103",
        title: "Add dashboard analytics",
        type: "feature",
        status: "in-progress",
        currentStage: "build",
        labels: ["feature", "analytics"],
        assignee: "Charlie",
        team: "Frontend",
        createdAt: new Date("2025-11-15"),
        startedAt: new Date("2025-11-18"),
        stageHistory: [
          {
            stageId: "discovery",
            stageName: "Discovery",
            enteredAt: new Date("2025-11-15"),
            exitedAt: new Date("2025-11-18"),
            durationMs: 3 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "build",
            stageName: "Build",
            enteredAt: new Date("2025-11-18"),
          },
        ],
      },
      {
        id: "4",
        key: "#104",
        title: "Refactor database queries",
        type: "tech-debt",
        status: "done",
        currentStage: "done",
        labels: ["tech-debt", "performance"],
        assignee: "Alice",
        team: "Backend",
        createdAt: new Date("2025-10-10"),
        startedAt: new Date("2025-10-15"),
        completedAt: new Date("2025-11-05"),
        stageHistory: [
          {
            stageId: "discovery",
            stageName: "Discovery",
            enteredAt: new Date("2025-10-10"),
            exitedAt: new Date("2025-10-15"),
            durationMs: 5 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "build",
            stageName: "Build",
            enteredAt: new Date("2025-10-15"),
            exitedAt: new Date("2025-11-01"),
            durationMs: 17 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "test",
            stageName: "Test",
            enteredAt: new Date("2025-11-01"),
            exitedAt: new Date("2025-11-05"),
            durationMs: 4 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "done",
            stageName: "Done",
            enteredAt: new Date("2025-11-05"),
          },
        ],
      },
      {
        id: "5",
        key: "#105",
        title: "Design new landing page",
        type: "feature",
        status: "ready",
        currentStage: "ready-backlog",
        labels: ["feature", "design"],
        assignee: "Diana",
        team: "Design",
        createdAt: new Date("2025-12-01"),
        stageHistory: [
          {
            stageId: "discovery",
            stageName: "Discovery",
            enteredAt: new Date("2025-12-01"),
            exitedAt: new Date("2025-12-10"),
            durationMs: 9 * 24 * 60 * 60 * 1000,
          },
          {
            stageId: "ready-backlog",
            stageName: "Ready Backlog",
            enteredAt: new Date("2025-12-10"),
          },
        ],
      },
    ];

      setWorkItems(sampleItems);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredWorkItems = workItems.filter((item) => {
    // Date range filter
    const itemDate = item.createdAt;
    if (itemDate < dateRange.start || itemDate > dateRange.end) {
      return false;
    }

    // Work type filter
    if (
      selectedWorkTypes.length > 0 &&
      !selectedWorkTypes.includes(item.type)
    ) {
      return false;
    }

    // Team filter
    if (selectedTeams.length > 0 && item.team) {
      if (!selectedTeams.includes(item.team)) {
        return false;
      }
    }

    // Estimate size filter
    if (
      selectedEstimateSizes.length > 0 &&
      item.estimateSize &&
      !selectedEstimateSizes.includes(item.estimateSize)
    ) {
      return false;
    }

    return true;
  });

  // Get unique values for filters
  const availableTeams = Array.from(
    new Set(workItems.map((item) => item.team).filter(Boolean) as string[])
  );

  // Get work items for selected stage
  const stageWorkItems = selectedStageId
    ? filteredWorkItems.filter((item) => item.currentStage === selectedStageId)
    : [];

  const selectedStage = selectedStageId
    ? config.stages.find((s) => s.id === selectedStageId)
    : null;

  // Get selected work item
  const selectedWorkItem = selectedWorkItemId
    ? workItems.find((item) => item.id === selectedWorkItemId) || null
    : null;

  const metrics = calculateValueStreamMetrics(
    filteredWorkItems,
    config.stages
  );
  const distribution = calculateFlowDistribution(filteredWorkItems);
  const contribution = calculateFlowContribution(filteredWorkItems);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      {/* Header with Refresh Button and Settings Link */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-600">
            Showing {filteredWorkItems.length} of {workItems.length} items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>
          <RefreshButton
            onRefresh={loadSampleData}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />

      <AdvancedFilters
        workTypes={["feature", "bug", "tech-debt", "spike", "other"]}
        selectedWorkTypes={selectedWorkTypes}
        teams={availableTeams}
        selectedTeams={selectedTeams}
        estimateSizes={["xs", "s", "m", "l", "xl"]}
        selectedEstimateSizes={selectedEstimateSizes}
        onWorkTypeChange={setSelectedWorkTypes}
        onTeamChange={setSelectedTeams}
        onEstimateSizeChange={setSelectedEstimateSizes}
      />

      <MetricsCards metrics={metrics} />

      <ValueStreamFlow
        stages={config.stages}
        stageMetrics={metrics.stageMetrics}
        onStageClick={(stageId) => setSelectedStageId(stageId)}
      />

      <div className="mt-6">
        <FlowCharts distribution={distribution} contribution={contribution} />
      </div>

      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Work Items ({filteredWorkItems.length})
        </h3>
        <div className="text-sm text-gray-600">
          <p>Total: {filteredWorkItems.length} items</p>
          <p>
            Completed:{" "}
            {filteredWorkItems.filter((i) => i.completedAt).length} items
          </p>
          <p>
            In Progress:{" "}
            {filteredWorkItems.filter((i) => !i.completedAt).length} items
          </p>
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <StageDetailModal
          stage={selectedStage}
          workItems={stageWorkItems}
          isOpen={selectedStageId !== null}
          onClose={() => setSelectedStageId(null)}
          onWorkItemClick={(itemId) => {
            setSelectedWorkItemId(itemId);
            setSelectedStageId(null);
          }}
        />
      )}

      {/* Work Item Detail Modal */}
      <WorkItemDetailModal
        workItem={selectedWorkItem}
        isOpen={selectedWorkItemId !== null}
        onClose={() => setSelectedWorkItemId(null)}
      />
    </div>
  );
}
