"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { isOverdue, getRecurrenceDisplay } from "@/lib/tasks";
import { TagBadge } from "./TagBadge";

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  med: "Med",
  high: "High",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  med: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onTagClick?: (tag: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit, onTagClick }: TaskItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      handleToggle();
    }
  }

  function handleToggle() {
    if (!task.completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }
    onToggle(task);
  }

  function formatDueDate(dateString: string): string {
    const date = new Date(dateString + "T00:00:00Z");
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      date
    );
  }

  const overdue = isOverdue(task);
  const isAnimatingCompletion = isAnimating && !task.completed;

  return (
    <li
      className={`flex items-start gap-4 px-5 py-4 rounded-xl border-2 transition-all cursor-default ${
        isAnimatingCompletion
          ? "animate-task-fade bg-stone-100 border-stone-300"
          : task.completed
            ? "bg-stone-100 border-stone-200 opacity-60"
            : overdue
              ? "bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md"
              : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
      }`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        aria-label={task.title}
        className={`h-6 w-6 accent-[#4CAF50] rounded-lg cursor-pointer mt-0.5 flex-shrink-0 transition-transform ${
          isAnimatingCompletion ? "animate-celebration-pop" : ""
        }`}
      />

      <div className="flex-1 min-w-0">
        <span
          className={`block text-base font-semibold ${
            task.completed ? "line-through text-slate-400" : "text-slate-900"
          } ${onEdit ? "cursor-pointer hover:text-[#FF8C42]" : ""} transition-colors`}
          onClick={onEdit ? () => onEdit(task) : undefined}
        >
          {task.title}
        </span>
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          {task.dueDate && (
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold w-fit ${
                overdue
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              📅 {formatDueDate(task.dueDate)}
            </span>
          )}
          {task.recurring && task.nextOccurrence && (
            <span className="text-xs text-slate-500 font-medium">
              🔁 {getRecurrenceDisplay(task.nextOccurrence)}
            </span>
          )}
          {(task.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags!.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={() => onTagClick?.(tag)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <span
        className={`text-xs px-3 py-1.5 rounded-full font-bold flex-shrink-0 ${PRIORITY_COLOR[task.priority] ?? ""}`}
      >
        {PRIORITY_LABEL[task.priority]}
      </span>

      <div className="flex gap-1 flex-shrink-0">
        {onEdit && (
          <button
            type="button"
            aria-label="Edit"
            onClick={() => onEdit(task)}
            className="text-xs text-slate-400 hover:text-slate-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          >
            Edit
          </button>
        )}

        <button
          type="button"
          aria-label="Delete"
          onClick={() => onDelete(task)}
          className="text-xs text-slate-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
