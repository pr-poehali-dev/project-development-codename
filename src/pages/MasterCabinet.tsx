import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buySuccess, setBuySuccess] = useState("");
  const [tab, setTab] = useState<"balance" | "history">("balance");

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

  if (!master && !loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Icon name="Wrench" size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Кабинет мастера</h1>
            <p className="text-gray-400 text-sm">Войдите по номеру телефона</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона</label>
              <input
                type="tel"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white w-full">
              Войти
            </Button>
            <p className="text-gray-500 text-xs text-center">
              Нет аккаунта?{" "}
              <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
                Зарегистрируйтесь на главной
              </a>
            </p>
          </form>
        </div>
      </div>
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

        {/* Уведомление об успешной покупке */}
        {buySuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />
            {buySuccess}
          </div>
        )}

        {/* Вкладки */}
        <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("balance")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "balance" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Пополнить баланс
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "history" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            История
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
      </div>
    </div>
  );
}