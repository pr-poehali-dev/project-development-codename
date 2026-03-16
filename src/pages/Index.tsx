import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

import CITIES from "@/data/cities";

const categories = [
  { name: "Авторемонт", icon: "Car", count: 312 },
  { name: "Ремонт жилья", icon: "Hammer", count: 278 },
  { name: "Строительство", icon: "HardHat", count: 194 },
  { name: "Бьюти", icon: "Sparkles", count: 221 },
  { name: "IT-помощь", icon: "Monitor", count: 143 },
  { name: "Сантехника", icon: "Wrench", count: 167 },
  { name: "Электрика", icon: "Zap", count: 189 },
  { name: "Перевозки", icon: "Truck", count: 134 },
  { name: "Няня", icon: "Baby", count: 98 },
  { name: "Клининг", icon: "Sparkle", count: 156 },
  { name: "Прочее", icon: "MoreHorizontal", count: 87 },
];

const services = [
  {
    id: 1,
    title: "Диагностика и ремонт двигателя любой марки",
    category: "Авторемонт",
    price: 3500,
    rating: 4.9,
    reviews: 112,
    name: "Алексей Морозов",
    status: "Самозанятый / ИП",
    commission: 5,
    avatar: "А",
    color: "#6366f1",
  },
  {
    id: 2,
    title: "Ремонт квартиры под ключ: черновая и чистовая",
    category: "Ремонт жилья",
    price: 45000,
    rating: 4.8,
    reviews: 67,
    name: "СтройМастер",
    status: "Без статуса",
    commission: 10,
    avatar: "С",
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Маникюр и педикюр с покрытием гель-лак",
    category: "Бьюти",
    price: 1800,
    rating: 4.9,
    reviews: 203,
    name: "Анна Белова",
    status: "Самозанятый / ИП",
    commission: 5,
    avatar: "А",
    color: "#ec4899",
  },
  {
    id: 4,
    title: "Устранение засоров, замена труб и сантехники",
    category: "Сантехника",
    price: 2000,
    rating: 4.7,
    reviews: 89,
    name: "Виктор Дроздов",
    status: "Самозанятый / ИП",
    commission: 5,
    avatar: "В",
    color: "#10b981",
  },
  {
    id: 5,
    title: "Настройка компьютера, Wi-Fi, умного дома",
    category: "IT-помощь",
    price: 1500,
    rating: 4.8,
    reviews: 54,
    name: "Кирилл Захаров",
    status: "Самозанятый / ИП",
    commission: 5,
    avatar: "К",
    color: "#8b5cf6",
  },
  {
    id: 6,
    title: "Грузоперевозки и переезды — от 1 часа",
    category: "Перевозки",
    price: 2500,
    rating: 4.7,
    reviews: 78,
    name: "ГрузЭкспресс",
    status: "Без статуса",
    commission: 10,
    avatar: "Г",
    color: "#ef4444",
  },
];

