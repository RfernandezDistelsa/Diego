"use client";

import { useState } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState<string>("");

  function handleAddTag() {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    if (value.some((tag) => tag.toLowerCase() === trimmed)) {
      setInput("");
      return;
    }

    onChange([...value, trimmed]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleRemoveTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="tag-input" className="text-sm font-semibold text-slate-900">
        Tags (optional)
      </label>
      <input
        id="tag-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type tag and press Enter..."
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-0 focus:border-transparent transition-all"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                aria-label={`Remove tag: ${tag}`}
                className="text-purple-600 hover:text-purple-900 font-bold ml-0.5"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
