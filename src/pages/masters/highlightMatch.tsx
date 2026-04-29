import { ReactNode } from "react";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatch(text: string | null | undefined, query: string): ReactNode {
  if (!text) return text || "";
  const q = query.trim();
  if (!q) return text;
  try {
    const re = new RegExp(`(${escapeRegex(q)})`, "ig");
    const parts = text.split(re);
    const lowerQ = q.toLowerCase();
    return parts.map((part, i) =>
      part.toLowerCase() === lowerQ
        ? <mark key={i} className="bg-violet-500/30 text-violet-100 rounded px-0.5">{part}</mark>
        : <span key={i}>{part}</span>
    );
  } catch {
    return text;
  }
}