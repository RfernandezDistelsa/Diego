"use client";

interface DueDateInputProps {
  value?: string;
  onChange: (date: string | undefined) => void;
}

export function DueDateInput({ value, onChange }: DueDateInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue || undefined);
  }

  function handleClear() {
    onChange(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="task-due-date" className="text-sm font-semibold text-slate-900">
        Due date (optional)
      </label>
      <div className="flex gap-2 items-center">
        <input
          id="task-due-date"
          type="date"
          value={value ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent flex-1 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-2 rounded hover:bg-gray-100"
            aria-label="Clear due date"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
