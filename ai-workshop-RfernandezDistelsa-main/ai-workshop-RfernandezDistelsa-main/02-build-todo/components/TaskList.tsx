import { getVisibleTasks } from "@/lib/tasks";
import type { Task, FilterStatus } from "@/lib/types";
import { TaskItem } from "@/components/TaskItem";

const EMPTY_MESSAGES: Record<FilterStatus, { text: string; emoji: string }> = {
  open: { text: "No open tasks — great job!", emoji: "🎉" },
  done: { text: "No completed tasks yet.", emoji: "📭" },
  overdue: { text: "No overdue tasks — you're on top of it!", emoji: "✨" },
  all: { text: "No tasks yet. Press N to add one.", emoji: "🚀" },
};

interface TaskListProps {
  tasks: Task[];
  filter: FilterStatus;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onTagClick?: (tag: string) => void;
  searchTerm?: string;
  selectedTag?: string;
}

export function TaskList({
  tasks,
  filter,
  onToggle,
  onDelete,
  onEdit,
  onTagClick,
  searchTerm,
  selectedTag,
}: TaskListProps) {
  const visible = getVisibleTasks(tasks, filter, searchTerm, selectedTag);

  if (visible.length === 0) {
    const { text, emoji } = EMPTY_MESSAGES[filter];
    return (
      <div className="text-center py-12 px-4">
        <p className="text-3xl mb-2">{emoji}</p>
        <p className="text-sm text-slate-500 font-medium">
          {text}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {visible.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onTagClick={onTagClick}
        />
      ))}
    </ul>
  );
}
