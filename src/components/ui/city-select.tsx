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
  placeholder = "Введите город",
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
    ? list.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : list.slice(0, 20);

  // Когда открывается — показываем текущее значение в поле
  const handleFocus = () => {
    setQuery(value || "");
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    if (e.target.value === "") onChange("");
  };

  const select = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Если ввод не совпадает с выбранным — сбрасываем к выбранному
        setQuery(value || "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const isGlass = variant === "glass";

  const inputClass = isGlass
    ? `bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors w-full ${open ? "border-violet-500" : "hover:border-white/20"}`
    : `w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors ${open ? "border-violet-500" : ""}`;

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
      <input
        ref={inputRef}
        type="text"
        value={open ? query : (value || "")}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={value || allCitiesLabel || placeholder}
        className={inputClass}
        required={required && !value}
        autoComplete="off"
      />
      <Icon
        name={open ? "ChevronUp" : "ChevronDown"}
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />

      {open && (
        <div className={dropdownClass}>
          <ul className="max-h-52 overflow-y-auto" role="listbox">
            {allCitiesLabel && !query.trim() && (
              <li
                role="option"
                aria-selected={value === ""}
                onClick={() => { onChange(""); setQuery(""); setOpen(false); }}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  value === ""
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                {allCitiesLabel}
              </li>
            )}
            {filtered.length === 0 && query.trim() ? (
              <li
                role="option"
                onClick={() => select(query.trim())}
                className="px-4 py-2.5 text-sm cursor-pointer text-violet-400 hover:bg-violet-600/10 transition-colors flex items-center gap-2"
              >
                <Icon name="Plus" size={13} />
                Использовать «{query.trim()}»
              </li>
            ) : (
              filtered.map((c) => (
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
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
