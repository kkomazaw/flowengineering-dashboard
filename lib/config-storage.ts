import { StoredVSMConfig, VSMConfig, VSMConfigExport } from "@/types";
import { getDefaultVSMConfig } from "./data-transformer";

const STORAGE_KEY = "vsm_configs";
const VERSION = "1.0.0";

/**
 * VSM Configuration Storage Manager
 * Handles saving, loading, and managing VSM configurations in LocalStorage
 */
export class VSMConfigStorage {
  /**
   * Save a configuration to LocalStorage
   */
  static save(storedConfig: StoredVSMConfig): void {
    const configs = this.loadAll();
    const index = configs.findIndex((c) => c.id === storedConfig.id);

    if (index >= 0) {
      // Update existing config
      configs[index] = {
        ...storedConfig,
        updatedAt: new Date(),
      };
    } else {
      // Add new config
      configs.push({
        ...storedConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    this.saveAll(configs);
  }

  /**
   * Load all configurations from LocalStorage
   */
  static loadAll(): StoredVSMConfig[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const configs = JSON.parse(data);

      // Convert date strings back to Date objects
      return configs.map((config: any) => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to load VSM configs:", error);
      return [];
    }
  }

  /**
   * Load a specific configuration by ID
   */
  static load(id: string): StoredVSMConfig | null {
    const configs = this.loadAll();
    return configs.find((c) => c.id === id) || null;
  }

  /**
   * Get the default configuration
   */
  static getDefault(): StoredVSMConfig {
    const configs = this.loadAll();
    const defaultConfig = configs.find((c) => c.isDefault);

    if (defaultConfig) {
      return defaultConfig;
    }

    // If no default exists, create one from the default VSM config
    const baseConfig = getDefaultVSMConfig();
    const stored: StoredVSMConfig = {
      id: baseConfig.id,
      name: baseConfig.name,
      description: "Default value stream configuration",
      config: baseConfig,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.save(stored);
    return stored;
  }

  /**
   * Set a configuration as the default
   */
  static setDefault(id: string): void {
    const configs = this.loadAll();

    // Remove default flag from all configs
    configs.forEach((c) => {
      c.isDefault = c.id === id;
      c.updatedAt = new Date();
    });

    this.saveAll(configs);
  }

  /**
   * Delete a configuration
   */
  static delete(id: string): boolean {
    const configs = this.loadAll();
    const config = configs.find((c) => c.id === id);

    if (!config) {
      return false;
    }

    // Don't allow deleting the default config
    if (config.isDefault) {
      throw new Error("Cannot delete the default configuration");
    }

    const filtered = configs.filter((c) => c.id !== id);
    this.saveAll(filtered);
    return true;
  }

  /**
   * Export a configuration to JSON
   */
  static export(id: string): string {
    const stored = this.load(id);
    if (!stored) {
      throw new Error(`Configuration with id ${id} not found`);
    }

    const exportData: VSMConfigExport = {
      version: VERSION,
      name: stored.name,
      description: stored.description,
      config: stored.config,
      createdAt: stored.createdAt.toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import a configuration from JSON
   */
  static import(jsonString: string): StoredVSMConfig {
    try {
      const importData: VSMConfigExport = JSON.parse(jsonString);

      // Validate version
      if (importData.version !== VERSION) {
        console.warn(
          `Version mismatch: expected ${VERSION}, got ${importData.version}`
        );
      }

      // Validate required fields
      if (!importData.config || !importData.config.stages) {
        throw new Error("Invalid configuration: missing stages");
      }

      // Generate a new ID for the imported config
      const id = `imported-${Date.now()}`;

      const stored: StoredVSMConfig = {
        id,
        name: importData.name || "Imported Configuration",
        description: importData.description,
        config: importData.config,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.save(stored);
      return stored;
    } catch (error) {
      throw new Error(
        `Failed to import configuration: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Export all configurations to JSON
   */
  static exportAll(): string {
    const configs = this.loadAll();
    return JSON.stringify(configs, null, 2);
  }

  /**
   * Clear all configurations (use with caution)
   */
  static clear(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Save all configurations to LocalStorage
   */
  private static saveAll(configs: StoredVSMConfig[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }
  }

  /**
   * Validate a configuration
   */
  static validate(config: VSMConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id || config.id.trim() === "") {
      errors.push("Configuration ID is required");
    }

    if (!config.name || config.name.trim() === "") {
      errors.push("Configuration name is required");
    }

    if (!config.stages || config.stages.length === 0) {
      errors.push("At least one stage is required");
    }

    // Validate stages
    config.stages.forEach((stage, index) => {
      if (!stage.id || stage.id.trim() === "") {
        errors.push(`Stage ${index + 1}: ID is required`);
      }
      if (!stage.name || stage.name.trim() === "") {
        errors.push(`Stage ${index + 1}: Name is required`);
      }
      if (typeof stage.order !== "number") {
        errors.push(`Stage ${index + 1}: Order must be a number`);
      }
    });

    // Check for duplicate stage IDs
    const stageIds = config.stages.map((s) => s.id);
    const duplicates = stageIds.filter(
      (id, index) => stageIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate stage IDs found: ${duplicates.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
