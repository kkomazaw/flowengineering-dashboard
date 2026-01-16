"use client";

import { useState } from "react";
import Link from "next/link";
import { VSMConfigStorage } from "@/lib/config-storage";
import { StoredVSMConfig } from "@/types";
import { PresetManager } from "@/components/settings/PresetManager";
import { StageEditor } from "@/components/settings/StageEditor";
import { ConfigImportExport } from "@/components/settings/ConfigImportExport";

export default function SettingsPage() {
  const [selectedConfig, setSelectedConfig] = useState<StoredVSMConfig | null>(
    () => VSMConfigStorage.getDefault()
  );
  const [activeTab, setActiveTab] = useState<"stages" | "presets" | "import-export">("stages");

  const handleConfigChange = (config: StoredVSMConfig) => {
    setSelectedConfig(config);
  };

  const handleSave = () => {
    if (selectedConfig) {
      VSMConfigStorage.save(selectedConfig);
      alert("Configuration saved successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                VSM Configuration Settings
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Customize your value stream stages and mappings
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("stages")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "stages"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Stage Editor
              </button>
              <button
                onClick={() => setActiveTab("presets")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "presets"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab("import-export")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "import-export"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                Import/Export
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "stages" && selectedConfig && (
              <StageEditor
                config={selectedConfig}
                onChange={handleConfigChange}
              />
            )}

            {activeTab === "presets" && (
              <PresetManager
                selectedConfig={selectedConfig}
                onConfigSelect={handleConfigChange}
              />
            )}

            {activeTab === "import-export" && selectedConfig && (
              <ConfigImportExport
                config={selectedConfig}
                onImport={handleConfigChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
