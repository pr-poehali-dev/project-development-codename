import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSeoMeta } from "@/hooks/useSeoMeta";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";
const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  contact_name: string;
  status: string;
  created_at: string;
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

const categories = [
  { name: "Авторемонт", icon: "Car", subcategories: ["Кузовной ремонт", "Автоэлектрика", "Шиномонтаж", "Детейлинг", "Диагностика", "Техническое обслуживание", "Другое"] },
  { name: "Ремонт жилья", icon: "Hammer", subcategories: ["Отделка и штукатурка", "Укладка плитки", "Укладка полов", "Покраска стен", "Натяжные потолки", "Демонтаж", "Другое"] },
  { name: "Строительство", icon: "HardHat", subcategories: ["Фундамент", "Кровля", "Забор и ворота", "Баня и беседка", "Кирпичная кладка", "Каркасный дом", "Другое"] },
  { name: "Бьюти", icon: "Sparkles", subcategories: ["Маникюр и педикюр", "Стрижка и окрашивание", "Брови и ресницы", "Макияж", "Эпиляция", "Наращивание волос", "Другое"] },
  { name: "Массаж", icon: "HandHeart", subcategories: ["Классический массаж", "Спортивный массаж", "Детский массаж", "Антицеллюлитный", "Лимфодренаж", "Массаж лица", "Другое"] },
  { name: "IT-помощь", icon: "Monitor", subcategories: ["Ремонт компьютеров", "Настройка ПО", "Разработка сайтов", "1С и бухгалтерия", "Настройка сетей", "Восстановление данных", "Другое"] },
  { name: "Сантехника", icon: "Wrench", subcategories: ["Установка сантехники", "Устранение засоров", "Монтаж труб", "Водонагреватели", "Канализация", "Тёплый пол", "Другое"] },
  { name: "Электрика", icon: "Zap", subcategories: ["Монтаж проводки", "Установка розеток", "Электрощиты", "Подключение техники", "Освещение", "Аварийный вызов", "Другое"] },
  { name: "Клининг", icon: "Sparkle", subcategories: ["Уборка квартиры", "Уборка офиса", "После ремонта", "Мойка окон", "Химчистка мебели", "Генеральная уборка", "Другое"] },
  { name: "Перевозки", icon: "Truck", subcategories: ["Квартирный переезд", "Офисный переезд", "Грузовое такси", "Доставка мебели", "Эвакуатор", "Межгород", "Другое"] },
  { name: "Няня", icon: "Baby", subcategories: ["Няня на день", "Ночная няня", "Няня-гувернантка", "Присмотр за пожилыми", "Помощь по хозяйству", "Сиделка", "Другое"] },
  { name: "Репетиторство", icon: "GraduationCap", subcategories: ["Математика", "Английский язык", "Подготовка к ЕГЭ/ОГЭ", "Другие языки", "Физика и химия", "Подготовка к школе", "Другое"] },
  { name: "Озеленение", icon: "Leaf", subcategories: ["Ландшафтный дизайн", "Посадка растений", "Стрижка газона", "Уборка листьев", "Полив и уход", "Вырубка деревьев", "Другое"] },
  { name: "Зоопомощь", icon: "PawPrint", subcategories: ["Выгул собак", "Стрижка животных", "Ветеринар на дом", "Передержка", "Дрессировка", "Зоотакси", "Другое"] },
  { name: "Мебель", icon: "Package", subcategories: ["Сборка из ИКЕА", "Корпусная мебель", "Кухни", "Шкафы-купе", "Детская мебель", "Разборка и перестановка", "Изготовление мебели", "Другое"] },
  { name: "Дизайн интерьера", icon: "PenRuler", subcategories: ["Дизайн-проект", "3D-визуализация", "Авторский надзор", "Подбор материалов", "Декорирование", "Планировка", "Другое"] },
  { name: "Фото/Видео", icon: "Camera", subcategories: ["Свадебная съёмка", "Семейная фотосессия", "Коммерческая съёмка", "Видеомонтаж", "Аэросъёмка", "Репортаж", "Другое"] },
  { name: "Уборка снега", icon: "Snowflake", subcategories: ["Уборка кровли", "Чистка двора", "Посыпка песком", "Вывоз снега", "Расчистка дорожек", "Коммерческие объекты", "Другое"] },
  { name: "Повар на мероприятие", icon: "ChefHat", subcategories: ["Банкет", "День рождения", "Корпоратив", "Барбекю", "Суши-мастер", "Детский праздник", "Другое"] },
  { name: "Тренер", icon: "Dumbbell", subcategories: ["Персональный тренинг", "Йога", "Пилатес", "Бокс и единоборства", "Плавание", "Онлайн-тренировки", "Другое"] },
  { name: "Аниматор", icon: "PartyPopper", subcategories: ["Детский праздник", "Аниматор в костюме", "Фокусник", "Клоун", "Ведущий праздника", "Корпоратив", "Другое"] },
  { name: "Юрист", icon: "Scale", subcategories: ["Консультация", "Составление договоров", "Семейное право", "Недвижимость", "Трудовые споры", "Представительство в суде", "Другое"] },
  { name: "Бухгалтер", icon: "Calculator", subcategories: ["Бухгалтерский учёт", "Налоговая отчётность", "УСН и ИП", "Расчёт зарплат", "1С-сопровождение", "Аудит", "Другое"] },
  { name: "Свадьба и торжества", icon: "Heart", subcategories: ["Тамада и ведущий", "Флорист и декор", "Выездная регистрация", "Кейтеринг", "Свадебный торт", "Организация праздника", "Другое"] },
  { name: "Курьер и доставка", icon: "PackageCheck", subcategories: ["Срочная доставка", "Доставка по городу", "Межгородская доставка", "Доставка документов", "Доставка цветов", "Грузовая доставка", "Другое"] },
  { name: "Охрана и безопасность", icon: "ShieldCheck", subcategories: ["Установка сигнализации", "Видеонаблюдение", "Установка замков", "Охрана мероприятий", "Домофоны и СКУД", "Пожарная безопасность", "Другое"] },
  { name: "Медицина на дому", icon: "Stethoscope", subcategories: ["Медсестра на дом", "Капельница", "Забор анализов", "Массаж лечебный", "Психолог онлайн", "Логопед", "Другое"] },
  { name: "Переводчик", icon: "Languages", subcategories: ["Устный перевод", "Письменный перевод", "Нотариальный перевод", "Синхронный перевод", "Перевод документов", "Апостиль", "Другое"] },
  { name: "Хендмейд", icon: "Scissors", subcategories: ["Пошив одежды", "Ювелирные украшения", "Роспись и гравировка", "Вязание и шитьё", "Декупаж", "Подарки на заказ", "Другое"] },
  { name: "Прочее", icon: "MoreHorizontal", subcategories: [] },
];

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const decoded = decodeURIComponent(name || "");
  const cat = categories.find(c => c.name === decoded);
  const hasSubcategories = (cat?.subcategories?.length ?? 0) > 0;

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesVisible, setServicesVisible] = useState(20);

  // Контакт с мастером
  const [contactMaster, setContactMaster] = useState<{ id: number; name: string; serviceId?: number } | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");
  const isMaster = typeof window !== "undefined" && !!localStorage.getItem("master_phone");
  const isCustomer = typeof window !== "undefined" && !!localStorage.getItem("customer_phone");

  // Заявки (для категорий без подкатегорий)
  useEffect(() => {
    if (!cat || hasSubcategories) return;
    setOrdersLoading(true);
    fetch(`${ORDERS_URL}?tab=all`)
      .then(r => r.json())
      .then(data => {
        const raw = typeof data === "string" ? JSON.parse(data) : data;
        const all: Order[] = raw.orders || [];
        setOrders(all.filter(o => o.category === cat.name));
      })
      .finally(() => setOrdersLoading(false));
  }, [cat?.name]);

  // Объявления (услуги мастеров по категории)
  useEffect(() => {
    if (!cat) return;
    setServicesLoading(true);
    const params = new URLSearchParams({ action: "services", category: cat.name });
    fetch(`${MASTER_URL}?${params}`)
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setServices(parsed.services || []);
      })
      .finally(() => setServicesLoading(false));
  }, [cat?.name]);

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

  const seoTitle = cat
    ? `${cat.name} — найти мастера | HandyMan`
    : "Категория не найдена | HandyMan";
  const seoDesc = cat
    ? `Найдите мастера по категории «${cat.name}»: ${cat.subcategories.slice(0, 4).join(", ")} и другие услуги. Быстро, удобно, надёжно.`
    : "";
  const canonical = cat
    ? `${window.location.origin}/category/${encodeURIComponent(cat.name)}`
    : undefined;
  useSeoMeta(seoTitle, seoDesc, canonical);

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Категория не найдена</p>
          <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors">← На главную</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
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
          <a href="/#categories" className="text-gray-400 hover:text-white text-sm transition-colors">Категории</a>
          <Icon name="ChevronRight" size={16} className="text-gray-600" />
          <span className="text-white text-sm">{cat.name}</span>
        </div>
      </nav>

      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Icon name={cat.icon} size={28} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{cat.name}</h1>
              <p className="text-gray-400 mt-1 text-sm">{hasSubcategories ? "Выбери подкатегорию или смотри все заявки" : "Заявки в этой категории"}</p>
            </div>
          </div>

          {/* Объявления мастеров */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="Briefcase" size={18} className="text-violet-400" />
              Объявления мастеров
              {!servicesLoading && services.length > 0 && (
                <span className="text-gray-500 text-base font-normal">{services.length}</span>
              )}
            </h2>
            {servicesLoading ? (
              <div className="flex items-center gap-3 text-gray-500 py-6">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Загрузка...
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Briefcase" size={28} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500 text-sm">Мастера ещё не опубликовали объявления в этой категории</p>
                <a href="/master?tab=services">
                  <Button className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs">
                    Опубликовать объявление
                  </Button>
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {services.slice(0, servicesVisible).map((service) => {
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
                                  <Icon name="MapPin" size={9} />{service.city}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2.5 border-t border-white/6 mb-2">
                            <div>
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
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs rounded-lg h-7"
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
                {servicesVisible < services.length && (
                  <div className="text-center mt-6">
                    <Button
                      variant="ghost"
                      className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-8"
                      onClick={() => setServicesVisible(v => v + 20)}
                    >
                      Показать ещё ({services.length - servicesVisible} осталось)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {hasSubcategories ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <a
                  href={`/orders?category=${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
                >
                  <Icon name="LayoutList" size={15} />
                  Все заявки
                </a>
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    filtersOpen
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                      : "bg-white/4 border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon name="SlidersHorizontal" size={15} />
                  Подкатегории
                  <span className="text-xs opacity-60">({cat.subcategories.length})</span>
                  <Icon name={filtersOpen ? "ChevronUp" : "ChevronDown"} size={14} className="opacity-60" />
                </button>
              </div>

              {filtersOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-200">
                  {cat.subcategories.map((sub) => (
                    <a
                      key={sub}
                      href={`/orders?category=${encodeURIComponent(sub)}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-violet-600/10 hover:border-violet-500/40 hover:text-violet-300 transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-200 group-hover:text-violet-300">{sub}</span>
                      <Icon name="ArrowRight" size={16} className="text-gray-600 group-hover:text-violet-400 transition-colors" />
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Нет подкатегорий — показываем заявки сразу */
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                Заявки
                {!ordersLoading && <span className="text-gray-500 text-base font-normal">{orders.length}</span>}
              </h2>
              {ordersLoading ? (
                <div className="flex items-center gap-3 text-gray-500 py-8">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  Загрузка...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="ClipboardList" size={32} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">Заявок в этой категории пока нет</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map(o => (
                    <a
                      key={o.id}
                      href={`/orders`}
                      className="block p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-white font-medium text-sm">{o.title}</p>
                        {o.budget && <span className="text-emerald-400 text-xs whitespace-nowrap">до {o.budget.toLocaleString("ru-RU")} ₽</span>}
                      </div>
                      {o.description && <p className="text-gray-500 text-xs line-clamp-2 mb-2">{o.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {o.city && <span className="flex items-center gap-1"><Icon name="MapPin" size={10} />{o.city}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Модальное окно: написать мастеру */}
      {contactMaster && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setContactMaster(null)}>
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Написать {contactMaster.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">Мастер получит уведомление и свяжется с вами</p>
              </div>
              <button onClick={() => setContactMaster(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            {contactSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-emerald-400" />
                </div>
                <p className="text-white font-semibold mb-1">Сообщение отправлено!</p>
                <p className="text-gray-400 text-sm">Мастер получил уведомление и свяжется с вами</p>
                <Button onClick={() => setContactMaster(null)} className="mt-5 bg-violet-600 hover:bg-violet-500 text-white w-full">Закрыть</Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Ваше имя *</label>
                  <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Иван Иванов" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Телефон</label>
                  <input type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 000-00-00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Сообщение *</label>
                  <textarea required rows={3} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} placeholder="Что нужно сделать?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                </div>
                {contactError && <p className="text-amber-400 text-sm">{contactError}</p>}
                <Button type="submit" disabled={contactLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full mt-1">
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