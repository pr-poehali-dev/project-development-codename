import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useSeoMeta } from "@/hooks/useSeoMeta";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";

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

const categories = [
  { name: "Авторемонт", icon: "Car", subcategories: ["Кузовной ремонт", "Автоэлектрика", "Шиномонтаж", "Детейлинг", "Диагностика", "Техническое обслуживание"] },
  { name: "Ремонт жилья", icon: "Hammer", subcategories: ["Отделка и штукатурка", "Укладка плитки", "Укладка полов", "Покраска стен", "Натяжные потолки", "Демонтаж"] },
  { name: "Строительство", icon: "HardHat", subcategories: ["Фундамент", "Кровля", "Забор и ворота", "Баня и беседка", "Кирпичная кладка", "Каркасный дом"] },
  { name: "Бьюти", icon: "Sparkles", subcategories: ["Маникюр и педикюр", "Стрижка и окрашивание", "Брови и ресницы", "Макияж", "Эпиляция", "Наращивание волос"] },
  { name: "Массаж", icon: "HandHeart", subcategories: ["Классический массаж", "Спортивный массаж", "Детский массаж", "Антицеллюлитный", "Лимфодренаж", "Массаж лица"] },
  { name: "IT-помощь", icon: "Monitor", subcategories: ["Ремонт компьютеров", "Настройка ПО", "Разработка сайтов", "1С и бухгалтерия", "Настройка сетей", "Восстановление данных"] },
  { name: "Сантехника", icon: "Wrench", subcategories: ["Установка сантехники", "Устранение засоров", "Монтаж труб", "Водонагреватели", "Канализация", "Тёплый пол"] },
  { name: "Электрика", icon: "Zap", subcategories: ["Монтаж проводки", "Установка розеток", "Электрощиты", "Подключение техники", "Освещение", "Аварийный вызов"] },
  { name: "Клининг", icon: "Sparkle", subcategories: ["Уборка квартиры", "Уборка офиса", "После ремонта", "Мойка окон", "Химчистка мебели", "Генеральная уборка"] },
  { name: "Перевозки", icon: "Truck", subcategories: ["Квартирный переезд", "Офисный переезд", "Грузовое такси", "Доставка мебели", "Эвакуатор", "Межгород"] },
  { name: "Няня", icon: "Baby", subcategories: ["Няня на день", "Ночная няня", "Няня-гувернантка", "Присмотр за пожилыми", "Помощь по хозяйству", "Сиделка"] },
  { name: "Репетиторство", icon: "GraduationCap", subcategories: ["Математика", "Английский язык", "Подготовка к ЕГЭ/ОГЭ", "Другие языки", "Физика и химия", "Подготовка к школе"] },
  { name: "Озеленение", icon: "Leaf", subcategories: ["Ландшафтный дизайн", "Посадка растений", "Стрижка газона", "Уборка листьев", "Полив и уход", "Вырубка деревьев"] },
  { name: "Зоопомощь", icon: "PawPrint", subcategories: ["Выгул собак", "Стрижка животных", "Ветеринар на дом", "Передержка", "Дрессировка", "Зоотакси"] },
  { name: "Сборка мебели", icon: "Package", subcategories: ["Сборка из ИКЕА", "Корпусная мебель", "Кухни", "Шкафы-купе", "Детская мебель", "Разборка и перестановка"] },
  { name: "Дизайн интерьера", icon: "PenRuler", subcategories: ["Дизайн-проект", "3D-визуализация", "Авторский надзор", "Подбор материалов", "Декорирование", "Планировка"] },
  { name: "Фото/Видео", icon: "Camera", subcategories: ["Свадебная съёмка", "Семейная фотосессия", "Коммерческая съёмка", "Видеомонтаж", "Аэросъёмка", "Репортаж"] },
  { name: "Уборка снега", icon: "Snowflake", subcategories: ["Уборка кровли", "Чистка двора", "Посыпка песком", "Вывоз снега", "Расчистка дорожек", "Коммерческие объекты"] },
  { name: "Повар на мероприятие", icon: "ChefHat", subcategories: ["Банкет", "День рождения", "Корпоратив", "Барбекю", "Суши-мастер", "Детский праздник"] },
  { name: "Тренер", icon: "Dumbbell", subcategories: ["Персональный тренинг", "Йога", "Пилатес", "Бокс и единоборства", "Плавание", "Онлайн-тренировки"] },
  { name: "Аниматор", icon: "PartyPopper", subcategories: ["Детский праздник", "Аниматор в костюме", "Фокусник", "Клоун", "Ведущий праздника", "Корпоратив"] },
  { name: "Юрист", icon: "Scale", subcategories: ["Консультация", "Составление договоров", "Семейное право", "Недвижимость", "Трудовые споры", "Представительство в суде"] },
  { name: "Бухгалтер", icon: "Calculator", subcategories: ["Бухгалтерский учёт", "Налоговая отчётность", "УСН и ИП", "Расчёт зарплат", "1С-сопровождение", "Аудит"] },
  { name: "Свадьба и торжества", icon: "Heart", subcategories: ["Тамада и ведущий", "Флорист и декор", "Выездная регистрация", "Кейтеринг", "Свадебный торт", "Организация праздника"] },
  { name: "Курьер и доставка", icon: "PackageCheck", subcategories: ["Срочная доставка", "Доставка по городу", "Межгородская доставка", "Доставка документов", "Доставка цветов", "Грузовая доставка"] },
  { name: "Охрана и безопасность", icon: "ShieldCheck", subcategories: ["Установка сигнализации", "Видеонаблюдение", "Установка замков", "Охрана мероприятий", "Домофоны и СКУД", "Пожарная безопасность"] },
  { name: "Медицина на дому", icon: "Stethoscope", subcategories: ["Медсестра на дом", "Капельница", "Забор анализов", "Массаж лечебный", "Психолог онлайн", "Логопед"] },
  { name: "Переводчик", icon: "Languages", subcategories: ["Устный перевод", "Письменный перевод", "Нотариальный перевод", "Синхронный перевод", "Перевод документов", "Апостиль"] },
  { name: "Хендмейд", icon: "Scissors", subcategories: ["Пошив одежды", "Ювелирные украшения", "Роспись и гравировка", "Вязание и шитьё", "Декупаж", "Подарки на заказ"] },
  { name: "Прочее", icon: "MoreHorizontal", subcategories: [] },
];

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const decoded = decodeURIComponent(name || "");
  const cat = categories.find(c => c.name === decoded);
  const hasSubcategories = (cat?.subcategories?.length ?? 0) > 0;

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

          {/* Подкатегории */}
          {hasSubcategories ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
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
              <a
                href={`/orders?category=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
              >
                <Icon name="LayoutList" size={16} />
                Все заявки в категории «{cat.name}»
              </a>
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
    </div>
  );
}