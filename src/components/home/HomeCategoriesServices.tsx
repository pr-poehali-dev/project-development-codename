import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";

const categories = [
  { name: "Авторемонт", icon: "Car", count: 312, subcategories: ["Кузовной ремонт", "Автоэлектрика", "Шиномонтаж", "Детейлинг", "Диагностика", "Техническое обслуживание"] },
  { name: "Ремонт жилья", icon: "Hammer", count: 278, subcategories: ["Отделка и штукатурка", "Укладка плитки", "Укладка полов", "Покраска стен", "Натяжные потолки", "Демонтаж"] },
  { name: "Строительство", icon: "HardHat", count: 194, subcategories: ["Фундамент", "Кровля", "Забор и ворота", "Баня и беседка", "Кирпичная кладка", "Каркасный дом"] },
  { name: "Бьюти", icon: "Sparkles", count: 221, subcategories: ["Маникюр и педикюр", "Стрижка и окрашивание", "Брови и ресницы", "Макияж", "Эпиляция", "Наращивание волос"] },
  { name: "Массаж", icon: "HandHeart", count: 78, subcategories: ["Классический массаж", "Спортивный массаж", "Детский массаж", "Антицеллюлитный", "Лимфодренаж", "Массаж лица"] },
  { name: "IT-помощь", icon: "Monitor", count: 143, subcategories: ["Ремонт компьютеров", "Настройка ПО", "Разработка сайтов", "1С и бухгалтерия", "Настройка сетей", "Восстановление данных"] },
  { name: "Сантехника", icon: "Wrench", count: 167, subcategories: ["Установка сантехники", "Устранение засоров", "Монтаж труб", "Водонагреватели", "Канализация", "Тёплый пол"] },
  { name: "Электрика", icon: "Zap", count: 189, subcategories: ["Монтаж проводки", "Установка розеток", "Электрощиты", "Подключение техники", "Освещение", "Аварийный вызов"] },
  { name: "Клининг", icon: "Sparkle", count: 156, subcategories: ["Уборка квартиры", "Уборка офиса", "После ремонта", "Мойка окон", "Химчистка мебели", "Генеральная уборка"] },
  { name: "Перевозки", icon: "Truck", count: 134, subcategories: ["Квартирный переезд", "Офисный переезд", "Грузовое такси", "Доставка мебели", "Эвакуатор", "Межгород"] },
  { name: "Няня", icon: "Baby", count: 98, subcategories: ["Няня на день", "Ночная няня", "Няня-гувернантка", "Присмотр за пожилыми", "Помощь по хозяйству", "Сиделка"] },
  { name: "Репетиторство", icon: "GraduationCap", count: 103, subcategories: ["Математика", "Английский язык", "Подготовка к ЕГЭ/ОГЭ", "Другие языки", "Физика и химия", "Подготовка к школе"] },
  { name: "Озеленение", icon: "Leaf", count: 74, subcategories: ["Ландшафтный дизайн", "Посадка растений", "Стрижка газона", "Уборка листьев", "Полив и уход", "Вырубка деревьев"] },
  { name: "Зоопомощь", icon: "PawPrint", count: 61, subcategories: ["Выгул собак", "Стрижка животных", "Ветеринар на дом", "Передержка", "Дрессировка", "Зоотакси"] },
  { name: "Сборка мебели", icon: "Package", count: 112, subcategories: ["Сборка из ИКЕА", "Корпусная мебель", "Кухни", "Шкафы-купе", "Детская мебель", "Разборка и перестановка"] },
  { name: "Дизайн интерьера", icon: "PenRuler", count: 55, subcategories: ["Дизайн-проект", "3D-визуализация", "Авторский надзор", "Подбор материалов", "Декорирование", "Планировка"] },
  { name: "Фото/Видео", icon: "Camera", count: 89, subcategories: ["Свадебная съёмка", "Семейная фотосессия", "Коммерческая съёмка", "Видеомонтаж", "Аэросъёмка", "Репортаж"] },
  { name: "Уборка снега", icon: "Snowflake", count: 43, subcategories: ["Уборка кровли", "Чистка двора", "Посыпка песком", "Вывоз снега", "Расчистка дорожек", "Коммерческие объекты"] },
  { name: "Повар на мероприятие", icon: "ChefHat", count: 49, subcategories: ["Банкет", "День рождения", "Корпоратив", "Барбекю", "Суши-мастер", "Детский праздник"] },
  { name: "Тренер", icon: "Dumbbell", count: 67, subcategories: ["Персональный тренинг", "Йога", "Пилатес", "Бокс и единоборства", "Плавание", "Онлайн-тренировки"] },
  { name: "Аниматор", icon: "PartyPopper", count: 38, subcategories: ["Детский праздник", "Аниматор в костюме", "Фокусник", "Клоун", "Ведущий праздника", "Корпоратив"] },
  { name: "Юрист", icon: "Scale", count: 52, subcategories: ["Консультация", "Составление договоров", "Семейное право", "Недвижимость", "Трудовые споры", "Представительство в суде"] },
  { name: "Бухгалтер", icon: "Calculator", count: 44, subcategories: ["Бухгалтерский учёт", "Налоговая отчётность", "УСН и ИП", "Расчёт зарплат", "1С-сопровождение", "Аудит"] },
  { name: "Свадьба и торжества", icon: "Heart", count: 61, subcategories: ["Тамада и ведущий", "Флорист и декор", "Выездная регистрация", "Кейтеринг", "Свадебный торт", "Организация праздника"] },
  { name: "Курьер и доставка", icon: "PackageCheck", count: 48, subcategories: ["Срочная доставка", "Доставка по городу", "Межгородская доставка", "Доставка документов", "Доставка цветов", "Грузовая доставка"] },
  { name: "Охрана и безопасность", icon: "ShieldCheck", count: 34, subcategories: ["Установка сигнализации", "Видеонаблюдение", "Установка замков", "Охрана мероприятий", "Домофоны и СКУД", "Пожарная безопасность"] },
  { name: "Медицина на дому", icon: "Stethoscope", count: 29, subcategories: ["Медсестра на дом", "Капельница", "Забор анализов", "Массаж лечебный", "Психолог онлайн", "Логопед"] },
  { name: "Переводчик", icon: "Languages", count: 22, subcategories: ["Устный перевод", "Письменный перевод", "Нотариальный перевод", "Синхронный перевод", "Перевод документов", "Апостиль"] },
  { name: "Хендмейд", icon: "Scissors", count: 31, subcategories: ["Пошив одежды", "Ювелирные украшения", "Роспись и гравировка", "Вязание и шитьё", "Декупаж", "Подарки на заказ"] },
  { name: "Прочее", icon: "MoreHorizontal", count: 87, subcategories: [] },
];

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
}

