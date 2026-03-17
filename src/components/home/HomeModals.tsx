import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";

const categories = [
  { name: "Авторемонт", subcategories: ["Кузовной ремонт", "Автоэлектрика", "Шиномонтаж", "Детейлинг", "Диагностика", "Техническое обслуживание"] },
  { name: "Ремонт жилья", subcategories: ["Отделка и штукатурка", "Укладка плитки", "Укладка полов", "Покраска стен", "Натяжные потолки", "Демонтаж"] },
  { name: "Строительство", subcategories: ["Фундамент", "Кровля", "Забор и ворота", "Баня и беседка", "Кирпичная кладка", "Каркасный дом"] },
  { name: "Бьюти", subcategories: ["Маникюр и педикюр", "Стрижка и окрашивание", "Брови и ресницы", "Макияж", "Эпиляция", "Наращивание волос"] },
  { name: "Массаж", subcategories: ["Классический массаж", "Спортивный массаж", "Детский массаж", "Антицеллюлитный", "Лимфодренаж", "Массаж лица"] },
  { name: "IT-помощь", subcategories: ["Ремонт компьютеров", "Настройка ПО", "Разработка сайтов", "1С и бухгалтерия", "Настройка сетей", "Восстановление данных"] },
  { name: "Сантехника", subcategories: ["Установка сантехники", "Устранение засоров", "Монтаж труб", "Водонагреватели", "Канализация", "Тёплый пол"] },
  { name: "Электрика", subcategories: ["Монтаж проводки", "Установка розеток", "Электрощиты", "Подключение техники", "Освещение", "Аварийный вызов"] },
  { name: "Клининг", subcategories: ["Уборка квартиры", "Уборка офиса", "После ремонта", "Мойка окон", "Химчистка мебели", "Генеральная уборка"] },
  { name: "Перевозки", subcategories: ["Квартирный переезд", "Офисный переезд", "Грузовое такси", "Доставка мебели", "Эвакуатор", "Межгород"] },
  { name: "Няня", subcategories: ["Няня на день", "Ночная няня", "Няня-гувернантка", "Присмотр за пожилыми", "Помощь по хозяйству", "Сиделка"] },
  { name: "Репетиторство", subcategories: ["Математика", "Английский язык", "Подготовка к ЕГЭ/ОГЭ", "Другие языки", "Физика и химия", "Подготовка к школе"] },
  { name: "Озеленение", subcategories: ["Ландшафтный дизайн", "Посадка растений", "Стрижка газона", "Уборка листьев", "Полив и уход", "Вырубка деревьев"] },
  { name: "Зоопомощь", subcategories: ["Выгул собак", "Стрижка животных", "Ветеринар на дом", "Передержка", "Дрессировка", "Зоотакси"] },
  { name: "Сборка мебели", subcategories: ["Сборка из ИКЕА", "Корпусная мебель", "Кухни", "Шкафы-купе", "Детская мебель", "Разборка и перестановка"] },
  { name: "Дизайн интерьера", subcategories: ["Дизайн-проект", "3D-визуализация", "Авторский надзор", "Подбор материалов", "Декорирование", "Планировка"] },
  { name: "Фото/Видео", subcategories: ["Свадебная съёмка", "Семейная фотосессия", "Коммерческая съёмка", "Видеомонтаж", "Аэросъёмка", "Репортаж"] },
  { name: "Уборка снега", subcategories: ["Уборка кровли", "Чистка двора", "Посыпка песком", "Вывоз снега", "Расчистка дорожек", "Коммерческие объекты"] },
  { name: "Повар на мероприятие", subcategories: ["Банкет", "День рождения", "Корпоратив", "Барбекю", "Суши-мастер", "Детский праздник"] },
  { name: "Тренер", subcategories: ["Персональный тренинг", "Йога", "Пилатес", "Бокс и единоборства", "Плавание", "Онлайн-тренировки"] },
  { name: "Аниматор", subcategories: ["Детский праздник", "Аниматор в костюме", "Фокусник", "Клоун", "Ведущий праздника", "Корпоратив"] },
  { name: "Юрист", subcategories: ["Консультация", "Составление договоров", "Семейное право", "Недвижимость", "Трудовые споры", "Представительство в суде"] },
  { name: "Бухгалтер", subcategories: ["Бухгалтерский учёт", "Налоговая отчётность", "УСН и ИП", "Расчёт зарплат", "1С-сопровождение", "Аудит"] },
  { name: "Прочее", subcategories: [] },
];

interface MasterForm {
  name: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  about: string;
  status: string;
}

interface OrderForm {
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

interface HomeModalsProps {
  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;

  // Register modal
  registerModalOpen: boolean;
  setRegisterModalOpen: (v: boolean) => void;

  // Master modal
  masterModalOpen: boolean;
  setMasterModalOpen: (v: boolean) => void;
  masterForm: MasterForm;
  setMasterForm: (form: MasterForm) => void;
  masterSent: boolean;
  setMasterSent: (v: boolean) => void;
  masterLoading: boolean;
  masterError: string;
  handleMasterSubmit: (e: React.FormEvent) => void;

