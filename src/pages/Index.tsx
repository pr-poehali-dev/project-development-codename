import { useState, useEffect } from "react";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeHeroStats from "@/components/home/HomeHeroStats";
import HomeCategoriesServices from "@/components/home/HomeCategoriesServices";
import HomeModals from "@/components/home/HomeModals";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
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

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";
const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

const Index = () => {
  useSeoMeta(
    "HandyMan — маркетплейс бытовых услуг",
    "Найдите мастера для ремонта, сантехники, электрики, клининга и других бытовых услуг. Быстро, удобно, надёжно."
  );
  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedCity, setSelectedCityFilter] = useState("");
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [masterForm, setMasterForm] = useState({ name: "", phone: "", email: "", category: "", categories: [] as string[], city: "", about: "", status: "Самозанятый / ИП / Компания" });
  const [masterSent, setMasterSent] = useState(false);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState("");

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ title: "", description: "", category: "", city: "", budget: "", contact_name: "", contact_phone: "", contact_email: "" });
  const [orderSent, setOrderSent] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const loadServices = async (category: string, city: string) => {
    setServicesLoading(true);
    try {
      const params = new URLSearchParams({ action: "services" });
      if (category && category !== "Все") params.set("category", category);
      if (city) params.set("city", city);
      const res = await fetch(`${MASTER_URL}?${params}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setServices(parsed.services || []);
      setAvailableCities(parsed.cities || []);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => { loadServices(activeCategory, selectedCity); }, [activeCategory, selectedCity]);

  useEffect(() => {
    const phone = localStorage.getItem("customer_phone");
    if (!phone) return;
    fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.customer) {
          setOrderForm(f => ({
            ...f,
            contact_name: parsed.customer.name || "",
            contact_phone: parsed.customer.phone || "",
            contact_email: parsed.customer.email || "",
          }));
        }
      });
  }, []);

  const [isMaster] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("master_phone"));
  const [isCustomer] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("customer_phone"));
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [masterBannerDismissed, setMasterBannerDismissed] = useState(
    typeof window !== "undefined" && localStorage.getItem("master_banner_dismissed") === "1"
  );

  // PWA install
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as BeforeInstallPromptEvent).prompt();
    const { outcome } = await (installPrompt as BeforeInstallPromptEvent).userChoice;
    if (outcome === "accepted") { setInstallPrompt(null); setIsInstalled(true); }
  };

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterLoading(true);
    setMasterError("");
    try {
      const res = await fetch(MASTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: masterForm.name,
          phone: masterForm.phone,
          email: masterForm.email,
          category: masterForm.categories[0] || masterForm.category,
          categories: masterForm.categories,
          city: masterForm.city,
          about: masterForm.about,
        }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.master) {
        if (parsed.master.phone) localStorage.setItem("master_phone", parsed.master.phone);
        setMasterSent(true);
      } else {
        setMasterError(parsed.error || "Ошибка регистрации");
      }
    } catch {
      setMasterError("Не удалось подключиться. Попробуйте позже.");
    } finally {
      setMasterLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <HomeNavbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        installPrompt={installPrompt}
        isInstalled={isInstalled}
        handleInstall={handleInstall}
        isMaster={isMaster}
        isCustomer={isCustomer}
        masterBannerDismissed={masterBannerDismissed}
        setMasterBannerDismissed={setMasterBannerDismissed}
        setRegisterModalOpen={setRegisterModalOpen}
        setMasterModalOpen={setMasterModalOpen}
        setLoginModalOpen={setLoginModalOpen}
      />

      {/* CTA — стать мастером */}
      <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border-b border-violet-500/15 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-300">
            <span className="text-white font-semibold">Готов предложить свои услуги?</span>
            {" "}Размести объявление бесплатно и получай заказы уже сегодня
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => setMasterModalOpen(true)} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 rounded-lg">
              Стать мастером
              <Icon name="ArrowRight" size={14} className="ml-1.5" />
            </Button>
            <Button onClick={() => setOrderModalOpen(true)} size="sm" variant="ghost" className="border border-violet-500/40 text-violet-300 hover:bg-violet-600/15 text-xs px-4 rounded-lg">
              Найти мастера
            </Button>
          </div>
        </div>
      </div>

      <HomeHeroStats onSearch={setHeroSearchQuery} />

      <HomeCategoriesServices
        activeCategory={activeCategory}
        selectedCity={selectedCity}
        setSelectedCityFilter={setSelectedCityFilter}
        services={services}
        availableCities={availableCities}
        servicesLoading={servicesLoading}
        setOrderForm={setOrderForm}
        setOrderModalOpen={setOrderModalOpen}
        isMaster={isMaster}
        heroSearchQuery={heroSearchQuery}
      />

      {/* Блок пакетов */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Простая и честная система токенов</h2>
          <p className="text-gray-400 text-center mb-10">Отклики бесплатны — токены списываются только когда заказчик выбирает вас исполнителем (−5 токенов). Чем больше пакет — тем дешевле токен.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { name: "Старт", count: 5, price: 99, per: 20, color: "violet" },
              { name: "Стандарт", count: 15, price: 249, per: 17, color: "indigo" },
              { name: "Профи", count: 30, price: 399, per: 13, color: "purple" },
            ].map((pkg) => (
              <div key={pkg.name} className={`bg-${pkg.color}-600/10 border border-${pkg.color}-500/20 rounded-2xl p-6 flex flex-col gap-3`}>
                <p className="text-white font-semibold text-lg">{pkg.name}</p>
                <p className="text-4xl font-extrabold text-white">{pkg.price} <span className="text-lg font-normal text-gray-400">₽</span></p>
                <p className="text-gray-400 text-sm">{pkg.count} токенов · {pkg.per} ₽/шт</p>
                <ul className="space-y-1.5 mt-1">
                  {["Без срока действия", "Мгновенное зачисление", "Отклики бесплатные"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Icon name="Check" size={13} className={`text-${pkg.color}-400 flex-shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm">
            Также доступна поштучная покупка токенов по 29 ₽ — в{" "}
            <a href="/master" className="text-violet-400 hover:text-violet-300 transition-colors">кабинете мастера</a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
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
            <Button onClick={() => setOrderModalOpen(true)} variant="ghost" className="border border-violet-500 text-violet-300 hover:text-violet-200 hover:bg-violet-600/15 px-8 py-3 text-base rounded-xl">
              Найти мастера
            </Button>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/8 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-7 h-7 rounded-lg object-cover" />
                <span className="font-bold text-white">HandyMan</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Маркетплейс бытовых услуг. Находите мастеров быстро и удобно.</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-3">Контакты</p>
              <div className="space-y-2">
                <a href="tel:+79966869812" className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm transition-colors">
                  <Icon name="Phone" size={13} />
                  +7 (996) 686-98-12
                </a>
                <a href="mailto:handymanbusiness@yandex.ru" className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm transition-colors">
                  <Icon name="Mail" size={13} />
                  handymanbusiness@yandex.ru
                </a>
                <p className="flex items-start gap-2 text-gray-600 text-sm">
                  <Icon name="MapPin" size={13} className="mt-0.5 flex-shrink-0" />
                  ХМАО-Югра, пгт. Белый Яр
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-3">Кабинеты</p>
              <div className="space-y-2">
                {isCustomer && (
                  <a href="/cabinet" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Кабинет заказчика</a>
                )}
                <a href="/master" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Кабинет мастера</a>
                <a href="/orders" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Лента заявок</a>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-3 mt-5">Документы</p>
              <div className="space-y-2">
                <a href="/rules" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Правила платформы</a>
                <a href="/offer" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Публичная оферта</a>
                <a href="/offer#7" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Политика конфиденциальности</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/6 pt-6">
            <p className="text-gray-700 text-xs text-center">© 2026 HandyMan. Харисов Эрнест Иреко­вич, ИНН 860234992431. Самозанятый (плательщик НПД).</p>
          </div>
        </div>
      </footer>

      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Наверх"
        >
          <Icon name="ArrowUp" size={20} />
        </button>
      )}

      <HomeModals
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        registerModalOpen={registerModalOpen}
        setRegisterModalOpen={setRegisterModalOpen}
        masterModalOpen={masterModalOpen}
        setMasterModalOpen={setMasterModalOpen}
        masterForm={masterForm}
        setMasterForm={setMasterForm}
        masterSent={masterSent}
        setMasterSent={setMasterSent}
        masterLoading={masterLoading}
        masterError={masterError}
        handleMasterSubmit={handleMasterSubmit}
        orderModalOpen={orderModalOpen}
        setOrderModalOpen={setOrderModalOpen}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        orderSent={orderSent}
        setOrderSent={setOrderSent}
        orderLoading={orderLoading}
        orderError={orderError}
        setOrderError={setOrderError}
        handleOrderSubmit={handleOrderSubmit}
      />
    </div>
  );
};

export default Index;