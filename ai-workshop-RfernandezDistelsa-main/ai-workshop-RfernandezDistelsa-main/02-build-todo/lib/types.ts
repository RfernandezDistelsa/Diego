export type Priority = "low" | "med" | "high";
export type FilterStatus = "all" | "open" | "done" | "overdue";

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  createdAt: string; // ISO timestamp
  completedAt: string | null;
  tags: string[]; // Labels for categorizing tasks (empty array by default)
  recurring?: "daily" | "weekly" | "monthly"; // Recurrence pattern, if any
  nextOccurrence?: string; // ISO date string (YYYY-MM-DD) for next occurrence of recurring task
}

export interface StorageData {
  tasks: Task[];
  filterState: FilterStatus;
}