  // Order modal
  orderModalOpen: boolean;
  setOrderModalOpen: (v: boolean) => void;
  orderForm: OrderForm;
  setOrderForm: (form: OrderForm) => void;
  orderSent: boolean;
  setOrderSent: (v: boolean) => void;
  orderLoading: boolean;
  orderError: string;
  setOrderError: (v: string) => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
}

const HomeModals = ({
  loginModalOpen,
  setLoginModalOpen,
  registerModalOpen,
  setRegisterModalOpen,
  masterModalOpen,
  setMasterModalOpen,
  masterForm,
  setMasterForm,
  masterSent,
  setMasterSent,
  masterLoading,
  masterError,
  handleMasterSubmit,
  orderModalOpen,
  setOrderModalOpen,
  orderForm,
  setOrderForm,
  orderSent,
  setOrderSent,
  orderLoading,
  orderError,
  setOrderError,
  handleOrderSubmit,
}: HomeModalsProps) => {
  const [selectedMainCat, setSelectedMainCat] = React.useState("");

  React.useEffect(() => {
    if (orderModalOpen && orderForm.category) {
      const isMain = categories.some(c => c.name === orderForm.category);
      if (isMain) {
        setSelectedMainCat(orderForm.category);
      } else {
        const parent = categories.find(c => c.subcategories.includes(orderForm.category));
        if (parent) setSelectedMainCat(parent.name);
      }
    }
    if (!orderModalOpen) setSelectedMainCat("");
  }, [orderModalOpen]);

  const mainCatObj = categories.find(c => c.name === selectedMainCat);
  const subcategories = mainCatObj?.subcategories ?? [];

  const handleMainCatChange = (name: string) => {
    setSelectedMainCat(name);
    setOrderForm({ ...orderForm, category: name });
  };

  const handleSubcatSelect = (sub: string) => {
    setOrderForm({ ...orderForm, category: sub });
  };

  return (
    <>
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
              <p className="text-gray-300 mb-2">Добро пожаловать, <span className="text-white font-semibold">{masterForm.name}</span>!</p>
              <p className="text-gray-500 text-sm mb-1">Аккаунт создан. Откликайтесь на заявки бесплатно — токены нужны только когда заказчик выбирает вас исполнителем.</p>
              <p className="text-gray-600 text-xs mb-6">Для входа используйте email <span className="text-violet-400">{masterForm.email}</span></p>
              <div className="flex flex-col gap-3">
                <a href="/master" onClick={() => { setMasterModalOpen(false); setMasterSent(false); }}>
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Перейти в кабинет мастера
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </a>
                <a href="/orders" onClick={() => { setMasterModalOpen(false); setMasterSent(false); }}>
                  <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                    Смотреть заявки
                  </Button>
                </a>
              </div>
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
                <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона (для связи с клиентами)</label>
                <input
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="+7 (999) 000-00-00"
                  value={masterForm.phone}
                  onChange={(e) => setMasterForm({ ...masterForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="you@example.com"
                  value={masterForm.email}
                  onChange={(e) => setMasterForm({ ...masterForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                <CitySelect
                  value={masterForm.city || ""}
                  onChange={(c) => setMasterForm({ ...masterForm, city: c })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Категория услуг *</label>
                <select
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  style={{ colorScheme: "dark" }}
                  value={masterForm.category}
                  onChange={(e) => setMasterForm({ ...masterForm, category: e.target.value })}
                >
                  <option value="" disabled style={{ background: "#0f1117", color: "#9ca3af" }}>Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name} style={{ background: "#0f1117", color: "#fff" }}>{c.name}</option>
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
              {masterError && <p className="text-red-400 text-sm">{masterError}</p>}
              <Button
                type="submit"
                disabled={masterLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {masterLoading ? "Регистрация..." : "Зарегистрироваться"}
                {!masterLoading && <Icon name="ArrowRight" size={16} className="ml-2" />}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно создания заявки */}
      <Dialog open={orderModalOpen} onOpenChange={(v) => { setOrderModalOpen(v); if (!v) { setOrderSent(false); setOrderError(""); setSelectedMainCat(""); } }}>
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
                    style={{ colorScheme: "dark" }}
                    value={selectedMainCat}
                    onChange={(e) => handleMainCatChange(e.target.value)}
                  >
                    <option value="" disabled style={{ background: "#0f1117", color: "#9ca3af" }}>Выберите</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name} style={{ background: "#0f1117", color: "#fff" }}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                  <CitySelect
                    value={orderForm.city}
                    onChange={(c) => setOrderForm({ ...orderForm, city: c })}
                    required
                  />
                </div>
              </div>

              {/* Подкатегории */}
              {subcategories.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Уточните подкатегорию
                    {orderForm.category && orderForm.category !== selectedMainCat && (
                      <span className="ml-2 text-violet-400 font-medium">— {orderForm.category}</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSubcatSelect(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                          orderForm.category === sub
                            ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-gray-200"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Модалка входа */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="bg-[#0f1117] border border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Войти</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm text-center -mt-2">Выберите роль для входа</p>
          <div className="flex flex-col gap-3 mt-2">
            <a href="/master" onClick={() => setLoginModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="Wrench" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я исполнитель</p>
                  <p className="text-gray-400 text-xs mt-0.5">Вход в кабинет мастера</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-violet-400 ml-auto transition-colors" />
              </div>
            </a>
            <a href="/cabinet" onClick={() => setLoginModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardList" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я заказчик</p>
                  <p className="text-gray-400 text-xs mt-0.5">Вход в кабинет заказчика</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-indigo-400 ml-auto transition-colors" />
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка выбора роли при регистрации */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="bg-[#0f1117] border border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Кто вы?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm text-center -mt-2">Выберите роль для регистрации</p>
          <div className="flex flex-col gap-3 mt-2">
            <a href="/master" onClick={() => setRegisterModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="Wrench" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я мастер</p>
                  <p className="text-gray-400 text-xs mt-0.5">Принимаю заказы и зарабатываю</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-violet-400 ml-auto transition-colors" />
              </div>
            </a>
            <button onClick={() => { setRegisterModalOpen(false); setOrderModalOpen(true); }}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardList" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я заказчик</p>
                  <p className="text-gray-400 text-xs mt-0.5">Размещаю заявку и нахожу специалиста</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-indigo-400 ml-auto transition-colors" />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeModals;