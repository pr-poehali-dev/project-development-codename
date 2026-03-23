import { useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

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
  { name: "Прочее", icon: "MoreHorizontal", subcategories: [] },
];

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const decoded = decodeURIComponent(name || "");
  const cat = categories.find(c => c.name === decoded);

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
              <p className="text-gray-400 mt-1 text-sm">Выбери подкатегорию или смотри все заявки</p>
            </div>
          </div>

          {/* Подкатегории */}
          {cat.subcategories.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 mb-10">Подкатегорий нет — смотри все заявки ниже.</p>
          )}

          {/* Кнопка — все заявки в категории */}
          <a
            href={`/orders?category=${encodeURIComponent(cat.name)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
          >
            <Icon name="LayoutList" size={16} />
            Все заявки в категории «{cat.name}»
          </a>
        </div>
      </section>
    </div>
  );
}
