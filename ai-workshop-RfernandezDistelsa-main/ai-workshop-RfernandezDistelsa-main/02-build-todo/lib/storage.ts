import type { Task, FilterStatus, StorageData } from "@/lib/types";

const STORAGE_KEY = "tasky:v1";
const DEFAULT_FILTER: FilterStatus = "open";

function isSSR(): boolean {
  return typeof window === "undefined";
}

/**
 * Reads and parses the full storage object from localStorage.
 * Returns a safe default when storage is empty or corrupt.
 */
export function getStorageData(): StorageData {
  if (isSSR()) return { tasks: [], filterState: DEFAULT_FILTER };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tasks: [], filterState: DEFAULT_FILTER };
    const parsed = JSON.parse(raw) as Partial<StorageData>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      filterState:
        parsed.filterState === "all" ||
        parsed.filterState === "open" ||
        parsed.filterState === "done" ||
        parsed.filterState === "overdue"
          ? parsed.filterState
          : DEFAULT_FILTER,
    };
  } catch {
    return { tasks: [], filterState: DEFAULT_FILTER };
  }
}

function writeStorageData(data: StorageData): void {
  if (isSSR()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Loads the task list from localStorage. Returns [] on error or SSR. */
export function loadTasks(): Task[] {
  return getStorageData().tasks;
}

/** Saves a new task list, preserving the existing filter state. */
export function saveTasks(tasks: Task[]): void {
  const current = getStorageData();
  writeStorageData({ ...current, tasks });
}

/** Loads the persisted filter state. Returns "open" as the default. */
export function loadFilterState(): FilterStatus {
  return getStorageData().filterState;
}

/** Saves a new filter state, preserving the existing task list. */
export function saveFilterState(filterState: FilterStatus): void {
  const current = getStorageData();
  writeStorageData({ ...current, filterState });
}

/** Removes all Tasky data from localStorage. */
export function clearStorage(): void {
  if (isSSR()) return;
  localStorage.removeItem(STORAGE_KEY);
}
