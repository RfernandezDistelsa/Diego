"use client";

import { useEffect, useRef, useState } from "react";
import type { Task, Priority } from "@/lib/types";
import { DueDateInput } from "./DueDateInput";
import { TagInput } from "./TagInput";

interface TaskFormData {
  title: string;
  notes: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  recurring?: "daily" | "weekly" | "monthly";
}

interface TaskFormProps {
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
  initialTask?: Task;
}

export function TaskForm({ onSave, onCancel, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [notes, setNotes] = useState(initialTask?.notes ?? "");
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? "med");
  const [dueDate, setDueDate] = useState<string | undefined>(initialTask?.dueDate);
  const [tags, setTags] = useState<string[]>(initialTask?.tags ?? []);
  const [recurring, setRecurring] = useState<"daily" | "weekly" | "monthly" | undefined>(
    initialTask?.recurring
  );

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, notes, priority, dueDate, tags, recurring });
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Task form" className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200 animate-slide-up">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        {initialTask ? "Edit Task" : "Create New Task"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="task-title" className="text-sm font-semibold text-slate-900">
            Title
          </label>
          <input
            id="task-title"
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="task-notes" className="text-sm font-semibold text-slate-900">
            Notes (optional)
          </label>
          <textarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any details..."
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="task-priority" className="text-sm font-semibold text-slate-900">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="low">🟢 Low - Chill</option>
            <option value="med">🟡 Medium - Needs attention</option>
            <option value="high">🔴 High - Time-sensitive</option>
          </select>
        </div>

        <DueDateInput value={dueDate} onChange={setDueDate} />

        <TagInput value={tags} onChange={setTags} />

        <div className="flex flex-col gap-2">
          <label htmlFor="task-recurring" className="text-sm font-semibold text-slate-900">
            Recurrence (optional)
          </label>
          <select
            id="task-recurring"
            value={recurring ?? ""}
            onChange={(e) => setRecurring((e.target.value as any) || undefined)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">No recurrence</option>
            <option value="daily">🔄 Daily</option>
            <option value="weekly">📅 Weekly</option>
            <option value="monthly">📆 Monthly</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-slate-900 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#FF8C42] text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
