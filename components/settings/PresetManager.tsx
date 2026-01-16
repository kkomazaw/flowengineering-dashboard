"use client";

import { useState, useEffect } from "react";
import { VSMConfigStorage } from "@/lib/config-storage";
import { StoredVSMConfig } from "@/types";
import { getDefaultVSMConfig } from "@/lib/data-transformer";

interface PresetManagerProps {
  selectedConfig: StoredVSMConfig | null;
  onConfigSelect: (config: StoredVSMConfig) => void;
}

export function PresetManager({
  selectedConfig,
  onConfigSelect,
}: PresetManagerProps) {
  const [configs, setConfigs] = useState<StoredVSMConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigDescription, setNewConfigDescription] = useState("");

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const loaded = VSMConfigStorage.loadAll();
    setConfigs(loaded);

    // If no configs exist, create the default one
    if (loaded.length === 0) {
      const defaultConfig = VSMConfigStorage.getDefault();
      setConfigs([defaultConfig]);
      onConfigSelect(defaultConfig);
    }
  };

  const handleCreatePreset = () => {
    if (!newConfigName.trim()) {
      alert("Please enter a preset name");
      return;
    }

    const baseConfig = selectedConfig?.config || getDefaultVSMConfig();

    const newPreset: StoredVSMConfig = {
      id: `preset-${Date.now()}`,
      name: newConfigName,
      description: newConfigDescription,
      config: {
        ...baseConfig,
        id: `preset-${Date.now()}`,
        name: newConfigName,
      },
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    VSMConfigStorage.save(newPreset);
    loadConfigs();
    setIsCreating(false);
    setNewConfigName("");
    setNewConfigDescription("");
    onConfigSelect(newPreset);
  };

  const handleSetDefault = (id: string) => {
    VSMConfigStorage.setDefault(id);
    loadConfigs();
  };

  const handleDelete = (id: string) => {
    try {
      VSMConfigStorage.delete(id);
      loadConfigs();

      // If the deleted config was selected, select the default
      if (selectedConfig?.id === id) {
        const defaultConfig = VSMConfigStorage.getDefault();
        onConfigSelect(defaultConfig);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete preset");
    }
  };

  const handleDuplicate = (config: StoredVSMConfig) => {
    const duplicate: StoredVSMConfig = {
      ...config,
      id: `preset-${Date.now()}`,
      name: `${config.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    VSMConfigStorage.save(duplicate);
    loadConfigs();
    onConfigSelect(duplicate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Configuration Presets
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage multiple VSM configurations for different teams or projects
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + New Preset
        </button>
      </div>

      {/* Create Preset Form */}
      {isCreating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Create New Preset
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preset Name
              </label>
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mobile Team VSM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newConfigDescription}
                onChange={(e) => setNewConfigDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this preset"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePreset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewConfigName("");
                  setNewConfigDescription("");
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset List */}
      <div className="space-y-3">
        {configs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">
              No presets found. Create your first preset to get started.
            </p>
          </div>
        ) : (
          configs.map((config) => (
            <div
              key={config.id}
              className={`p-4 border rounded-lg transition-all ${
                selectedConfig?.id === config.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {config.name}
                    </h3>
                    {config.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {config.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {config.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{config.config.stages.length} stages</span>
                    <span>
                      Updated: {config.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onConfigSelect(config)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    Select
                  </button>
                  {!config.isDefault && (
                    <button
                      onClick={() => handleSetDefault(config.id)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(config)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Duplicate
                  </button>
                  {!config.isDefault && (
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
