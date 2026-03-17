import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
const AUTH_URL = MY_ORDERS_URL;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-600/15 text-blue-400 border-blue-500/20" },
  in_progress: { label: "В работе", color: "bg-amber-600/15 text-amber-400 border-amber-500/20" },
  done: { label: "Выполнена", color: "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Отменена", color: "bg-gray-600/15 text-gray-400 border-gray-500/20" },
};

const categoryColors: Record<string, string> = {
  "Авторемонт": "bg-blue-600/15 text-blue-400 border-blue-500/20",
  "Ремонт жилья": "bg-amber-600/15 text-amber-400 border-amber-500/20",
  "Строительство": "bg-orange-600/15 text-orange-400 border-orange-500/20",
  "Бьюти": "bg-pink-600/15 text-pink-400 border-pink-500/20",
  "IT-помощь": "bg-violet-600/15 text-violet-400 border-violet-500/20",
  "Сантехника": "bg-cyan-600/15 text-cyan-400 border-cyan-500/20",
  "Электрика": "bg-yellow-600/15 text-yellow-400 border-yellow-500/20",
  "Перевозки": "bg-red-600/15 text-red-400 border-red-500/20",
  "Няня": "bg-emerald-600/15 text-emerald-400 border-emerald-500/20",
  "Клининг": "bg-teal-600/15 text-teal-400 border-teal-500/20",
  "Прочее": "bg-gray-600/15 text-gray-400 border-gray-500/20",
};

interface Review {
  id: number;
  rating: number;
  comment: string;
}

interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  master_id: number | null;
  message: string;
  created_at: string;
  review: Review | null;
}

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  status: string;
  accepted_response_id: number | null;
  created_at: string;
  responses: Response[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-xl transition-colors ${(hovered || value) >= star ? "text-amber-400" : "text-gray-600"} ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default function Cabinet() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Форма входа
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");
  const [regStep, setRegStep] = useState<"form" | "code" | "password">("form");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [selectMasterLoading, setSelectMasterLoading] = useState<number | null>(null);

  const handleSelectMaster = async (orderId: number, responseId: number) => {
    if (!customer) return;
    setSelectMasterLoading(responseId);
    await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select_master", order_id: orderId, response_id: responseId, customer_id: customer.id }),
    });
    await loadProfile(customer.phone);
    setSelectMasterLoading(null);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    if (!customer) return;
    setStatusLoading(orderId);
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, status, customer_id: customer.id }),
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    setStatusLoading(null);
  };

  // Форма отзыва
  const [reviewForm, setReviewForm] = useState<{ orderId: number; masterName: string; masterId: number | null } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone");
    if (saved) loadProfile(saved);
  }, []);

  const loadProfile = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.customer) {
        setCustomer(parsed.customer);
        setOrders(parsed.orders || []);
        localStorage.setItem("customer_phone", parsed.customer.phone);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth_login", email: loginIdentifier.includes("@") ? loginIdentifier : undefined, phone: !loginIdentifier.includes("@") ? loginIdentifier : undefined, password: loginPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email: loginEmail, phone: loginPhone, name: loginName }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) {
        if (parsed.already_exists) setLoginMode("login");
        setLoginError(parsed.error);
        return;
      }
      if (parsed.success) setRegStep("code");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_code", email: loginEmail, code: regCode }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) setRegStep("password");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (regPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_password", email: loginEmail, password: regPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_phone");
    setCustomer(null);
    setOrders([]);
    setLoginIdentifier("");
    setLoginPassword("");
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm || !customer) return;
    setReviewLoading(true);
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          customer_id: customer.id,
          order_id: reviewForm.orderId,
          master_name: reviewForm.masterName,
          master_id: reviewForm.masterId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.success) {
        setReviewSuccess("Отзыв отправлен!");
        setReviewForm(null);
        setReviewComment("");
        setReviewRating(5);
        await loadProfile(customer.phone);
        setTimeout(() => setReviewSuccess(""), 3000);
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"active" | "done">("active");

  const activeOrders = orders.filter(o => o.status !== "done" && o.status !== "cancelled");
  const doneOrders = orders.filter(o => o.status === "done" || o.status === "cancelled");
  const visibleOrders = activeTab === "active" ? activeOrders : doneOrders;

  const totalResponses = orders.reduce((s, o) => s + o.responses.length, 0);

  // Экран входа
  if (!customer && !loading) {
    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-white">HandyMan</span>
            </a>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Icon name="LayoutDashboard" size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Кабинет заказчика</h1>
          </div>

          {/* Табы */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
            <button onClick={() => { setLoginMode("login"); setLoginError(""); setRegisterSent(false); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${loginMode === "login" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Войти
            </button>
            <button onClick={() => { setLoginMode("register"); setLoginError(""); setRegisterSent(false); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${loginMode === "register" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Регистрация
            </button>
          </div>

          {loginMode === "login" ? (
            <form onSubmit={handleLogin} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email или телефон</label>
                <input type="text" required value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="email@example.com или +7..." className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
                <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Ваш пароль" className={inputCls} />
              </div>
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Вход..." : "Войти"}
              </Button>
              <p className="text-center text-gray-500 text-xs">Нет аккаунта?{" "}
                <button type="button" onClick={() => { setLoginMode("register"); setRegStep("form"); setLoginError(""); }} className="text-violet-400 hover:underline">Зарегистрироваться</button>
              </p>
            </form>
          ) : regStep === "form" ? (
            <form onSubmit={handleRegister} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя</label>
                <input type="text" required value={loginName} onChange={e => setLoginName(e.target.value)}
                  placeholder="Иван Иванов" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Телефон</label>
                <input type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00" className={inputCls} />
              </div>
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Отправка..." : "Продолжить"}
              </Button>
              <p className="text-center text-gray-500 text-xs">Уже есть аккаунт?{" "}
                <button type="button" onClick={() => { setLoginMode("login"); setLoginError(""); }} className="text-violet-400 hover:underline">Войти</button>
              </p>
            </form>
          ) : regStep === "code" ? (
            <form onSubmit={handleVerifyCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Mail" size={22} className="text-violet-400" />
                </div>
                <p className="text-white font-medium">Введите код из письма</p>
                <p className="text-gray-500 text-sm mt-1">Отправили на <span className="text-gray-300">{loginEmail}</span></p>
              </div>
              <div>
                <input type="text" required maxLength={6} value={regCode} onChange={e => setRegCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000" className={`${inputCls} text-center tracking-widest text-xl font-bold`} autoFocus />
              </div>
              {loginError && <p className="text-amber-400 text-sm text-center">{loginError}</p>}
              <Button type="submit" disabled={loginLoading || regCode.length < 6} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Проверка..." : "Подтвердить"}
              </Button>
              <button type="button" onClick={() => { setRegStep("form"); setRegCode(""); setLoginError(""); }}
                className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">
                Ввести данные снова
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Lock" size={22} className="text-violet-400" />
                </div>
                <p className="text-white font-medium">Придумайте пароль</p>
                <p className="text-gray-500 text-sm mt-1">Email подтверждён!</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
                <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  placeholder="Минимум 6 символов" className={inputCls} autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Повторите пароль</label>
                <input type="password" required value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)}
                  placeholder="Повторите пароль" className={inputCls} />
              </div>
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Сохранение..." : "Сохранить и войти"}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 text-sm">
                {customer?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-gray-300 text-sm hidden sm:block">{customer?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Уведомление об отзыве */}
        {reviewSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />
            {reviewSuccess}
          </div>
        )}

        {/* Сводка */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Заявок", value: orders.length, icon: "ClipboardList", color: "text-violet-400" },
            { label: "Откликов", value: totalResponses, icon: "MessageCircle", color: "text-emerald-400" },
            { label: "Активных", value: orders.filter(o => o.status === "new").length, icon: "Clock", color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/4 border border-white/8 rounded-2xl p-4 text-center">
              <Icon name={stat.icon} size={20} className={`${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Форма отзыва */}
        {reviewForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-white font-semibold text-lg mb-1">Отзыв о мастере</h3>
              <p className="text-gray-400 text-sm mb-5">{reviewForm.masterName}</p>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Оценка</label>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Комментарий</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Расскажите о работе мастера..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={() => setReviewForm(null)}>Отмена</Button>
                  <Button type="submit" disabled={reviewLoading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    {reviewLoading ? "Отправка..." : "Отправить"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Вкладки */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "active" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
          >
            <Icon name="Clock" size={15} />
            Активные
            {activeOrders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "active" ? "bg-white/20" : "bg-white/10"}`}>{activeOrders.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "done" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
          >
            <Icon name="CheckCircle" size={15} />
            Завершённые
            {doneOrders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "done" ? "bg-white/20" : "bg-white/10"}`}>{doneOrders.length}</span>}
          </button>
        </div>

        {/* Список заявок */}
        {visibleOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Icon name="ClipboardList" size={28} className="text-gray-600" />
            </div>
            {activeTab === "active" ? (
              <>
                <p className="text-gray-500 text-lg">Активных заявок нет</p>
                <a href="/"><Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Создать заявку</Button></a>
              </>
            ) : (
              <p className="text-gray-500 text-lg">Завершённых заявок пока нет</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <div key={order.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 cursor-pointer hover:bg-white/2 transition-colors" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                          {order.category}
                        </Badge>
                        <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${STATUS_LABELS[order.status]?.color || STATUS_LABELS.new.color}`}>
                          {STATUS_LABELS[order.status]?.label || "Новая"}
                        </Badge>
                        {order.city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={11} />{order.city}</span>}
                        {order.budget && <span className="text-emerald-400 text-xs font-medium">до {order.budget.toLocaleString("ru-RU")} ₽</span>}
                        <span className="text-gray-600 text-xs">{formatDate(order.created_at)}</span>
                      </div>
                      <h3 className="text-white font-semibold">{order.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {order.responses.length > 0 && (
                        <span className="bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-lg">
                          {order.responses.length} {order.responses.length === 1 ? "отклик" : "отклика"}
                        </span>
                      )}
                      <Icon name={expandedOrder === order.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-white/6 px-5 pb-5 pt-4">
                    <p className="text-gray-400 text-sm mb-4">{order.description}</p>

                    {/* Смена статуса */}
                    {order.status !== "done" && order.status !== "cancelled" && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {order.status !== "in_progress" && (
                          <button
                            disabled={statusLoading === order.id}
                            onClick={() => handleStatusChange(order.id, "in_progress")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 transition-colors"
                          >
                            Мастер приступил
                          </button>
                        )}
                        <button
                          disabled={statusLoading === order.id}
                          onClick={() => handleStatusChange(order.id, "done")}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-colors"
                        >
                          Работа выполнена ✓
                        </button>
                        <button
                          disabled={statusLoading === order.id}
                          onClick={() => handleStatusChange(order.id, "cancelled")}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-600/15 text-gray-500 border border-gray-500/20 hover:bg-gray-600/25 transition-colors"
                        >
                          Отменить
                        </button>
                      </div>
                    )}

                    {order.responses.length === 0 ? (
                      <p className="text-gray-600 text-sm">Откликов пока нет — мастера скоро увидят вашу заявку</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                          {order.accepted_response_id ? "Выбранный исполнитель" : `Отклики мастеров · ${order.responses.length}`}
                        </p>
                        {order.responses
                          .filter(r => !order.accepted_response_id || r.id === order.accepted_response_id)
                          .map((r) => {
                            const isAccepted = order.accepted_response_id === r.id;
                            return (
                              <div key={r.id} className={`border rounded-xl p-4 ${isAccepted ? "bg-emerald-600/8 border-emerald-500/25" : "bg-white/3 border-white/6"}`}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-white font-semibold text-sm">{r.master_name}</p>
                                      {isAccepted && (
                                        <span className="text-emerald-400 text-xs flex items-center gap-1 bg-emerald-600/15 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                                          <Icon name="CheckCircle" size={11} /> Выбран
                                        </span>
                                      )}
                                      {r.master_id && (
                                        <a href={`/master-page?id=${r.master_id}`} className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
                                          <Icon name="ExternalLink" size={11} />профиль
                                        </a>
                                      )}
                                    </div>
                                    {r.master_category && <p className="text-gray-500 text-xs mt-0.5">{r.master_category}</p>}
                                  </div>
                                  <a href={`tel:${r.master_phone}`} className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex-shrink-0">
                                    <Icon name="Phone" size={13} />
                                    {r.master_phone}
                                  </a>
                                </div>
                                {r.message && <p className="text-gray-300 text-sm mb-3">{r.message}</p>}
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Кнопка выбора — только если исполнитель ещё не выбран */}
                                  {!order.accepted_response_id && order.status === "new" && (
                                    <button
                                      disabled={selectMasterLoading === r.id}
                                      onClick={() => handleSelectMaster(order.id, r.id)}
                                      className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors flex items-center gap-1.5"
                                    >
                                      <Icon name="UserCheck" size={13} />
                                      {selectMasterLoading === r.id ? "Выбираем..." : "Выбрать исполнителем"}
                                    </button>
                                  )}
                                  {/* Отзыв — только после выполнения */}
                                  {r.review ? (
                                    <div className="bg-amber-600/10 border border-amber-500/15 rounded-lg px-3 py-2 flex items-center gap-2">
                                      <StarRating value={r.review.rating} />
                                      {r.review.comment && <p className="text-gray-400 text-xs ml-1">{r.review.comment}</p>}
                                    </div>
                                  ) : order.status === "done" && isAccepted ? (
                                    <button
                                      onClick={() => { setReviewForm({ orderId: order.id, masterName: r.master_name, masterId: r.master_id }); setReviewRating(5); setReviewComment(""); }}
                                      className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                      <Icon name="Star" size={13} />
                                      Оставить отзыв
                                    </button>
                                  ) : order.status !== "done" && isAccepted ? (
                                    <span className="text-gray-600 text-xs flex items-center gap-1">
                                      <Icon name="Lock" size={12} />
                                      Отзыв после выполнения
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        {/* Показать остальных если исполнитель выбран */}
                        {order.accepted_response_id && order.responses.filter(r => r.id !== order.accepted_response_id).length > 0 && (
                          <details className="text-xs text-gray-600 cursor-pointer">
                            <summary className="hover:text-gray-400 transition-colors">
                              Ещё {order.responses.length - 1} {order.responses.length - 1 === 1 ? "отклик" : "отклика"}
                            </summary>
                            <div className="space-y-2 mt-2">
                              {order.responses.filter(r => r.id !== order.accepted_response_id).map(r => (
                                <div key={r.id} className="bg-white/2 border border-white/5 rounded-xl p-3 text-gray-500">
                                  <p className="text-sm text-gray-400">{r.master_name}</p>
                                  {r.master_category && <p className="text-xs">{r.master_category}</p>}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}