"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search or filter by tag..."
        className="flex-1 text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-1 rounded hover:bg-gray-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
