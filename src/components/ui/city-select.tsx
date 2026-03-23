import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import CITIES from "@/data/cities";

interface CitySelectProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  allCitiesLabel?: string;
  required?: boolean;
  className?: string;
  variant?: "dark" | "glass";
  cities?: string[];
}

export default function CitySelect({
  value,
  onChange,
  placeholder = "Выберите город",
  allCitiesLabel,
  required = false,
  className = "",
  variant = "dark",
  cities,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = cities ?? CITIES;
  const filtered = query.trim()
    ? list.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : list;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setQuery("");
  };

  const isGlass = variant === "glass";

  const triggerClass = isGlass
    ? `bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer hover:border-white/20 w-full text-left flex items-center justify-between`
    : `w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors cursor-pointer text-left flex items-center justify-between`;

  const dropdownClass = isGlass
    ? `absolute z-50 mt-1 w-full min-w-[200px] bg-[#0f1117] border border-white/10 rounded-xl shadow-xl overflow-hidden`
    : `absolute z-50 mt-1 w-full bg-[#0f1117] border border-white/10 rounded-xl shadow-xl overflow-hidden`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isGlass && (
        <Icon
          name="MapPin"
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
        />
      )}
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "" : "text-gray-500"}>
          {value || allCitiesLabel || placeholder}
        </span>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={14}
          className="text-gray-500 flex-shrink-0"
        />
      </button>

      {required && !value && (
        <input
          tabIndex={-1}
          className="absolute opacity-0 w-0 h-0"
          required
          value=""
          onChange={() => {}}
        />
      )}

      {open && (
        <div className={dropdownClass}>
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Icon
                name="Search"
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск города..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto" role="listbox">
            {allCitiesLabel && (
              <li
                role="option"
                aria-selected={value === ""}
                onClick={() => select("")}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  value === ""
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                {allCitiesLabel}
              </li>
            )}
            {filtered.length === 0 && query.trim() && (
              <li
                role="option"
                onClick={() => select(query.trim())}
                className="px-4 py-2.5 text-sm cursor-pointer text-violet-400 hover:bg-violet-600/10 transition-colors flex items-center gap-2"
              >
                <Icon name="Plus" size={13} />
                Использовать «{query.trim()}»
              </li>
            )}
            {filtered.map((c) => (
              <li
                key={c}
                role="option"
                aria-selected={value === c}
                onClick={() => select(c)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  value === c
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}