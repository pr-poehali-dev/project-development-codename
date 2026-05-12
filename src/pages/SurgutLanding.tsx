import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeoMeta } from "@/hooks/useSeoMeta";

const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Service {
  id: number;
  title: string;
  category: string;
  city: string;
  price: number | null;
  master_id: number;
  master_name: string;
  avatar_color: string;
  rating: number | null;
  reviews_count: number;
}

const CITIES = [
  { name: "Сургут", count: "крупнейший город округа" },
  { name: "Нижневартовск", count: "второй по величине" },
  { name: "Нефтеюганск", count: "нефтяная столица региона" },
  { name: "Когалым", count: "город компании ЛУКОЙЛ" },
  { name: "Ханты-Мансийск", count: "столица округа" },
  { name: "Нягань", count: "запад ХМАО" },
  { name: "Мегион", count: "рядом с Нижневартовском" },
  { name: "Радужный", count: "север региона" },
  { name: "Пыть-Ях", count: "юг ХМАО" },
  { name: "Лангепас", count: "малый нефтяной город" },
  { name: "Урай", count: "историческая нефтянка" },
  { name: "Югорск", count: "газовая столица" },
];

const CATEGORIES = [
  { name: "Сантехника", icon: "Wrench", text: "Установка, замена, ремонт труб и сантехники" },
  { name: "Электрика", icon: "Zap", text: "Проводка, розетки, светильники, щитки" },
  { name: "Ремонт жилья", icon: "Hammer", text: "Косметический и капитальный ремонт квартир" },
  { name: "Клининг", icon: "Sparkles", text: "Уборка квартир, офисов, после ремонта" },
  { name: "Бьюти", icon: "Scissors", text: "Маникюр, парикмахер, косметология на дому" },
  { name: "Массаж", icon: "Heart", text: "Лечебный, классический, спортивный массаж" },
  { name: "Автосервис", icon: "Car", text: "Ремонт авто, шиномонтаж, диагностика" },
  { name: "IT-помощь", icon: "Laptop", text: "Настройка компьютеров, интернета, ПО" },
  { name: "Перевозки", icon: "Truck", text: "Грузчики, переезды, доставка крупногабарита" },
  { name: "Уборка снега", icon: "Snowflake", text: "Актуально в северной зиме ХМАО" },
  { name: "Репетиторство", icon: "BookOpen", text: "Школьные предметы, языки, ЕГЭ" },
  { name: "Мебель", icon: "Sofa", text: "Сборка, ремонт, перетяжка мебели" },
];