interface HomeCategoriesServicesProps {
  activeCategory: string;
  selectedCity: string;
  setSelectedCityFilter: (city: string) => void;
  services: Service[];
  availableCities: string[];
  servicesLoading: boolean;
  setOrderForm: (fn: (f: { title: string; description: string; category: string; city: string; budget: string; contact_name: string; contact_phone: string; contact_email: string }) => { title: string; description: string; category: string; city: string; budget: string; contact_name: string; contact_phone: string; contact_email: string }) => void;
  setOrderModalOpen: (v: boolean) => void;
}

const HomeCategoriesServices = ({
  activeCategory,
  selectedCity,
  setSelectedCityFilter,
  services,
  availableCities,
  servicesLoading,
  setOrderForm,
  setOrderModalOpen,
}: HomeCategoriesServicesProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(20);
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? services.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.master_name.toLowerCase().includes(q)
      )
    : services;
  const visible = filtered.slice(0, visibleCount);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, selectedCity]);

  return (
    <>
      {/* Категории */}
      <section id="categories" className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Категории услуг</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <a
              href="/orders"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white"
            >
              <Icon name="LayoutGrid" size={22} />
              <span className="text-xs font-medium text-center">Все</span>
            </a>
            {categories.map((cat) => (
              <a
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all bg-white/3 border-white/8 text-gray-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-600/10"
              >
                <Icon name={cat.icon} size={22} />
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                <span className="text-[10px] text-gray-600">{cat.count}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Карточки услуг */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl font-bold">
                {activeCategory === "Все" ? "Все услуги" : activeCategory}
                {!servicesLoading && (
                  <span className="text-gray-500 text-base font-normal ml-3">
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "услуга" : filtered.length >= 2 && filtered.length <= 4 ? "услуги" : "услуг"}
                  </span>
                )}
              </h2>
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск услуг..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors w-48"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <Icon name="X" size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CitySelect
                value={selectedCity}
                onChange={setSelectedCityFilter}
                allCitiesLabel="Все города"
                variant="glass"
                className="w-44"
              />
              <a href={activeCategory === "Все" ? "/orders" : `/orders?category=${encodeURIComponent(activeCategory)}`}>
                <Button variant="ghost" className="text-gray-400 hover:text-white text-sm gap-2">
                  <Icon name="SlidersHorizontal" size={16} />
                  Все заявки →
                </Button>
              </a>
            </div>
          </div>

          {servicesLoading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Icon name="Briefcase" size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-lg mb-2">{q ? "Ничего не найдено" : "Услуг пока нет"}</p>
              <p className="text-gray-600 text-sm">{q ? `По запросу «${searchQuery}» услуги не найдены` : "Мастера ещё не опубликовали услуги в этой категории"}</p>
              {q ? (
                <button onClick={() => setSearchQuery("")} className="mt-4 text-violet-400 hover:text-violet-300 text-sm transition-colors">Сбросить поиск</button>
              ) : (
                <a href="/master?tab=services">
                  <Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Я мастер — опубликовать услугу</Button>
                </a>
              )}
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visible.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white/4 border border-white/8 rounded-xl p-3.5 hover:border-violet-500/40 hover:bg-white/6 transition-all flex flex-col"
                >
                  <a href={`/master-page?id=${service.master_id}`} className="block flex-1">
                    <div className="flex items-start justify-between mb-2.5">
                      <Badge
                        className="text-[10px] px-2 py-0.5 rounded-md leading-tight"
                        style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
                      >
                        {service.category}
                      </Badge>
                      {service.rating ? (
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

                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs rounded-lg h-7"
                    onClick={() => {
                      setOrderForm(f => ({ ...f, category: service.category, city: service.city || "" }));
                      setOrderModalOpen(true);
                    }}
                  >
                    <Icon name="Send" size={11} className="mr-1" />
                    Оставить заявку
                  </Button>
                </div>
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center mt-8">
                <Button
                  variant="ghost"
                  className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-8"
                  onClick={() => setVisibleCount(v => v + 20)}
                >
                  Показать ещё ({filtered.length - visibleCount} осталось)
                </Button>
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default HomeCategoriesServices;