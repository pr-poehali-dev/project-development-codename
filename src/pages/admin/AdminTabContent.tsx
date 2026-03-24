import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

type Tab = "dashboard" | "masters" | "customers" | "orders" | "reviews" | "categories";

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

interface AdminTabContentProps {
  tab: Tab;
  loading: boolean;
  dashboard: Record<string, number> | null;
  masters: Record<string, unknown>[];
  customers: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  newCategory: string;
  setNewCategory: (v: string) => void;
  onOpenEdit: (type: "master" | "customer", data: Record<string, unknown>) => void;
  onOpenBalance: (m: Record<string, unknown>) => void;
  onBlockMaster: (id: number, block: boolean) => void;
  onBlockCustomer: (id: number, block: boolean) => void;
  onUpdateOrderStatus: (id: number, status: string) => void;
  onDeleteOrder: (id: number) => void;
  onDeleteReview: (id: number) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number) => void;
}

export default function AdminTabContent({
  tab,
  loading,
  dashboard,
  masters,
  customers,
  orders,
  reviews,
  categories,
  newCategory,
  setNewCategory,
  onOpenEdit,
  onOpenBalance,
  onBlockMaster,
  onBlockCustomer,
  onUpdateOrderStatus,
  onDeleteOrder,
  onDeleteReview,
  onAddCategory,
  onDeleteCategory,
}: AdminTabContentProps) {
  return (
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
              <div key={m.id as string} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{m.name as string}</span>
                    {m.is_blocked && <Badge variant="destructive" className="text-xs">Заблокирован</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">{m.phone as string} · {m.email as string} · {m.city as string}</div>
                  <div className="text-sm text-gray-500">{m.category as string} · Баланс: <b>{m.balance as number}</b> · ⭐ {Number(m.avg_rating).toFixed(1)} ({m.reviews_count as number})</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => onOpenEdit("master", m)}>
                    <Icon name="Pencil" size={14} className="mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenBalance(m)}
                  >
                    <Icon name="Coins" size={14} className="mr-1" />
                    Баланс
                  </Button>
                  <Button
                    size="sm"
                    variant={m.is_blocked ? "default" : "destructive"}
                    onClick={() => onBlockMaster(m.id as number, !m.is_blocked)}
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
              <div key={c.id as string} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{c.name as string}</span>
                    {c.is_blocked && <Badge variant="destructive" className="text-xs">Заблокирован</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">{c.phone as string} · {c.email as string}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => onOpenEdit("customer", c)}>
                    <Icon name="Pencil" size={14} className="mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant={c.is_blocked ? "default" : "destructive"}
                    onClick={() => onBlockCustomer(c.id as number, !c.is_blocked)}
                  >
                    <Icon name={c.is_blocked ? "Unlock" : "Ban"} size={14} className="mr-1" />
                    {c.is_blocked ? "Разблокировать" : "Заблокировать"}
                  </Button>
                </div>
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
              <div key={o.id as string} className="bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800">{o.title as string}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status as string]}`}>
                      {STATUS_LABELS[o.status as string]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{o.category as string} · {o.city as string}{o.budget ? ` · до ${o.budget} ₽` : ""}</div>
                  <div className="text-sm text-gray-500">{o.contact_name as string} · {o.contact_phone as string}</div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{o.description as string}</div>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  <select
                    className="text-xs border rounded px-2 py-1 bg-white"
                    value={o.status as string}
                    onChange={(e) => onUpdateOrderStatus(o.id as number, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => onDeleteOrder(o.id as number)}>
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
              <div key={r.id as string} className="bg-white rounded-xl p-4 border flex gap-3 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{r.master_name as string}</span>
                    <span className="text-yellow-500 text-sm">{"⭐".repeat(r.rating as number)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.text as string}</p>
                  <div className="text-xs text-gray-400 mt-1">{new Date(r.created_at as string).toLocaleDateString("ru")}</div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => onDeleteReview(r.id as number)}>
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
              onKeyDown={(e) => e.key === "Enter" && onAddCategory()}
              className="max-w-sm"
            />
            <Button onClick={onAddCategory} className="bg-purple-600 hover:bg-purple-700">
              <Icon name="Plus" size={16} className="mr-1" />
              Добавить
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div key={c.id as string} className="flex items-center gap-1 bg-white border rounded-full px-3 py-1">
                <span className="text-sm text-gray-700">{c.name as string}</span>
                <button
                  onClick={() => onDeleteCategory(c.id as number)}
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
  );
}
