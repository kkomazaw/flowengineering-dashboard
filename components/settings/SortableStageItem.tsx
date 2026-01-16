"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Stage } from "@/types";

interface SortableStageItemProps {
  stage: Stage;
  onEdit: (stage: Stage) => void;
  onDelete: (stageId: string) => void;
}

export function SortableStageItem({
  stage,
  onEdit,
  onDelete,
}: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStageColor = (stageId: string): string => {
    const colorMap: Record<string, string> = {
      discovery: "bg-purple-100 border-purple-300",
      "ready-backlog": "bg-blue-100 border-blue-300",
      build: "bg-yellow-100 border-yellow-300",
      test: "bg-orange-100 border-orange-300",
      release: "bg-green-100 border-green-300",
      done: "bg-gray-100 border-gray-300",
    };
    return colorMap[stageId] || "bg-gray-100 border-gray-300";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Stage Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getStageColor(stage.id)}`}
          ></div>
          <div>
            <h3 className="font-medium text-gray-900">{stage.name}</h3>
            {stage.description && (
              <p className="text-sm text-gray-600 mt-0.5">
                {stage.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Badge */}
      <div className="text-sm text-gray-500 font-medium">
        Order: {stage.order + 1}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(stage)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(stage.id)}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
