import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";

function api(action: string, method = "GET", body?: object, token?: string) {
  const sep = action ? "?" : "";
  return fetch(`${API}${sep}${action ? `action=${action}` : ""}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Admin-Token": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
  cancelled: "Отменена",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

type Tab = "dashboard" | "masters" | "customers" | "orders" | "reviews" | "categories";

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [masters, setMasters] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [balanceModal, setBalanceModal] = useState<Record<string, unknown> | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceComment, setBalanceComment] = useState("");

  const loadTab = useCallback(async (t: Tab, tk: string) => {
    setLoading(true);
    try {
      if (t === "dashboard") {
        const d = await api("admin_dashboard", "GET", undefined, tk);
        setDashboard(d);
      } else if (t === "masters") {
        const d = await api("admin_masters", "GET", undefined, tk);
        setMasters(d.masters || []);
      } else if (t === "customers") {
        const d = await api("admin_customers", "GET", undefined, tk);
        setCustomers(d.customers || []);
      } else if (t === "orders") {
        const d = await api("admin_orders", "GET", undefined, tk);
        setOrders(d.orders || []);
      } else if (t === "reviews") {
        const d = await api("admin_reviews", "GET", undefined, tk);
        setReviews(d.reviews || []);
      } else if (t === "categories") {
        const d = await api("admin_categories", "GET", undefined, tk);
        setCategories(d.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadTab(tab, token);
  }, [tab, isLoggedIn, loadTab, token]);

  const handleLogin = async () => {
    setLoginError("");
    const res = await api(setupMode ? "admin_setup" : "admin_login", "POST", loginForm);
    if (res.error) return setLoginError(res.error);
    const tk = setupMode ? res.token || token : res.token;
    localStorage.setItem("admin_token", tk || token);
    setToken(tk || token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
  };

  const blockMaster = async (id: number, block: boolean) => {
    await api("admin_block_master", "POST", { master_id: id, block }, token);
    loadTab("masters", token);
  };

  const blockCustomer = async (id: number, block: boolean) => {
    await api("admin_block_customer", "POST", { customer_id: id, block }, token);
    loadTab("customers", token);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await api("admin_update_order_status", "POST", { order_id: id, status }, token);
    loadTab("orders", token);
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    await api("admin_delete_order", "POST", { order_id: id }, token);
    loadTab("orders", token);
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    await api("admin_delete_review", "POST", { review_id: id }, token);
    loadTab("reviews", token);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await api("admin_add_category", "POST", { name: newCategory.trim() }, token);
    setNewCategory("");
    loadTab("categories", token);
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    await api("admin_delete_category", "POST", { id }, token);
    loadTab("categories", token);
  };

  const adjustBalance = async () => {
    if (!balanceModal || !balanceAmount) return;
    await api("admin_adjust_balance", "POST", {
      master_id: balanceModal.id,
      amount: Number(balanceAmount),
      comment: balanceComment || "Корректировка администратором",
    }, token);
    setBalanceModal(null);
    setBalanceAmount("");
    setBalanceComment("");
    loadTab("masters", token);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="Shield" size={28} className="text-purple-600" />
            <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="Логин"
              value={loginForm.login}
              onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleLogin}>
              {setupMode ? "Создать аккаунт" : "Войти"}
            </Button>
            <button
              className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
              onClick={() => setSetupMode(!setupMode)}
            >
              {setupMode ? "Уже есть аккаунт" : "Первый вход? Создать аккаунт"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Обзор", icon: "LayoutDashboard" },
    { id: "masters", label: "Мастера", icon: "Wrench" },
    { id: "customers", label: "Заказчики", icon: "Users" },
    { id: "orders", label: "Заявки", icon: "FileText" },
    { id: "reviews", label: "Отзывы", icon: "Star" },
    { id: "categories", label: "Категории", icon: "Tag" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col py-6 px-3 gap-1 min-h-screen">
        <div className="flex items-center gap-2 px-3 mb-6">
          <Icon name="Shield" size={22} className="text-purple-600" />
          <span className="font-bold text-gray-800">Админ</span>
        </div>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Icon name="Loader2" size={16} className="animate-spin" />
            Загрузка...
          </div>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && dashboard && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Обзор</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Мастеров", value: dashboard.masters_count, icon: "Wrench", color: "text-purple-600" },
                { label: "Заказчиков", value: dashboard.customers_count, icon: "Users", color: "text-blue-600" },
                { label: "Всего заявок", value: dashboard.orders_count, icon: "FileText", color: "text-gray-600" },
                { label: "Новых заявок", value: dashboard.orders_new, icon: "Bell", color: "text-orange-500" },
                { label: "Отзывов", value: dashboard.reviews_count, icon: "Star", color: "text-yellow-500" },
                { label: "Токенов у мастеров", value: dashboard.total_balance, icon: "Coins", color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border">
                  <Icon name={s.icon} size={22} className={`${s.color} mb-2`} />
                  <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MASTERS */}
        {tab === "masters" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Мастера</h2>
            <div className="space-y-2">
              {masters.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{m.name}</span>
                      {m.is_blocked && <Badge variant="destructive" className="text-xs">Заблокирован</Badge>}
                    </div>
                    <div className="text-sm text-gray-500">{m.phone} · {m.email} · {m.city}</div>
                    <div className="text-sm text-gray-500">{m.category} · Баланс: <b>{m.balance}</b> · ⭐ {Number(m.avg_rating).toFixed(1)} ({m.reviews_count})</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setBalanceModal(m); setBalanceAmount(""); setBalanceComment(""); }}
                    >
                      <Icon name="Coins" size={14} className="mr-1" />
                      Баланс
                    </Button>
                    <Button
                      size="sm"
                      variant={m.is_blocked ? "default" : "destructive"}
                      onClick={() => blockMaster(m.id, !m.is_blocked)}
                    >
                      <Icon name={m.is_blocked ? "Unlock" : "Ban"} size={14} className="mr-1" />
                      {m.is_blocked ? "Разблокировать" : "Заблокировать"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === "customers" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Заказчики</h2>
            <div className="space-y-2">
              {customers.map((c) => (
                <div key={c.id} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{c.name}</span>
                      {c.is_blocked && <Badge variant="destructive" className="text-xs">Заблокирован</Badge>}
                    </div>
                    <div className="text-sm text-gray-500">{c.phone} · {c.email}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={c.is_blocked ? "default" : "destructive"}
                    onClick={() => blockCustomer(c.id, !c.is_blocked)}
                  >
                    <Icon name={c.is_blocked ? "Unlock" : "Ban"} size={14} className="mr-1" />
                    {c.is_blocked ? "Разблокировать" : "Заблокировать"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Заявки</h2>
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800">{o.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{o.category} · {o.city}{o.budget ? ` · до ${o.budget} ₽` : ""}</div>
                    <div className="text-sm text-gray-500">{o.contact_name} · {o.contact_phone}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{o.description}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <select
                      className="text-xs border rounded px-2 py-1 bg-white"
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="destructive" onClick={() => deleteOrder(o.id)}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Отзывы</h2>
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 border flex gap-3 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{r.master_name}</span>
                      <span className="text-yellow-500 text-sm">{"⭐".repeat(r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.text}</p>
                    <div className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString("ru")}</div>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteReview(r.id)}>
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Категории услуг</h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Новая категория..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="max-w-sm"
              />
              <Button onClick={addCategory} className="bg-purple-600 hover:bg-purple-700">
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-1 bg-white border rounded-full px-3 py-1">
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Модалка баланса */}
      {balanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-1">Изменить баланс</h3>
            <p className="text-sm text-gray-500 mb-4">{balanceModal.name} · текущий баланс: {balanceModal.balance}</p>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Сумма (+ пополнение, - списание)"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
              <Input
                placeholder="Комментарий"
                value={balanceComment}
                onChange={(e) => setBalanceComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={adjustBalance}>
                  Применить
                </Button>
                <Button variant="outline" onClick={() => setBalanceModal(null)}>Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}