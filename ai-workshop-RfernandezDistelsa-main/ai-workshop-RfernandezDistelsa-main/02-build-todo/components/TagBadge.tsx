"use client";

interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
}

function getTagColor(tag: string): string {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-yellow-100 text-yellow-700",
    "bg-pink-100 text-pink-700",
    "bg-orange-100 text-orange-700",
    "bg-red-100 text-red-700",
    "bg-indigo-100 text-indigo-700",
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
  const color = getTagColor(tag);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${color} ${
        onClick ? "cursor-pointer hover:shadow-md transition-all" : ""
      }`}
      aria-label={onClick ? `Filter by tag: ${tag}` : tag}
    >
      #{tag}
    </button>
  );
}
