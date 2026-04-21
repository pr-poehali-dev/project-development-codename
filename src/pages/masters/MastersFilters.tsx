import { useRef, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { categories as ALL_CATEGORIES } from "@/components/home/categories";

interface MastersFiltersProps {
  tab: "services" | "masters";
  search: string;
  setSearch: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
}

export default function MastersFilters({
  tab,
  search,
  setSearch,
  city,
  setCity,
  category,
  setCategory,
}: MastersFiltersProps) {
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectedCat = ALL_CATEGORIES.find(c => c.name === category);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <div className="relative">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "services" ? "Поиск по объявлениям..." : "Поиск по имени или специализации..."}
          className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors w-64"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <Icon name="X" size={12} />
          </button>
        )}
      </div>

      <CitySelect
        value={city}
        onChange={setCity}
        allCitiesLabel="Все города"
        variant="glass"
        className="w-44"
      />

      <div ref={catRef} className="relative">
        <button
          type="button"
          onClick={() => setCatOpen(o => !o)}
          className={`flex items-center gap-2 bg-white/5 border rounded-xl pl-3 pr-8 py-2 text-sm text-white transition-colors min-w-[180px] ${catOpen ? "border-violet-500" : "border-white/10 hover:border-white/20"}`}
        >
          {selectedCat ? (
            <>
              <Icon name={selectedCat.icon} size={14} className="text-violet-400 flex-shrink-0" />
              <span className="truncate">{selectedCat.name}</span>
            </>
          ) : (
            <>
              <Icon name="LayoutGrid" size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-gray-400">Все категории</span>
            </>
          )}
          <Icon
            name={catOpen ? "ChevronUp" : "ChevronDown"}
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </button>

        {catOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[240px] bg-[#0f1117] border border-white/10 rounded-xl shadow-xl overflow-hidden">
            <ul className="max-h-80 overflow-y-auto py-1" role="listbox">
              <li
                role="option"
                aria-selected={category === ""}
                onClick={() => { setCategory(""); setCatOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  category === "" ? "bg-violet-600/20 text-violet-300" : "text-gray-400 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon name="LayoutGrid" size={14} />
                Все категории
              </li>
              {ALL_CATEGORIES.map(c => (
                <li
                  key={c.name}
                  role="option"
                  aria-selected={category === c.name}
                  onClick={() => { setCategory(c.name); setCatOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                    category === c.name ? "bg-violet-600/20 text-violet-300" : "text-gray-400 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon name={c.icon} size={14} />
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(city || category || search) && (
        <button
          onClick={() => { setCity(""); setCategory(""); setSearch(""); }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-xl border border-white/10 hover:border-white/20"
        >
          <Icon name="X" size={13} />
          Сбросить
        </button>
      )}
    </div>
  );
}
