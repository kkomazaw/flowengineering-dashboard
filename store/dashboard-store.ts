import { create } from "zustand";
import { WorkItem, DashboardFilters, VSMConfig, DateRange } from "@/types";
import { getDefaultVSMConfig } from "@/lib/data-transformer";

interface DashboardState {
  // Data
  workItems: WorkItem[];
  config: VSMConfig;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters
  filters: DashboardFilters;

  // UI State
  selectedStageId: string | null;
  selectedWorkItemId: string | null;

  // Actions
  setWorkItems: (items: WorkItem[]) => void;
  setConfig: (config: VSMConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (dateRange: DateRange) => void;
  selectStage: (stageId: string | null) => void;
  selectWorkItem: (itemId: string | null) => void;
  refreshData: () => Promise<void>;
}

const getDefaultFilters = (): DashboardFilters => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);

  return {
    workTypes: [],
    subTeams: [],
    estimateSizes: [],
    issueTypes: [],
    initiatives: [],
    products: [],
    dateRange: { start, end },
  };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  workItems: [],
  config: getDefaultVSMConfig(),
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: getDefaultFilters(),
  selectedStageId: null,
  selectedWorkItemId: null,

  // Actions
  setWorkItems: (items) =>
    set({ workItems: items, lastUpdated: new Date(), error: null }),

  setConfig: (config) => set({ config }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  updateFilters: (partialFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...partialFilters },
    })),

  setDateRange: (dateRange) =>
    set((state) => ({
      filters: { ...state.filters, dateRange },
    })),

  selectStage: (stageId) => set({ selectedStageId: stageId }),

  selectWorkItem: (itemId) => set({ selectedWorkItemId: itemId }),

  refreshData: async () => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Implement actual API calls here
      // For now, this is a placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));

// Selector hooks for commonly used derived state
export const useFilteredWorkItems = () => {
  const workItems = useDashboardStore((state) => state.workItems);
  const filters = useDashboardStore((state) => state.filters);

  return workItems.filter((item) => {
    // Date range filter
    if (
      item.createdAt < filters.dateRange.start ||
      item.createdAt > filters.dateRange.end
    ) {
      return false;
    }

    // Work type filter
    if (filters.workTypes.length > 0 && !filters.workTypes.includes(item.type)) {
      return false;
    }

    // Team filter
    if (filters.subTeams.length > 0 && item.team) {
      if (!filters.subTeams.includes(item.team)) {
        return false;
      }
    }

    // Estimate size filter
    if (
      filters.estimateSizes.length > 0 &&
      item.estimateSize &&
      !filters.estimateSizes.includes(item.estimateSize)
    ) {
      return false;
    }

    // Initiative filter
    if (
      filters.initiatives.length > 0 &&
      item.initiative &&
      !filters.initiatives.includes(item.initiative)
    ) {
      return false;
    }

    // Product filter
    if (
      filters.products.length > 0 &&
      item.product &&
      !filters.products.includes(item.product)
    ) {
      return false;
    }

    return true;
  });
};

export const useWorkItemsByStage = (stageId: string) => {
  const workItems = useFilteredWorkItems();
  return workItems.filter((item) => item.currentStage === stageId);
};
