"use client";

import { useState } from "react";
import { Stage, StoredVSMConfig } from "@/types";

interface StageEditFormProps {
  stage: Stage;
  config: StoredVSMConfig;
  isAdding: boolean;
  onSave: (stage: Stage) => void;
  onCancel: () => void;
}

export function StageEditForm({
  stage,
  config,
  isAdding,
  onSave,
  onCancel,
}: StageEditFormProps) {
  const [formData, setFormData] = useState<Stage>(stage);
  const [githubStatuses, setGithubStatuses] = useState<string>(
    config.config.githubMapping?.[stage.id]?.statuses?.join(", ") || ""
  );
  const [githubLabels, setGithubLabels] = useState<string>(
    config.config.githubMapping?.[stage.id]?.labels?.join(", ") || ""
  );
  const [jiraStatuses, setJiraStatuses] = useState<string>(
    config.config.jiraMapping?.[stage.id]?.statuses?.join(", ") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Stage name is required");
      return;
    }

    if (!formData.id.trim()) {
      alert("Stage ID is required");
      return;
    }

    // Update the config with the new mappings
    const updatedConfig = { ...config };

    // Update GitHub mapping
    if (githubStatuses.trim() || githubLabels.trim()) {
      if (!updatedConfig.config.githubMapping) {
        updatedConfig.config.githubMapping = {};
      }
      updatedConfig.config.githubMapping[formData.id] = {
        statuses: githubStatuses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        labels: githubLabels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    // Update Jira mapping
    if (jiraStatuses.trim()) {
      if (!updatedConfig.config.jiraMapping) {
        updatedConfig.config.jiraMapping = {};
      }
      updatedConfig.config.jiraMapping[formData.id] = {
        statuses: jiraStatuses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {isAdding ? "Add New Stage" : "Edit Stage"}
            </h2>
          </div>

          {/* Form Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    disabled={!isAdding}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="e.g., discovery, build, test"
                  />
                  {!isAdding && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stage ID cannot be changed after creation
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Discovery, Build, Test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of this stage"
                  />
                </div>
              </div>
            </div>

            {/* GitHub Mapping */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                GitHub Mapping
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statuses
                  </label>
                  <input
                    type="text"
                    value={githubStatuses}
                    onChange={(e) => setGithubStatuses(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., open, closed (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    GitHub issue statuses that map to this stage
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labels
                  </label>
                  <input
                    type="text"
                    value={githubLabels}
                    onChange={(e) => setGithubLabels(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., in-progress, development (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    GitHub labels that map to this stage
                  </p>
                </div>
              </div>
            </div>

            {/* Jira Mapping */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Jira Mapping
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statuses
                </label>
                <input
                  type="text"
                  value={jiraStatuses}
                  onChange={(e) => setJiraStatuses(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., To Do, In Progress, Done (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Jira issue statuses that map to this stage
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isAdding ? "Add Stage" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
