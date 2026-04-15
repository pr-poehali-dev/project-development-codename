import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  master_id: number;
  master_name: string;
  avatar_color: string;
  rating: number | null;
  reviews_count: number;
  boosted_until: string | null;
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
    "Мастера и услуги — HandyMan",
    "Найдите проверенного мастера или услугу рядом с вами. Фильтр по городу и категории."
  );

  const [tab, setTab] = useState<"services" | "masters">("services");
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [servicesVisible, setServicesVisible] = useState(20);

  const isMaster = typeof window !== "undefined" && !!localStorage.getItem("master_phone");
  const isCustomer = typeof window !== "undefined" && !!localStorage.getItem("customer_phone");

  const [contactMaster, setContactMaster] = useState<{ id: number; name: string; serviceId?: number } | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");

  const loadData = async (c: string, cat: string, s: string) => {
    setLoading(true);
    try {
      const mastersParams = new URLSearchParams({ action: "masters" });
      if (c) mastersParams.set("city", c);
      if (cat) mastersParams.set("category", cat);
      if (s) mastersParams.set("search", s);

      const servicesParams = new URLSearchParams({ action: "services" });
      if (c) servicesParams.set("city", c);
      if (cat) servicesParams.set("category", cat);

      const [mRes, sRes] = await Promise.all([
        fetch(`${MASTER_URL}?${mastersParams}`),
        fetch(`${MASTER_URL}?${servicesParams}`),
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      const mParsed = typeof mData === "string" ? JSON.parse(mData) : mData;
      const sParsed = typeof sData === "string" ? JSON.parse(sData) : sData;
      setMasters(mParsed.masters || []);
      setServices(sParsed.services || []);
      if (mParsed.categories?.length) setCategories(mParsed.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(city, category, search);
    setServicesVisible(20);
  }, [city, category]);

  useEffect(() => {
    const t = setTimeout(() => { loadData(city, category, search); setServicesVisible(20); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMaster) return;
    setContactLoading(true); setContactError("");
    try {
      const res = await fetch(MASTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contact_master",
          master_id: contactMaster.id,
          service_id: contactMaster.serviceId,
          contact_name: contactForm.name,
          contact_phone: contactForm.phone,
          contact_email: contactForm.email,
          message: contactForm.message,
        }),
      });
      const data = await res.json();
      if (data.error) { setContactError(data.error); return; }
      setContactSent(true);
    } finally { setContactLoading(false); }
  };

  const shown = masters.filter(m => m.name && m.name !== "HandyMan");
  const filteredServices = search
    ? services.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.master_name.toLowerCase().includes(search.toLowerCase()))
    : services;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <Icon name="ChevronRight" size={16} className="text-gray-600" />
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
          <span className="text-white text-sm">Каталог</span>
        </div>
      </nav>

      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Каталог</h1>
          <p className="text-gray-400 text-sm mb-6">Объявления мастеров и профили специалистов</p>

          {/* Табы */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
            <button
              onClick={() => setTab("services")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${tab === "services" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Icon name="Briefcase" size={14} className="inline mr-1.5 -mt-0.5" />
              Объявления
              {!loading && filteredServices.length > 0 && <span className="ml-1.5 text-xs opacity-70">{filteredServices.length}</span>}
            </button>
            <button
              onClick={() => setTab("masters")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${tab === "masters" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Icon name="Users" size={14} className="inline mr-1.5 -mt-0.5" />
              Мастера
              {!loading && shown.length > 0 && <span className="ml-1.5 text-xs opacity-70">{shown.length}</span>}
            </button>
          </div>

          {/* Фильтры */}
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

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : tab === "services" ? (
            /* Объявления */
            filteredServices.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Icon name="Briefcase" size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg mb-2">Объявлений не найдено</p>
                <p className="text-gray-600 text-sm">Попробуйте изменить фильтры</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredServices.slice(0, servicesVisible).map((service) => {
                    const isBoosted = !!service.boosted_until && new Date(service.boosted_until) > new Date();
                    return (
                      <div
                        key={service.id}
                        className={`group rounded-xl p-3.5 transition-all flex flex-col relative ${
                          isBoosted
                            ? "bg-gradient-to-b from-amber-500/8 to-white/4 border border-amber-500/30 hover:border-amber-400/50"
                            : "bg-white/4 border border-white/8 hover:border-violet-500/40 hover:bg-white/6"
                        }`}
                      >
                        {isBoosted && (
                          <div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full" />
                        )}
                        <a href={`/master-page?id=${service.master_id}`} className="block flex-1">
                          <div className="flex items-start justify-between mb-2.5">
                            <Badge
                              className="text-[10px] px-2 py-0.5 rounded-md leading-tight"
                              style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
                            >
                              {service.category}
                            </Badge>
                            {isBoosted ? (
                              <span className="flex items-center gap-0.5 text-amber-400 text-[10px] font-medium">
                                <Icon name="Zap" size={10} />Топ
                              </span>
                            ) : service.rating ? (
                              <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                                <Icon name="Star" size={11} />
                                <span>{service.rating}</span>
                                <span className="text-gray-600 text-[10px]">({service.reviews_count})</span>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-[10px]">Новый</span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-2.5 leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
                            {service.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2.5">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: service.avatar_color }}
                            >
                              {service.master_name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-300 font-medium truncate">{service.master_name}</div>
                              {service.city && (
                                <div className="text-[10px] text-gray-600 flex items-center gap-0.5">
                                  <Icon name="MapPin" size={8} />{service.city}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              {service.price ? (
                                <>
                                  <span className="text-gray-500 text-[10px]">от</span>
                                  <span className="text-white font-bold text-sm ml-1">{service.price.toLocaleString("ru-RU")} ₽</span>
                                </>
                              ) : (
                                <span className="text-gray-500 text-xs">По договору</span>
                              )}
                            </div>
                            <span className="text-violet-400 text-[10px] hover:text-violet-300 transition-colors">Профиль →</span>
                          </div>
                        </a>
                        {!isMaster && (
                          <Button
                            size="sm"
                            className="w-full mt-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs rounded-lg h-7"
                            onClick={() => {
                              if (!isCustomer) { window.location.href = "/cabinet"; return; }
                              setContactMaster({ id: service.master_id, name: service.master_name, serviceId: service.id });
                              setContactForm({ name: "", phone: "", email: "", message: "" });
                              setContactSent(false);
                              setContactError("");
                            }}
                          >
                            <Icon name="MessageSquare" size={11} className="mr-1" />
                            Написать мастеру
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {servicesVisible < filteredServices.length && (
                  <div className="text-center mt-6">
                    <Button
                      variant="ghost"
                      className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-8"
                      onClick={() => setServicesVisible(v => v + 20)}
                    >
                      Показать ещё ({filteredServices.length - servicesVisible} осталось)
                    </Button>
                  </div>
                )}
              </>
            )
          ) : (
            /* Мастера */
            shown.length === 0 ? (
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
            )
          )}
        </div>
      </section>

      {/* Модалка обращения к мастеру */}
      {contactMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setContactMaster(null)}>
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Написать мастеру {contactMaster.name}</h3>
              <button onClick={() => setContactMaster(null)} className="text-gray-500 hover:text-white transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            {contactSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-emerald-400" />
                </div>
                <p className="text-white font-semibold mb-1">Обращение отправлено!</p>
                <p className="text-gray-400 text-sm">Мастер получит ваше сообщение и сможет ответить</p>
                <Button onClick={() => setContactMaster(null)} className="mt-5 bg-violet-600 hover:bg-violet-500 text-white w-full text-sm">
                  Закрыть
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ваше имя *</label>
                  <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Иван" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Телефон *</label>
                  <input required value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="+7 (999) 000-00-00" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Сообщение *</label>
                  <textarea required rows={3} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    placeholder="Опишите, что вам нужно..." />
                </div>
                {contactError && <p className="text-red-400 text-xs">{contactError}</p>}
                <Button type="submit" disabled={contactLoading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm">
                  {contactLoading ? "Отправка..." : "Отправить"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
