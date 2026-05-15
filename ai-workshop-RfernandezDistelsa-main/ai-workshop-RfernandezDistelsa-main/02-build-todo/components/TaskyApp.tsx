"use client";

import { useEffect, useState } from "react";
import { useTasks } from "@/lib/useTasks";
import { FilterToggle } from "@/components/FilterToggle";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { UndoToast } from "@/components/UndoToast";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { SearchBar } from "@/components/SearchBar";
import type { Task, Priority } from "@/lib/types";

type Modal =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; task: Task };

interface DeletedTask {
  task: Task;
  visible: boolean;
}

export function TaskyApp() {
  const {
    tasks,
    filter,
    setFilter,
    addTask,
    editTask,
    toggleTaskById,
    deleteTaskById,
    restoreTask,
  } = useTasks();

  const [modal, setModal] = useState<Modal>({ kind: "none" });
  const [deleted, setDeleted] = useState<DeletedTask | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (modal.kind !== "none") return;
      if (deleted?.visible) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;
      if (e.key === "n" || e.key === "N") {
        setModal({ kind: "create" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal, deleted]);

  function handleSaveNew(data: {
    title: string;
    notes: string;
    priority: Priority;
    dueDate?: string;
    tags: string[];
    recurring?: "daily" | "weekly" | "monthly";
  }) {
    addTask(data.title, data.notes, data.priority, data.dueDate, data.tags, data.recurring);
    setModal({ kind: "create" });
  }

  function handleSaveEdit(data: {
    title: string;
    notes: string;
    priority: Priority;
    dueDate?: string;
    tags: string[];
    recurring?: "daily" | "weekly" | "monthly";
  }) {
    if (modal.kind !== "edit") return;
    editTask(modal.task.id, data);
    setModal({ kind: "none" });
  }

  function handleDelete(task: Task) {
    deleteTaskById(task.id);
    setDeleted({ task, visible: true });
  }

  function handleUndo() {
    if (!deleted) return;
    restoreTask(deleted.task);
    setDeleted(null);
  }

  function handleDismissToast() {
    setDeleted(null);
  }

  function handleTagClick(tag: string) {
    setSelectedTag(selectedTag === tag ? undefined : tag);
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between py-5 border-b border-gray-200 bg-white rounded-lg px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#FF8C42]">Tasky</h1>
            <span className="text-sm font-semibold text-slate-600 bg-amber-50 px-3 py-1 rounded-full">
              🔥 3-day streak
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#FF8C42] text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
          >
            New task <kbd className="ml-2 opacity-70 text-xs bg-white/20 px-1.5 py-0.5 rounded">N</kbd>
          </button>
        </header>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col gap-3 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm font-semibold text-slate-600">
                {completedCount} of {totalCount} tasks done
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF8C42] to-[#4CAF50] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 flex-wrap">
            <FilterToggle activeFilter={filter} onChange={setFilter} />
            {selectedTag && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-600">
                  Tag: <span className="font-semibold">{selectedTag}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(undefined)}
                  className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-slate-700 hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateTaskModal
          isOpen={modal.kind === "create"}
          onClose={() => setModal({ kind: "none" })}
        >
          <TaskForm
            onSave={handleSaveNew}
            onCancel={() => setModal({ kind: "none" })}
          />
        </CreateTaskModal>

        <CreateTaskModal
          isOpen={modal.kind === "edit"}
          onClose={() => setModal({ kind: "none" })}
        >
          {modal.kind === "edit" && (
            <TaskForm
              initialTask={modal.task}
              onSave={handleSaveEdit}
              onCancel={() => setModal({ kind: "none" })}
            />
          )}
        </CreateTaskModal>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          filter={filter}
          searchTerm={searchTerm}
          selectedTag={selectedTag}
          onToggle={(task) => toggleTaskById(task.id)}
          onDelete={handleDelete}
          onEdit={(task) => setModal({ kind: "edit", task })}
          onTagClick={handleTagClick}
        />
      </div>

      {/* Undo Toast */}
      <UndoToast
        isVisible={deleted?.visible ?? false}
        taskTitle={deleted?.task.title ?? ""}
        onUndo={handleUndo}
        onDismiss={handleDismissToast}
      />
    </main>
  );
}
