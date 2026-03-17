import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const stats = [
  { label: "Исполнителей", value: "1 200+", icon: "Users" },
  { label: "Выполнено заказов", value: "8 400+", icon: "CheckCircle" },
  { label: "Средняя оценка", value: "4.8 ★", icon: "Star" },
  { label: "Категорий услуг", value: "20+", icon: "Grid3x3" },
];

const HomeHeroStats = () => {
  return (
    <>
      {/* Герой */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="mb-6 bg-violet-600/20 text-violet-300 border-violet-500/30 px-4 py-1.5 text-sm">
            🔧 Маркетплейс бытовых услуг
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Найди лучшего
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> мастера</span>
            <br />для любой задачи
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Более 1 200 проверенных специалистов: мастера по ремонту, сантехники, электрики, бьюти-мастера, грузчики и многое другое.
            Комиссия от 5% — только для самозанятых.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Например: сантехник, ремонт авто, маникюр..."
              />
            </div>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Найти
            </Button>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-10 px-4 border-y border-white/5 bg-white/2">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center">
                  <Icon name={stat.icon} size={18} className="text-violet-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeHeroStats;
