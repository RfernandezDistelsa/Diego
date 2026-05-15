"use client";

import type { FilterStatus } from "@/lib/types";

interface FilterToggleProps {
  activeFilter: FilterStatus;
  onChange: (filter: FilterStatus) => void;
}

const FILTERS: { value: FilterStatus; label: string; emoji: string }[] = [
  { value: "open", label: "Open", emoji: "📋" },
  { value: "done", label: "Done", emoji: "✅" },
  { value: "overdue", label: "Overdue", emoji: "⚠️" },
  { value: "all", label: "All", emoji: "📚" },
];

export function FilterToggle({ activeFilter, onChange }: FilterToggleProps) {
  return (
    <fieldset className="flex gap-2 items-center flex-wrap">
      <legend className="sr-only">Filter tasks</legend>
      {FILTERS.map(({ value, label, emoji }) => (
        <label
          key={value}
          className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeFilter === value
              ? "bg-[#FF8C42] text-white shadow-md"
              : "bg-gray-200 text-slate-700 hover:bg-gray-300"
          }`}
        >
          <input
            type="radio"
            name="filter"
            value={value}
            checked={activeFilter === value}
            onChange={() => onChange(value)}
            className="sr-only"
            aria-label={label}
          />
          <span className="mr-1">{emoji}</span>
          {label}
        </label>
      ))}
    </fieldset>
  );
}
