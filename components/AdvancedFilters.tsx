"use client";

import { WorkType, EstimateSize } from "@/types";

interface AdvancedFiltersProps {
  workTypes: WorkType[];
  selectedWorkTypes: WorkType[];
  teams: string[];
  selectedTeams: string[];
  estimateSizes: EstimateSize[];
  selectedEstimateSizes: EstimateSize[];
  onWorkTypeChange: (types: WorkType[]) => void;
  onTeamChange: (teams: string[]) => void;
  onEstimateSizeChange: (sizes: EstimateSize[]) => void;
}

export default function AdvancedFilters({
  workTypes,
  selectedWorkTypes,
  teams,
  selectedTeams,
  estimateSizes,
  selectedEstimateSizes,
  onWorkTypeChange,
  onTeamChange,
  onEstimateSizeChange,
}: AdvancedFiltersProps) {
  const toggleWorkType = (type: WorkType) => {
    if (selectedWorkTypes.includes(type)) {
      onWorkTypeChange(selectedWorkTypes.filter((t) => t !== type));
    } else {
      onWorkTypeChange([...selectedWorkTypes, type]);
    }
  };

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      onTeamChange(selectedTeams.filter((t) => t !== team));
    } else {
      onTeamChange([...selectedTeams, team]);
    }
  };

  const toggleEstimateSize = (size: EstimateSize) => {
    if (selectedEstimateSizes.includes(size)) {
      onEstimateSizeChange(selectedEstimateSizes.filter((s) => s !== size));
    } else {
      onEstimateSizeChange([...selectedEstimateSizes, size]);
    }
  };

  const clearAll = () => {
    onWorkTypeChange([]);
    onTeamChange([]);
    onEstimateSizeChange([]);
  };

  const getWorkTypeColor = (type: WorkType) => {
    const colors: Record<WorkType, string> = {
      feature: "bg-blue-100 text-blue-800 border-blue-300",
      bug: "bg-red-100 text-red-800 border-red-300",
      "tech-debt": "bg-purple-100 text-purple-800 border-purple-300",
      spike: "bg-yellow-100 text-yellow-800 border-yellow-300",
      other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[type];
  };

  const getWorkTypeLabel = (type: WorkType) => {
    const labels: Record<WorkType, string> = {
      feature: "Feature",
      bug: "Bug",
      "tech-debt": "Tech Debt",
      spike: "Spike",
      other: "Other",
    };
    return labels[type];
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Work Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Type
          </label>
          <div className="flex flex-wrap gap-2">
            {workTypes.map((type) => {
              const isSelected = selectedWorkTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleWorkType(type)}
                  className={`px-3 py-2 rounded-md text-sm border transition ${
                    isSelected
                      ? getWorkTypeColor(type) + " font-medium"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {getWorkTypeLabel(type)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Filter */}
        {teams.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team
            </label>
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <button
                    key={team}
                    onClick={() => toggleTeam(team)}
                    className={`px-3 py-2 rounded-md text-sm border transition ${
                      isSelected
                        ? "bg-green-100 text-green-800 border-green-300 font-medium"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {team}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Estimate Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimate Size
          </label>
          <div className="flex flex-wrap gap-2">
            {estimateSizes.map((size) => {
              const isSelected = selectedEstimateSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleEstimateSize(size)}
                  className={`px-3 py-2 rounded-md text-sm border transition uppercase ${
                    isSelected
                      ? "bg-orange-100 text-orange-800 border-orange-300 font-medium"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Count */}
      {(selectedWorkTypes.length > 0 ||
        selectedTeams.length > 0 ||
        selectedEstimateSizes.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedWorkTypes.length + selectedTeams.length + selectedEstimateSizes.length}{" "}
            filter(s) active
          </p>
        </div>
      )}
    </div>
  );
}
