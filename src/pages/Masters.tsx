import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { useSeoMeta } from "@/hooks/useSeoMeta";

const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Master {
  id: number;
  name: string;
  category: string | null;
  categories: string[];
  city: string;
  about: string;
  avatar_color: string;
  rating: number | null;
  reviews_count: number;
  services_count: number;
}

function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Icon name="Star" size={12} />
      {rating.toFixed(1)}
    </span>
  );
}

export default function Masters() {
  useSeoMeta(
    "Мастера — HandyMan",
    "Найдите проверенного мастера рядом с вами. Фильтр по городу и категории."
  );

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const loadMasters = async (c: string, cat: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "masters" });
      if (c) params.set("city", c);
      if (cat) params.set("category", cat);
      if (s) params.set("search", s);
      const res = await fetch(`${MASTER_URL}?${params}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setMasters(parsed.masters || []);
      if (parsed.categories?.length) setCategories(parsed.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters(city, category, search);
  }, [city, category]);

  useEffect(() => {
    const t = setTimeout(() => loadMasters(city, category, search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const shown = masters.filter(m => m.name && m.name !== "HandyMan");

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <a href="/" className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg"
              alt="HandyMan"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              HandyMan
            </span>
          </a>
          <Icon name="ChevronRight" size={16} className="text-gray-600" />
          <span className="text-white text-sm">Мастера</span>
        </div>
      </nav>

      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Мастера</h1>
          <p className="text-gray-400 text-sm mb-8">Выберите специалиста и напишите ему напрямую</p>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по имени или специализации..."
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

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors"
              style={{ colorScheme: "dark" }}
            >
              <option value="">Все категории</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

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

          {/* Счётчик */}
          {!loading && (
            <p className="text-gray-500 text-sm mb-5">
              {shown.length}{" "}
              {shown.length === 1 ? "мастер" : shown.length >= 2 && shown.length <= 4 ? "мастера" : "мастеров"}
            </p>
          )}

          {/* Список */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : shown.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg mb-2">Мастера не найдены</p>
              <p className="text-gray-600 text-sm">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shown.map(m => (
                <a
                  key={m.id}
                  href={`/master-page?id=${m.id}`}
                  className="group bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={m.name} color={m.avatar_color} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm truncate">{m.name}</span>
                        <StarRating rating={m.rating} />
                      </div>
                      {(m.categories.length > 0 || m.category) && (
                        <p className="text-violet-400 text-xs mt-0.5 truncate">
                          {m.categories.length > 0 ? m.categories.slice(0, 2).join(", ") : m.category}
                        </p>
                      )}
                      {m.city && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <Icon name="MapPin" size={11} />
                          {m.city}
                        </div>
                      )}
                    </div>
                  </div>

                  {m.about && (
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{m.about}</p>
                  )}

                  <div className="flex items-center gap-3 mt-auto pt-1 border-t border-white/6 text-xs text-gray-500">
                    {m.reviews_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon name="MessageSquare" size={11} />
                        {m.reviews_count} отзыв{m.reviews_count === 1 ? "" : m.reviews_count <= 4 ? "а" : "ов"}
                      </span>
                    )}
                    {m.services_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon name="Briefcase" size={11} />
                        {m.services_count} услуг{m.services_count === 1 ? "а" : m.services_count <= 4 ? "и" : ""}
                      </span>
                    )}
                    <span className="ml-auto text-violet-400 group-hover:text-violet-300 transition-colors flex items-center gap-1">
                      Профиль <Icon name="ArrowRight" size={11} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
