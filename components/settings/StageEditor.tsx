"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { StoredVSMConfig, Stage } from "@/types";
import { SortableStageItem } from "./SortableStageItem";
import { StageEditForm } from "./StageEditForm";

interface StageEditorProps {
  config: StoredVSMConfig;
  onChange: (config: StoredVSMConfig) => void;
}

export function StageEditor({ config, onChange }: StageEditorProps) {
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = config.config.stages.findIndex((s) => s.id === active.id);
      const newIndex = config.config.stages.findIndex((s) => s.id === over.id);

      const newStages = arrayMove(config.config.stages, oldIndex, newIndex);

      // Update order numbers
      const updatedStages = newStages.map((stage, index) => ({
        ...stage,
        order: index,
      }));

      onChange({
        ...config,
        config: {
          ...config.config,
          stages: updatedStages,
        },
      });
    }
  };

  const handleAddStage = () => {
    setIsAdding(true);
    setEditingStage({
      id: `stage-${Date.now()}`,
      name: "",
      order: config.config.stages.length,
      description: "",
    });
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setIsAdding(false);
  };

  const handleDeleteStage = (stageId: string) => {
    if (config.config.stages.length <= 2) {
      alert("Cannot delete stage: At least 2 stages are required");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this stage? This action cannot be undone."
      )
    ) {
      return;
    }

    const newStages = config.config.stages
      .filter((s) => s.id !== stageId)
      .map((stage, index) => ({
        ...stage,
        order: index,
      }));

    // Remove from mappings
    const newGithubMapping = { ...config.config.githubMapping };
    const newJiraMapping = { ...config.config.jiraMapping };
    delete newGithubMapping[stageId];
    delete newJiraMapping[stageId];

    onChange({
      ...config,
      config: {
        ...config.config,
        stages: newStages,
        githubMapping: newGithubMapping,
        jiraMapping: newJiraMapping,
      },
    });
  };

  const handleSaveStage = (stage: Stage) => {
    let newStages: Stage[];

    if (isAdding) {
      newStages = [...config.config.stages, stage];
    } else {
      newStages = config.config.stages.map((s) =>
        s.id === stage.id ? stage : s
      );
    }

    onChange({
      ...config,
      config: {
        ...config.config,
        stages: newStages,
      },
    });

    setEditingStage(null);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingStage(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Value Stream Stages
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop to reorder stages. Click to edit stage details and
            mappings.
          </p>
        </div>
        <button
          onClick={handleAddStage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Add Stage
        </button>
      </div>

      {/* Stage List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={config.config.stages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {config.config.stages.map((stage) => (
              <SortableStageItem
                key={stage.id}
                stage={stage}
                onEdit={handleEditStage}
                onDelete={handleDeleteStage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Form Modal */}
      {editingStage && (
        <StageEditForm
          stage={editingStage}
          config={config}
          isAdding={isAdding}
          onSave={handleSaveStage}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
