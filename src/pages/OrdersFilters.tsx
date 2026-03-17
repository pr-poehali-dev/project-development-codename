import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";

interface OrdersFiltersProps {
  mainTab: "all" | "active" | "done";
  setMainTab: (tab: "all" | "active" | "done") => void;
  masterId: number | null;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  categories: string[];
  cities: string[];
}

export default function OrdersFilters({
  mainTab,
  setMainTab,
  masterId,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  activeCategory,
  setActiveCategory,
  categories,
  cities,
}: OrdersFiltersProps) {
  return (
    <>
      {/* Поиск */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Лента заявок</h1>
        <p className="text-gray-400 mb-5">Найди подходящий заказ и откликнись бесплатно — токены списываются только если заказчик выбрал тебя исполнителем</p>
        <div className="relative max-w-lg">
          <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по заявкам..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Основные табы */}
      <div className="flex gap-2 mb-6 bg-white/4 rounded-xl p-1 w-fit">
        <button
          onClick={() => setMainTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === "all" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          Все заявки
        </button>
        {masterId && (
          <>
            <button
              onClick={() => setMainTab("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === "active" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Мои отклики
            </button>
            <button
              onClick={() => setMainTab("done")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === "done" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Выполненные
            </button>
          </>
        )}
      </div>

      {/* Фильтр по городу */}
      <div className={`flex items-center gap-3 mb-5 flex-wrap ${mainTab !== "all" ? "hidden" : ""}`}>
        <CitySelect
          value={selectedCity}
          onChange={setSelectedCity}
          allCitiesLabel="Все города"
          variant="glass"
          cities={cities.filter(c => c !== "Все")}
        />
        {selectedCity && (
          <button onClick={() => setSelectedCity("")} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 transition-colors">
            <Icon name="X" size={14} />
            Сбросить
          </button>
        )}
      </div>

      {/* Фильтр по категориям */}
      <div className={`flex gap-2 flex-wrap mb-8 ${mainTab !== "all" ? "hidden" : ""}`}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              activeCategory === cat
                ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </>
  );
}
