import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import MasterLoginForm from "@/pages/master-cabinet/MasterLoginForm";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
const PACKAGES_URL = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: number;
  type: "purchase" | "spend";
  amount: number;
  description: string;
  created_at: string;
}

interface MyResponse {
  id: number;
  order_id: number;
  order_title: string;
  order_category: string;
  order_status: string;
  order_city: string;
  message: string;
  created_at: string;
}

interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

const CATEGORIES = [
  "Авторемонт","Ремонт жилья","Строительство","Бьюти","IT-помощь",
  "Сантехника","Электрика","Перевозки","Няня","Клининг","Прочее",
];

interface Package {
  id: number;
  name: string;
  responses_count: number;
  price: number;
}

const PACKAGE_COLORS = [
  "from-violet-600/20 to-violet-800/10 border-violet-500/30",
  "from-indigo-600/20 to-indigo-800/10 border-indigo-500/30",
  "from-purple-600/20 to-purple-800/10 border-purple-500/30",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default function MasterCabinet() {
  const [phone, setPhone] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [master, setMaster] = useState<Master | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myResponses, setMyResponses] = useState<MyResponse[]>([]);
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buySuccess, setBuySuccess] = useState("");
  const initialTab = new URLSearchParams(window.location.search).get("tab");
  const [tab, setTab] = useState<"balance" | "history" | "responses" | "services" | "profile">(
    initialTab === "services" || initialTab === "responses" || initialTab === "history" || initialTab === "profile" ? initialTab as "services" | "responses" | "history" | "profile" : "balance"
  );

  // Смена пароля
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", category: "", city: "", price: "" });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("master_phone");
    if (saved) {
      setPhone(saved);
      setInputPhone(saved);
      loadProfile(saved);
    }
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const res = await fetch(PACKAGES_URL);
    const data = await res.json();
    setPackages(data.packages || []);
  };

  const loadProfile = async (p: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PROFILE_URL}?phone=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data.not_found) {
        setError("Мастер не найден. Сначала зарегистрируйтесь на главной странице.");
        setMaster(null);
      } else {
        setMaster(data.master);
        setTransactions(data.transactions || []);
        setMyResponses(data.my_responses || []);
        setMyServices(data.my_services || []);
        localStorage.setItem("master_phone", p);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone.trim()) return;
    setPhone(inputPhone.trim());
    loadProfile(inputPhone.trim());
  };

  const handleBuy = async (pkg: Package) => {
    if (!master) return;
    setBuyingId(pkg.id);
    setBuySuccess("");
    try {
      const res = await fetch(PACKAGES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master_id: master.id, package_id: pkg.id }),
      });
      const data = await res.json();
      if (data.success) {
        setBuySuccess(`Куплено ${pkg.responses_count} откликов!`);
        setMaster((m) => m ? { ...m, balance: data.new_balance } : m);
        await loadProfile(phone);
        setTimeout(() => setBuySuccess(""), 4000);
      }
    } finally {
      setBuyingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("master_phone");
    setMaster(null);
    setPhone("");
    setInputPhone("");
    setTransactions([]);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!master) return;
    setServiceLoading(true);
    const res = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_service",
        master_id: master.id,
        title: serviceForm.title,
        description: serviceForm.description,
        category: serviceForm.category || master.category,
        city: serviceForm.city || master.city,
        price: serviceForm.price ? Number(serviceForm.price) : null,
      }),
    });
    const data = await res.json();
    setServiceLoading(false);
    if (data.success) {
      setServiceSuccess("Услуга опубликована!");
      setShowServiceForm(false);
      setServiceForm({ title: "", description: "", category: "", city: "", price: "" });
      localStorage.removeItem("master_banner_dismissed");
      await loadProfile(phone);
      setTimeout(() => setServiceSuccess(""), 3000);
    }
  };

  const handleToggleService = async (serviceId: number, isActive: boolean) => {
    if (!master) return;
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_service", service_id: serviceId, master_id: master.id, is_active: isActive }),
    });
    setMyServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: isActive } : s));
  };

  const handleBoostService = async (serviceId: number) => {
    if (!master) return;
    const res = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "boost_service", service_id: serviceId, master_id: master.id }),
    });
    const data = await res.json();
    if (data.success) {
      setServiceSuccess("Услуга поднята в топ!");
      await loadProfile(phone);
      setTimeout(() => setServiceSuccess(""), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("Пароли не совпадают"); return; }
    if (pwNew.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", master_id: master?.id, old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setPwError(d.error); return; }
      setPwSuccess("Пароль изменён!");
      setPwOld(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwSuccess(""), 3000);
    } finally { setPwLoading(false); }
  };

  if (!master && !loading) {
    return (
      <MasterLoginForm
        onLogin={(p) => { setPhone(p); setInputPhone(p); loadProfile(p); }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      {/* Шапка */}
      <div className="border-b border-white/8 bg-[#0a0d16]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </a>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
              {master?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{master?.name}</p>
              <p className="text-gray-500 text-xs">{master?.category} · {master?.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {master?.id && (
              <a href={`/master-page?id=${master.id}`} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1.5 transition-colors">
                <Icon name="User" size={15} />
                Мой профиль
              </a>
            )}
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Баланс */}
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Доступно откликов</p>
            <p className="text-5xl font-bold text-white">{master?.balance ?? 0}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center">
            <Icon name="Zap" size={30} className="text-violet-400" />
          </div>
        </div>

        {/* Уведомления */}
        {buySuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{buySuccess}
          </div>
        )}
        {serviceSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{serviceSuccess}
          </div>
        )}

        {/* Вкладки */}
        <div className="grid grid-cols-5 gap-1 bg-white/4 rounded-xl p-1 mb-6">
          <button onClick={() => setTab("balance")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "balance" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Баланс
          </button>
          <button onClick={() => setTab("services")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "services" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Услуги
            {myServices.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "services" ? "bg-white/20" : "bg-white/10"}`}>{myServices.length}</span>}
          </button>
          <button onClick={() => setTab("responses")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "responses" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Отклики
            {myResponses.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "responses" ? "bg-white/20" : "bg-white/10"}`}>{myResponses.length}</span>}
          </button>
          <button onClick={() => setTab("history")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "history" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            История
          </button>
          <button onClick={() => setTab("profile")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "profile" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Профиль
          </button>
        </div>

        {tab === "balance" && (
          <>
            <p className="text-gray-400 text-sm mb-4">Выберите пакет откликов — после подключения оплаты деньги спишутся автоматически:</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {packages.map((pkg, i) => (
                <div
                  key={pkg.id}
                  className={`bg-gradient-to-br ${PACKAGE_COLORS[i % PACKAGE_COLORS.length]} border rounded-2xl p-5 flex flex-col gap-4`}
                >
                  <div>
                    <p className="text-white font-semibold text-lg">{pkg.name}</p>
                    <p className="text-gray-400 text-sm">{pkg.responses_count} откликов</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{pkg.price} ₽</p>
                  <Button
                    onClick={() => handleBuy(pkg)}
                    disabled={buyingId === pkg.id}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
                  >
                    {buyingId === pkg.id ? "Обработка..." : "Выбрать"}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <Icon name="Info" size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-300/80 text-xs leading-relaxed">
                Оплата через ЮKassa будет подключена в ближайшее время. Сейчас пакеты зачисляются без списания средств для тестирования.
              </p>
            </div>
            <p className="mt-4 text-gray-600 text-xs text-center">
              Нажимая «Выбрать», вы соглашаетесь с{" "}
              <a href="/offer" target="_blank" className="text-violet-500 hover:text-violet-400 underline transition-colors">
                публичной офертой
              </a>
              . Исполнитель: Харисов Э.И., ИНН 860234992431.
            </p>
          </>
        )}

        {tab === "services" && (
          <div>
            {/* Ценник публикации */}
            {!showServiceForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-violet-600/15 to-indigo-600/5 border border-violet-500/25 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                      <Icon name="Briefcase" size={18} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Публикация услуги</p>
                      <p className="text-violet-300 text-sm font-bold">300 ₽ / месяц</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {["Размещение в разделе «Все услуги»", "Показ всем клиентам на главной", "Ссылка на ваш профиль"].map(f => (
                      <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Icon name="Check" size={12} className="text-violet-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => setShowServiceForm(true)} className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm gap-1.5">
                    <Icon name="Plus" size={15} />Добавить услугу
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-amber-600/15 to-orange-600/5 border border-amber-500/25 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
                      <Icon name="TrendingUp" size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Поднятие в топ</p>
                      <p className="text-amber-300 text-sm font-bold">50 ₽ за раз</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {["Ваша услуга поднимается выше всех", "Новые клиенты видят вас первым", "Действует до следующей публикации"].map(f => (
                      <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Icon name="Check" size={12} className="text-amber-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-600 text-xs text-center">Доступно после публикации услуги</p>
                </div>
              </div>
            )}

            {showServiceForm && (
              <form onSubmit={handleAddService} className="bg-white/4 border border-violet-500/30 rounded-2xl p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold">Новая услуга</h3>
                  <span className="text-violet-400 text-sm font-medium">300 ₽ / месяц</span>
                </div>
                <input
                  required
                  placeholder="Название услуги *"
                  value={serviceForm.title}
                  onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                <textarea
                  rows={2}
                  placeholder="Описание (необязательно)"
                  value={serviceForm.description}
                  onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={serviceForm.category || master?.category || ""}
                    onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="" disabled>Категория *</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    placeholder={`Город (${master?.city || "укажите"})`}
                    value={serviceForm.city || master?.city || ""}
                    onChange={e => setServiceForm(f => ({ ...f, city: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Цена от (₽)"
                  value={serviceForm.price}
                  onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                  <Icon name="Info" size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-300/80 text-xs leading-relaxed">Оплата через ЮKassa будет подключена в ближайшее время. Сейчас услуги публикуются бесплатно для тестирования.</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={() => setShowServiceForm(false)}>Отмена</Button>
                  <Button type="submit" disabled={serviceLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                    {serviceLoading ? "Публикация..." : "Опубликовать — 300 ₽"}
                  </Button>
                </div>
              </form>
            )}

            {myServices.length === 0 && !showServiceForm ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Briefcase" size={32} className="mx-auto mb-3 opacity-40" />
                <p>Услуг пока нет — добавьте первую</p>
              </div>
            ) : myServices.length > 0 && (
              <div className="flex flex-col gap-3">
                {myServices.map(s => {
                  const isPaid = s.paid_until && new Date(s.paid_until) > new Date();
                  const isBoosted = s.boosted_until && new Date(s.boosted_until) > new Date();
                  return (
                    <div key={s.id} className={`bg-white/4 border rounded-xl p-4 ${isBoosted ? "border-amber-500/30" : s.is_active ? "border-white/8" : "border-white/4 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-white font-medium text-sm">{s.title}</p>
                            {isBoosted && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Icon name="TrendingUp" size={9}/>В топе</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-gray-500 text-xs">{s.category}</span>
                            <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10}/>{s.city}</span>
                            {s.price && <span className="text-emerald-400 text-xs">от {s.price.toLocaleString("ru-RU")} ₽</span>}
                            {isPaid && s.paid_until && <span className="text-violet-400 text-xs">до {new Date(s.paid_until).toLocaleDateString("ru-RU", {day:"numeric",month:"short"})}</span>}
                          </div>
                          {s.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{s.description}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleBoostService(s.id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border bg-amber-600/15 text-amber-400 border-amber-500/20 hover:bg-amber-600/25 transition-colors flex items-center gap-1"
                          >
                            <Icon name="TrendingUp" size={11}/>50 ₽
                          </button>
                          <button
                            onClick={() => handleToggleService(s.id, !s.is_active)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${s.is_active ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20 hover:bg-red-600/15 hover:text-red-400 hover:border-red-500/20" : "bg-gray-600/15 text-gray-400 border-gray-500/20 hover:bg-emerald-600/15 hover:text-emerald-400 hover:border-emerald-500/20"}`}
                          >
                            {s.is_active ? "Скрыть" : "Показать"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "responses" && (
          <div className="flex flex-col gap-3">
            {myResponses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="MessageCircle" size={32} className="mx-auto mb-3 opacity-40" />
                <p>Вы ещё не откликались на заявки</p>
                <a href="/orders"><Button className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm">Смотреть заявки</Button></a>
              </div>
            ) : (
              myResponses.map((r) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  new: { label: "Новая", color: "text-blue-400 bg-blue-600/15 border-blue-500/20" },
                  in_progress: { label: "В работе", color: "text-amber-400 bg-amber-600/15 border-amber-500/20" },
                  done: { label: "Выполнена", color: "text-emerald-400 bg-emerald-600/15 border-emerald-500/20" },
                  cancelled: { label: "Отменена", color: "text-gray-400 bg-gray-600/15 border-gray-500/20" },
                };
                const st = statusMap[r.order_status] || statusMap.new;
                return (
                  <div key={r.id} className="bg-white/4 border border-white/8 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{r.order_title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {r.order_category && <span className="text-gray-500 text-xs">{r.order_category}</span>}
                          {r.order_city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10} />{r.order_city}</span>}
                          <span className="text-gray-600 text-xs">{formatDate(r.created_at)}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg border flex-shrink-0 ${st.color}`}>{st.label}</span>
                    </div>
                    {r.message && <p className="text-gray-400 text-sm border-t border-white/6 pt-2 mt-2">{r.message}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="flex flex-col gap-3">
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Icon name="ClockFading" size={32} className="mx-auto mb-3 opacity-40" fallback="Clock" />
                <p>История пока пуста</p>
              </div>
            )}
            {transactions.map((t) => (
              <div key={t.id} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "purchase" ? "bg-emerald-600/20" : "bg-violet-600/20"}`}>
                    <Icon name={t.type === "purchase" ? "Plus" : "Zap"} size={15} className={t.type === "purchase" ? "text-emerald-400" : "text-violet-400"} />
                  </div>
                  <div>
                    <p className="text-sm text-white">{t.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${t.type === "purchase" ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" : "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                  {t.type === "purchase" ? "+" : "-"}{t.amount}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="flex flex-col gap-6 max-w-md">
            {/* Инфо */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="text-white font-semibold text-sm mb-1">Данные аккаунта</h3>
              {[
                { label: "Имя", value: master?.name },
                { label: "Телефон", value: master?.phone },
                { label: "Категория", value: master?.category },
                { label: "Город", value: master?.city },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-white/6 last:border-0">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-white text-sm">{value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Смена пароля */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Изменить пароль</h3>
              {pwSuccess && (
                <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
                  <Icon name="CheckCircle" size={15} />{pwSuccess}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                {["Текущий пароль", "Новый пароль", "Повторите новый"].map((label, i) => {
                  const vals = [pwOld, pwNew, pwConfirm];
                  const setters = [setPwOld, setPwNew, setPwConfirm];
                  return (
                    <div key={label}>
                      <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                      <input type="password" required value={vals[i]} onChange={e => setters[i](e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
                    </div>
                  );
                })}
                {pwError && <p className="text-amber-400 text-sm">{pwError}</p>}
                <Button type="submit" disabled={pwLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full mt-1">
                  {pwLoading ? "Сохранение..." : "Изменить пароль"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}