import { generateTaskId } from "@/lib/id";
import type { Task, FilterStatus, Priority } from "@/lib/types";

/**
 * Re-export so callers can import generateTaskId from lib/tasks if needed.
 */
export { generateTaskId };

/**
 * Returns the current time as an ISO 8601 string without milliseconds,
 * e.g. "2026-05-14T10:00:00Z".
 */
function nowISO(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Creates a new task with default values.
 */
export function createTask(
  title: string,
  notes: string = "",
  priority: Priority = "med"
): Task {
  return {
    id: generateTaskId(),
    title,
    notes,
    priority,
    completed: false,
    createdAt: nowISO(),
    completedAt: null,
    tags: [],
  };
}

/**
 * Returns a new task with the given fields merged in.
 * Does not touch id, createdAt, completed, or completedAt.
 */
export function updateTask(
  task: Task,
  changes: Partial<Pick<Task, "title" | "notes" | "priority">>
): Task {
  return { ...task, ...changes };
}

/**
 * Flips the completed flag of a task.
 * Sets completedAt to the current ISO timestamp when completing,
 * null when uncompleting.
 */
export function toggleTask(task: Task): Task {
  const completed = !task.completed;
  return {
    ...task,
    completed,
    completedAt: completed ? nowISO() : null,
  };
}

/**
 * Returns only the tasks that match the given filters.
 * Does not modify the original array.
 *
 * Filters applied with AND logic:
 * - Status filter (all/open/done/overdue)
 * - Search term (matches title or any tag, case-insensitive)
 * - Selected tag (exact match on one tag, case-insensitive)
 */
export function filterTasks(
  tasks: Task[],
  filter: FilterStatus,
  searchTerm?: string,
  selectedTag?: string
): Task[] {
  return tasks.filter((task) => {
    // Apply status filter
    let statusMatch = false;
    if (filter === "all") statusMatch = true;
    else if (filter === "open") statusMatch = !task.completed;
    else if (filter === "done") statusMatch = task.completed;
    else if (filter === "overdue") statusMatch = isOverdue(task);

    if (!statusMatch) return false;

    // Apply search term filter (search title and tags, case-insensitive)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const titleMatches = task.title.toLowerCase().includes(lowerSearchTerm);
      const tagMatches = task.tags.some((tag) =>
        tag.toLowerCase().includes(lowerSearchTerm)
      );
      if (!titleMatches && !tagMatches) return false;
    }

    // Apply selected tag filter (case-insensitive exact match on one tag)
    if (selectedTag) {
      const lowerSelectedTag = selectedTag.toLowerCase();
      const tagMatches = task.tags.some(
        (tag) => tag.toLowerCase() === lowerSelectedTag
      );
      if (!tagMatches) return false;
    }

    return true;
  });
}

/**
 * Returns tasks sorted by createdAt descending (newest first).
 * Does not modify the original array.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    return 0;
  });
}

/**
 * Convenience: filter then sort.
 */
export function getVisibleTasks(
  tasks: Task[],
  filter: FilterStatus,
  searchTerm?: string,
  selectedTag?: string
): Task[] {
  return sortTasks(filterTasks(tasks, filter, searchTerm, selectedTag));
}

/**
 * Determines if a task is overdue.
 * Returns false if task has no due date or is already completed.
 * Compares task.dueDate with today's date in user's local timezone.
 * Returns true only if dueDate is strictly before today.
 */
export function isOverdue(task: Task): boolean {
  if (task.completed || task.dueDate === undefined) {
    return false;
  }
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

/**
 * Calculates the next occurrence date for a recurring task.
 * @param currentDate ISO date string (YYYY-MM-DD)
 * @param pattern Recurrence pattern: 'daily', 'weekly', or 'monthly'
 * @returns Next occurrence date as ISO date string (YYYY-MM-DD)
 *
 * Rules:
 * - Daily: tomorrow's date
 * - Weekly: 7 days from currentDate
 * - Monthly: same day next month (handles month-end edge cases)
 */
export function calculateNextOccurrence(
  currentDate: string,
  pattern: "daily" | "weekly" | "monthly"
): string {
  const date = new Date(currentDate);

  if (pattern === "daily") {
    date.setDate(date.getDate() + 1);
  } else if (pattern === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (pattern === "monthly") {
    // Get the day of month from currentDate
    const dayOfMonth = new Date(currentDate).getDate();
    date.setMonth(date.getMonth() + 1);

    // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
    // If setting the day would result in a different month, back off to last day of previous month
    if (date.getDate() !== dayOfMonth) {
      date.setDate(0); // Set to last day of previous month
    }
  }

  // Format as ISO date string (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a nextOccurrence date for display.
 * @param nextOccurrence ISO date string (YYYY-MM-DD)
 * @returns Formatted string like "Next: May 22"
 */
export function getRecurrenceDisplay(nextOccurrence: string): string {
  const date = new Date(nextOccurrence);

  // Use Intl.DateTimeFormat for locale-aware formatting
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  const formatted = formatter.format(date);
  return `Next: ${formatted}`;
}
