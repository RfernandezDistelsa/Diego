"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createTask,
  updateTask,
  toggleTask,
  getVisibleTasks,
} from "@/lib/tasks";
import {
  loadTasks,
  saveTasks,
  loadFilterState,
  saveFilterState,
} from "@/lib/storage";
import type { Task, FilterStatus, Priority } from "@/lib/types";

export interface UseTasksReturn {
  tasks: Task[];
  visibleTasks: Task[];
  filter: FilterStatus;
  setFilter: (filter: FilterStatus) => void;
  addTask: (title: string, notes?: string, priority?: Priority, dueDate?: string, tags?: string[], recurring?: "daily" | "weekly" | "monthly") => void;
  editTask: (id: string, changes: Partial<Pick<Task, "title" | "notes" | "priority" | "dueDate" | "tags" | "recurring">>) => void;
  toggleTaskById: (id: string) => void;
  deleteTaskById: (id: string) => Task | undefined;
  restoreTask: (task: Task) => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilterState] = useState<FilterStatus>("open");
  const [hydrated, setHydrated] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    setTasks(loadTasks());
    setFilterState(loadFilterState());
    setHydrated(true);
  }, []);

  // Persist tasks whenever they change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveTasks(tasks);
  }, [tasks, hydrated]);

  const setFilter = useCallback((f: FilterStatus) => {
    setFilterState(f);
    saveFilterState(f);
  }, []);

  const addTask = useCallback(
    (
      title: string,
      notes: string = "",
      priority: Priority = "med",
      dueDate?: string,
      tags: string[] = [],
      recurring?: "daily" | "weekly" | "monthly"
    ) => {
      const task = createTask(title, notes, priority);
      if (dueDate) {
        task.dueDate = dueDate;
      }
      if (tags.length > 0) {
        task.tags = tags;
      }
      if (recurring) {
        task.recurring = recurring;
      }
      setTasks((prev) => [...prev, task]);
    },
    []
  );

  const editTask = useCallback(
    (id: string, changes: Partial<Pick<Task, "title" | "notes" | "priority" | "dueDate" | "tags" | "recurring">>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updated = updateTask(t, changes);
            if (changes.dueDate !== undefined) {
              updated.dueDate = changes.dueDate;
            }
            if (changes.tags !== undefined) {
              updated.tags = changes.tags;
            }
            if (changes.recurring !== undefined) {
              updated.recurring = changes.recurring;
            }
            return updated;
          }
          return t;
        })
      );
    },
    []
  );

  const toggleTaskById = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? toggleTask(t) : t)));
  }, []);

  const deleteTaskById = useCallback(
    (id: string): Task | undefined => {
      let deleted: Task | undefined;
      setTasks((prev) => {
        deleted = prev.find((t) => t.id === id);
        return prev.filter((t) => t.id !== id);
      });
      return deleted;
    },
    []
  );

  const restoreTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  return {
    tasks,
    visibleTasks: getVisibleTasks(tasks, filter),
    filter,
    setFilter,
    addTask,
    editTask,
    toggleTaskById,
    deleteTaskById,
    restoreTask,
  };
}
