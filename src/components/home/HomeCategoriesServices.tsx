import Icon from "@/components/ui/icon";

const categories = [
  { name: "Авторемонт", icon: "Car", count: 312 },
  { name: "Ремонт жилья", icon: "Hammer", count: 278 },
  { name: "Строительство", icon: "HardHat", count: 194 },
  { name: "Бьюти", icon: "Sparkles", count: 221 },
  { name: "Массаж", icon: "HandHeart", count: 78 },
  { name: "IT-помощь", icon: "Monitor", count: 143 },
  { name: "Сантехника", icon: "Wrench", count: 167 },
  { name: "Электрика", icon: "Zap", count: 189 },
  { name: "Клининг", icon: "Sparkle", count: 156 },
  { name: "Перевозки", icon: "Truck", count: 134 },
  { name: "Няня", icon: "Baby", count: 98 },
  { name: "Репетиторство", icon: "GraduationCap", count: 103 },
  { name: "Озеленение", icon: "Leaf", count: 74 },
  { name: "Зоопомощь", icon: "PawPrint", count: 61 },
  { name: "Мебель", icon: "Package", count: 112 },
  { name: "Дизайн интерьера", icon: "PenRuler", count: 55 },
  { name: "Фото/Видео", icon: "Camera", count: 89 },
  { name: "Уборка снега", icon: "Snowflake", count: 43 },
  { name: "Повар на мероприятие", icon: "ChefHat", count: 49 },
  { name: "Тренер", icon: "Dumbbell", count: 67 },
  { name: "Аниматор", icon: "PartyPopper", count: 38 },
  { name: "Юрист", icon: "Scale", count: 52 },
  { name: "Бухгалтер", icon: "Calculator", count: 44 },
  { name: "Свадьба и торжества", icon: "Heart", count: 61 },
  { name: "Курьер и доставка", icon: "PackageCheck", count: 48 },
  { name: "Охрана и безопасность", icon: "ShieldCheck", count: 34 },
  { name: "Медицина на дому", icon: "Stethoscope", count: 29 },
  { name: "Переводчик", icon: "Languages", count: 22 },
  { name: "Хендмейд", icon: "Scissors", count: 31 },
  { name: "Прочее", icon: "MoreHorizontal", count: 87 },
];

const HomeCategoriesServices = () => {
  return (
    <>
      {/* Категории */}
      <section id="categories" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Категории услуг</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <a
              href="/orders"
              className="flex flex-col items-center justify-center gap-2 p-4 min-h-[90px] rounded-xl border transition-all bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white active:bg-white/10"
            >
              <Icon name="LayoutGrid" size={22} />
              <span className="text-xs font-medium text-center">Все</span>
            </a>
            {categories.map((cat) => (
              <a
                key={cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center justify-center gap-2 p-4 min-h-[90px] rounded-xl border transition-all bg-white/3 border-white/8 text-gray-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-600/10 active:bg-violet-600/20"
              >
                <Icon name={cat.icon} size={22} />
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                <span className="text-[10px] text-gray-600">{cat.count}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeCategoriesServices;