export default function SurgutLanding() {
  useSeoMeta(
    "Мастера в Сургуте и ХМАО — заказать бытовые услуги | HandyMan",
    "Найдите проверенного мастера в Сургуте, Нижневартовске, Нефтеюганске, Когалыме, Ханты-Мансийске и других городах ХМАО — Югры. Сантехники, электрики, бьюти-мастера, клининг, ремонт. Реальные отзывы, прозрачные цены."
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ action: "services", city: "Сургут" });
    fetch(`${MASTER_URL}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setServices(parsed.services || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="border-b border-white/8 bg-[#0a0d16]/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs flex-wrap">
          <a href="/" className="text-gray-500 hover:text-white transition-colors">Главная</a>
          <Icon name="ChevronRight" size={12} className="text-gray-700" />
          <span className="text-violet-300">Сургут и ХМАО</span>
        </div>
      </div>

      <section className="py-12 sm:py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <Badge className="mb-4 bg-violet-600/20 text-violet-300 border-violet-500/30 px-3 py-1 text-xs">
            <Icon name="MapPin" size={12} className="mr-1.5" />
            ХМАО — Югра
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Мастера в <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Сургуте</span> и по всему ХМАО
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-6">
            HandyMan — локальный маркетплейс бытовых услуг для жителей Ханты-Мансийского автономного округа.
            Найдите проверенного мастера в своём городе: сантехник, электрик, бьюти-мастер, клининг, репетитор,
            автосервис и десятки других услуг. Все мастера верифицированы, у каждого — реальные отзывы и прозрачные цены.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/masters?city=Сургут">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 rounded-xl">
                <Icon name="Search" size={15} className="mr-2" />
                Найти мастера в Сургуте
              </Button>
            </a>
            <a href="/orders">
              <Button variant="ghost" className="border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 px-6 rounded-xl">
                Разместить заявку
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "ShieldCheck", title: "Проверенные мастера", text: "Верификация и реальные отзывы" },
            { icon: "MapPin", title: "Только ХМАО — Югра", text: "Локальные специалисты округа" },
            { icon: "Wallet", title: "Без переплат", text: "Прозрачные цены без посредников" },
            { icon: "Zap", title: "Быстрый отклик", text: "Мастер свяжется за минуты" },
          ].map((b) => (
            <div key={b.title} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center mx-auto mb-2">
                <Icon name={b.icon} size={18} className="text-violet-400" />
              </div>
              <p className="text-white text-sm font-semibold">{b.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Города ХМАО — Югры на HandyMan</h2>
          <p className="text-gray-400 text-sm mb-6">Выберите свой город — покажем мастеров рядом с вами.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CITIES.map((c) => (
              <a
                key={c.name}
                href={`/masters?city=${encodeURIComponent(c.name)}`}
                className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="MapPin" size={14} className="text-violet-400" />
                  <span className="text-white font-semibold text-sm">{c.name}</span>
                </div>
                <p className="text-gray-500 text-xs">{c.count}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Популярные услуги в Сургуте и ХМАО</h2>
          <p className="text-gray-400 text-sm mb-6">Каждая категория — десятки проверенных мастеров.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.name}
                href={`/masters?category=${encodeURIComponent(cat.name)}&city=Сургут`}
                className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center shrink-0">
                  <Icon name={cat.icon} size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{cat.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{cat.text}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Мастера в Сургуте
            {!loading && services.length > 0 && (
              <span className="text-gray-500 font-normal text-base ml-2">{services.length}</span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-8 text-center">
              <Icon name="Briefcase" size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">Мы только запускаемся в Сургуте</p>
              <p className="text-gray-500 text-sm mb-5">
                Разместите заявку — мастера откликнутся быстро. Или станьте первым мастером в городе.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="/orders">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white">Разместить заявку</Button>
                </a>
                <a href="/">
                  <Button variant="ghost" className="border border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                    Стать мастером
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.slice(0, 12).map((s) => (
                <a
                  key={s.id}
                  href={`/master-page?id=${s.master_id}`}
                  className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all flex flex-col gap-2"
                >
                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{s.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon name="User" size={12} />
                    <span>{s.master_name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {s.price !== null && (
                      <span className="text-violet-300 font-semibold text-sm">от {s.price} ₽</span>
                    )}
                    {s.rating !== null && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Icon name="Star" size={12} />
                        {s.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 border-t border-white/5 bg-white/2">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Почему HandyMan — лучший выбор в ХМАО</h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>
              <strong className="text-white">Локальный фокус на округ.</strong> Мы не размываем базу мастеров по всей России,
              как федеральные сервисы. Все исполнители — из городов ХМАО — Югры. Это значит: мастер приедет к вам быстрее,
              а цена не накручена за «логистику из соседнего региона».
            </p>
            <p>
              <strong className="text-white">Северные реалии — учтены.</strong> Уборка снега зимой, прогрев машин, утепление окон,
              ремонт после морозов — категории, которые в Сургуте, Нижневартовске и Нягани востребованы куда сильнее, чем в средней полосе.
              Мы знаем специфику региона.
            </p>
            <p>
              <strong className="text-white">Прозрачная модель.</strong> Заказчики размещают заявки бесплатно. Мастера откликаются
              без комиссии — платят только за выбранный отклик, токенами. Никаких скрытых наценок и обязательных подписок.
            </p>
            <p>
              <strong className="text-white">Проверка мастеров.</strong> Каждый мастер проходит верификацию: паспорт, опыт работы,
              специализация. На странице каждого — реальные отзывы заказчиков из ХМАО.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Готовы начать?</h2>
          <p className="text-gray-400 mb-6">Найдите мастера или станьте исполнителем на HandyMan</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/masters?city=Сургут">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 rounded-xl">
                <Icon name="Search" size={15} className="mr-2" />
                Найти мастера
              </Button>
            </a>
            <a href="/">
              <Button variant="ghost" className="border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 px-6 rounded-xl">
                Стать мастером
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
