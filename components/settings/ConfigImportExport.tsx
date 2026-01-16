"use client";

import { useState, useRef } from "react";
import { VSMConfigStorage } from "@/lib/config-storage";
import { StoredVSMConfig } from "@/types";

interface ConfigImportExportProps {
  config: StoredVSMConfig;
  onImport: (config: StoredVSMConfig) => void;
}

export function ConfigImportExport({
  config,
  onImport,
}: ConfigImportExportProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    try {
      const json = VSMConfigStorage.export(config.id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vsm-config-${config.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        `Failed to export: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleExportYAML = () => {
    try {
      const json = VSMConfigStorage.export(config.id);
      const configData = JSON.parse(json);

      // Simple YAML conversion
      const yaml = convertToYAML(configData);

      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vsm-config-${config.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        `Failed to export: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let jsonContent: string;

        if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
          // Simple YAML to JSON conversion
          jsonContent = convertYAMLToJSON(content);
        } else {
          jsonContent = content;
        }

        const imported = VSMConfigStorage.import(jsonContent);
        onImport(imported);
        setImportSuccess(
          `Successfully imported configuration: ${imported.name}`
        );

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        setImportError(
          error instanceof Error ? error.message : "Failed to import configuration"
        );
      }
    };

    reader.onerror = () => {
      setImportError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    try {
      const json = VSMConfigStorage.export(config.id);
      navigator.clipboard.writeText(json);
      alert("Configuration copied to clipboard!");
    } catch (error) {
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Import / Export Configuration
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Export your configuration to share with others or import existing
          configurations
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Export Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Export the current configuration as JSON or YAML file
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Export as JSON
          </button>
          <button
            onClick={handleExportYAML}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Export as YAML
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Import Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Import a configuration from a JSON or YAML file
        </p>

        {importError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{importSuccess}</p>
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleImport}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: JSON (.json), YAML (.yaml, .yml)
          </p>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">
          Current Configuration Preview
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">
            {VSMConfigStorage.export(config.id)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Simple YAML converter (basic implementation)
function convertToYAML(obj: any, indent = 0): string {
  const spaces = "  ".repeat(indent);
  let yaml = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${spaces}${key}: null\n`;
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      value.forEach((item) => {
        if (typeof item === "object") {
          yaml += `${spaces}- \n`;
          yaml += convertToYAML(item, indent + 1).replace(
            new RegExp(`^${"  ".repeat(indent + 1)}`, "gm"),
            `${spaces}  `
          );
        } else {
          yaml += `${spaces}- ${item}\n`;
        }
      });
    } else if (typeof value === "object") {
      yaml += `${spaces}${key}:\n`;
      yaml += convertToYAML(value, indent + 1);
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }

  return yaml;
}

// Simple YAML to JSON converter (basic implementation)
function convertYAMLToJSON(yaml: string): string {
  // This is a very basic implementation
  // For production, consider using a proper YAML parser like js-yaml
  const lines = yaml.split("\n");
  const obj: any = {};
  let currentKey = "";

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (trimmed.includes(": ")) {
      const [key, ...valueParts] = trimmed.split(": ");
      const value = valueParts.join(": ");
      currentKey = key;
      obj[key] = value;
    }
  });

  return JSON.stringify(obj);
}