const stats = [
  { label: "Исполнителей", value: "1 200+", icon: "Users" },
  { label: "Выполнено заказов", value: "8 400+", icon: "CheckCircle" },
  { label: "Средняя оценка", value: "4.8 ★", icon: "Star" },
  { label: "Категорий услуг", value: "40+", icon: "Grid3x3" },
];

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [masterForm, setMasterForm] = useState({ name: "", phone: "", category: "", about: "", status: "Самозанятый / ИП / Компания" });
  const [masterSent, setMasterSent] = useState(false);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [orderForm, setOrderForm] = useState({ title: "", description: "", category: "", city: "", budget: "", contact_name: "", contact_phone: "", contact_email: "" });
  const [orderSent, setOrderSent] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterSent(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError("");
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderForm, budget: orderForm.budget ? parseInt(orderForm.budget) : null }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderSent(true);
      } else {
        setOrderError(data.error || "Ошибка при отправке");
      }
    } catch {
      setOrderError("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setOrderLoading(false);
    }
  };

  const filtered =
    activeCategory === "Все"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              HandyMan
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Категории</a>
            <a href="/orders" className="text-gray-400 hover:text-white text-sm transition-colors">Лента заявок</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Тарифы</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Icon name="MapPin" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select
                className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer hover:border-white/20"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Все города</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <a href="/cabinet">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2">
                <Icon name="LayoutDashboard" size={15} />
                Мои заявки
              </Button>
            </a>
            <Button onClick={() => setMasterModalOpen(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm px-5">
              Я мастер
            </Button>
          </div>

          <Button
            variant="ghost"
            className="md:hidden text-gray-400 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#" className="block text-gray-400 hover:text-white text-sm">Категории</a>
            <a href="#" className="block text-gray-400 hover:text-white text-sm">Как работает</a>
            <Button onClick={() => setMasterModalOpen(true)} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm mt-2">
              Я мастер
            </Button>
          </div>
        )}
      </nav>

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

      {/* Категории */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Категории услуг</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <button
              onClick={() => setActiveCategory("Все")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                activeCategory === "Все"
                  ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                  : "bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <Icon name="LayoutGrid" size={22} />
              <span className="text-xs font-medium">Все</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  activeCategory === cat.name
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon name={cat.icon} size={22} />
                <span className="text-xs font-medium">{cat.name}</span>
                <span className="text-[10px] text-gray-600">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Карточки услуг */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {activeCategory === "Все" ? "Все услуги" : activeCategory}
              <span className="text-gray-600 text-lg font-normal ml-3">{filtered.length}</span>
            </h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm gap-2">
              <Icon name="SlidersHorizontal" size={16} />
              Фильтры
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-white/6 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.15)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    {service.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <Icon name="Star" size={13} />
                    <span>{service.rating}</span>
                    <span className="text-gray-600 text-xs">({service.reviews})</span>
                  </div>
                </div>

                <h3 className="text-white font-semibold text-base mb-4 leading-snug group-hover:text-violet-200 transition-colors">
                  {service.title}
                </h3>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: service.color }}
                  >
                    {service.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-300 font-medium truncate">{service.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          service.status === "Самозанятый / ИП"
                            ? "bg-emerald-600/15 text-emerald-400"
                            : "bg-orange-600/15 text-orange-400"
                        }`}
                      >
                        {service.status}
                      </span>
                      <span className="text-[11px] text-gray-600">
                        комиссия {service.commission}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/6">
                  <div>
                    <span className="text-gray-500 text-xs">от</span>
                    <span className="text-white font-bold text-lg ml-1">
                      {service.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 hover:border-violet-500 rounded-lg text-xs transition-all"
                  >
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="border-white/15 text-gray-300 hover:text-white hover:bg-white/8 px-8"
            >
              Показать ещё услуги
              <Icon name="ArrowDown" size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Блок комиссии */}
      <section className="py-16 px-4 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Прозрачная комиссионная система</h2>
          <p className="text-gray-400 text-center mb-10">Честные условия для всех участников платформы</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                <Icon name="UserCheck" size={22} className="text-emerald-400" />
              </div>
              <div className="text-4xl font-extrabold text-emerald-400 mb-2">5%</div>
              <div className="text-white font-semibold text-lg mb-2">Самозанятые, ИП и компании</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Минимальная комиссия для всех, кто имеет официальный статус:
                самозанятый, ИП или юридическое лицо.
              </p>
              <ul className="mt-4 space-y-2">
                {["Самозанятые физлица", "Индивидуальные предприниматели", "ООО и другие юрлица"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <Icon name="Check" size={14} className="text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-500/8 border border-orange-500/20 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-4">
                <Icon name="User" size={22} className="text-orange-400" />
              </div>
              <div className="text-4xl font-extrabold text-orange-400 mb-2">10%</div>
              <div className="text-white font-semibold text-lg mb-2">Без официального статуса</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Стандартная комиссия для физических лиц без статуса
                самозанятого или ИП.
              </p>
              <ul className="mt-4 space-y-2">
                {["Быстрый старт без оформления", "Полный доступ к заказам", "Вывод средств без ограничений"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <Icon name="Check" size={14} className="text-orange-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Готов предложить свои услуги?
          </h2>
          <p className="text-gray-400 mb-8">
            Размести свои услуги бесплатно и получай заказы от клиентов уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setMasterModalOpen(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 text-base rounded-xl">
              Стать мастером
              <Icon name="ArrowRight" size={18} className="ml-2" />
            </Button>
            <Button onClick={() => setOrderModalOpen(true)} variant="outline" className="border-white/15 text-gray-300 hover:text-white hover:bg-white/8 px-8 py-3 text-base rounded-xl">
              Найти мастера
            </Button>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/8 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">HandyMan</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 HandyMan. Все права защищены.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm">Условия</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm">Конфиденциальность</a>
          </div>
        </div>
      </footer>

      {/* Модальное окно регистрации мастера */}
      <Dialog open={masterModalOpen} onOpenChange={(v) => { setMasterModalOpen(v); if (!v) setMasterSent(false); }}>
        <DialogContent className="bg-[#1a1d27] border border-white/10 text-white max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {masterSent ? "Заявка отправлена!" : "Регистрация мастера"}
            </DialogTitle>
          </DialogHeader>

          {masterSent ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-emerald-400" />
              </div>
              <p className="text-gray-300 mb-2">Мы получили вашу заявку, <span className="text-white font-semibold">{masterForm.name}</span>!</p>
              <p className="text-gray-500 text-sm">Свяжемся с вами по номеру <span className="text-gray-300">{masterForm.phone}</span> в течение 24 часов.</p>
              <Button
                className="mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                onClick={() => { setMasterModalOpen(false); setMasterSent(false); }}
              >
                Закрыть
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMasterSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя *</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Иван Иванов"
                  value={masterForm.name}
                  onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона *</label>
                <input
                  required
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="+7 (999) 000-00-00"
                  value={masterForm.phone}
                  onChange={(e) => setMasterForm({ ...masterForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                <select
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  value={masterForm.city || ""}
                  onChange={(e) => setMasterForm({ ...masterForm, city: e.target.value })}
                >
                  <option value="" disabled>Выберите город</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Категория услуг *</label>
                <select
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  value={masterForm.category}
                  onChange={(e) => setMasterForm({ ...masterForm, category: e.target.value })}
                >
                  <option value="" disabled>Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Статус</label>
                <div className="flex gap-3">
                  {["Самозанятый / ИП / Компания", "Без статуса"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMasterForm({ ...masterForm, status: s })}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                        masterForm.status === s
                          ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                          : "bg-white/4 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5">
                  {masterForm.status === "Самозанятый / ИП / Компания" ? "Комиссия платформы — 5%" : "Комиссия платформы — 10%"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">О себе</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="Опыт работы, специализация, достижения..."
                  value={masterForm.about}
                  onChange={(e) => setMasterForm({ ...masterForm, about: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium"
              >
                Отправить заявку
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно создания заявки */}
      <Dialog open={orderModalOpen} onOpenChange={(v) => { setOrderModalOpen(v); if (!v) { setOrderSent(false); setOrderError(""); } }}>
        <DialogContent className="bg-[#1a1d27] border border-white/10 text-white max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {orderSent ? "Заявка опубликована!" : "Создать заявку"}
            </DialogTitle>
          </DialogHeader>

          {orderSent ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-emerald-400" />
              </div>
              <p className="text-gray-300 mb-2">Заявка опубликована, <span className="text-white font-semibold">{orderForm.contact_name}</span>!</p>
              <p className="text-gray-500 text-sm">Мастера увидят вашу заявку и начнут откликаться. Мы сообщим вам об откликах.</p>
              <Button
                className="mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                onClick={() => { setOrderModalOpen(false); setOrderSent(false); }}
              >
                Отлично!
              </Button>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Что нужно сделать? *</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Например: починить кран на кухне"
                  value={orderForm.title}
                  onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Категория *</label>
                  <select
                    required
                    className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    value={orderForm.category}
                    onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
                  >
                    <option value="" disabled>Выберите</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                  <select
                    required
                    className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                  >
                    <option value="" disabled>Выберите</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Подробное описание *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="Опишите задачу подробнее: объём работ, адрес, особые пожелания..."
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Бюджет, ₽</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Оставьте пустым, если не знаете"
                  value={orderForm.budget}
                  onChange={(e) => setOrderForm({ ...orderForm, budget: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя *</label>
                  <input
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Иван"
                    value={orderForm.contact_name}
                    onChange={(e) => setOrderForm({ ...orderForm, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Телефон *</label>
                  <input
                    required
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="+7 (999) 000-00-00"
                    value={orderForm.contact_phone}
                    onChange={(e) => setOrderForm({ ...orderForm, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="для уведомлений об откликах"
                  value={orderForm.contact_email}
                  onChange={(e) => setOrderForm({ ...orderForm, contact_email: e.target.value })}
                />
              </div>
              {orderError && (
                <p className="text-red-400 text-sm">{orderError}</p>
              )}
              <Button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {orderLoading ? "Публикуем..." : "Опубликовать заявку"}
                {!orderLoading && <Icon name="ArrowRight" size={16} className="ml-2" />}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;