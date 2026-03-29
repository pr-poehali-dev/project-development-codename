import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import type { Tab } from "./AdminSidebar";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая", in_progress: "В работе", done: "Завершена", cancelled: "Отменена",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
};
const DEAL_LABELS: Record<string, string> = {
  pending: "В процессе", deal: "Договорились", no_deal: "Не договорились",
};
const DEAL_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600", deal: "bg-green-100 text-green-700", no_deal: "bg-red-100 text-red-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface AdminTabContentProps {
  tab: Tab;
  loading: boolean;
  dashboard: Record<string, number> | null;
  masters: Record<string, unknown>[];
  customers: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  services: Record<string, unknown>[];
  chats: Record<string, unknown>[];
  chatMessages: Record<string, unknown>[];
  activeChatId: number | null;
  responses: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  newCategory: string;
  setNewCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onOpenEdit: (type: "master" | "customer", data: Record<string, unknown>) => void;
  onOpenBalance: (m: Record<string, unknown>) => void;
  onBlockMaster: (id: number, block: boolean) => void;
  onBlockCustomer: (id: number, block: boolean) => void;
  onDeleteMaster: (id: number) => void;
  onDeleteCustomer: (id: number) => void;
  onUpdateOrderStatus: (id: number, status: string) => void;
  onDeleteOrder: (id: number) => void;
  onDeleteReview: (id: number) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number) => void;
  onDeleteService: (id: number) => void;
  onToggleService: (id: number, active: boolean) => void;
  onDeleteChat: (id: number) => void;
  onViewChat: (id: number) => void;
  onDeleteResponse: (id: number) => void;
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {count !== undefined && <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function Loader() {
  return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-16 text-gray-400">{text}</div>;
}

export default function AdminTabContent({
  tab, loading, dashboard, masters, customers, orders, reviews, categories,
  services, chats, chatMessages, activeChatId, responses, payments,
  newCategory, setNewCategory, searchQuery, setSearchQuery,
  onOpenEdit, onOpenBalance, onBlockMaster, onBlockCustomer, onDeleteMaster, onDeleteCustomer,
  onUpdateOrderStatus, onDeleteOrder, onDeleteReview, onAddCategory, onDeleteCategory,
  onDeleteService, onToggleService, onDeleteChat, onViewChat, onDeleteResponse,
}: AdminTabContentProps) {

  const q = searchQuery.toLowerCase();

  // ── DASHBOARD ──
  if (tab === "dashboard") {
    if (loading || !dashboard) return <Loader />;
    const cards = [
      { label: "Мастеров", value: dashboard.masters_count, icon: "Wrench", color: "text-purple-600 bg-purple-50" },
      { label: "Заблокировано", value: dashboard.masters_blocked, icon: "Ban", color: "text-red-500 bg-red-50" },
      { label: "Заказчиков", value: dashboard.customers_count, icon: "Users", color: "text-blue-600 bg-blue-50" },
      { label: "Заявок всего", value: dashboard.orders_count, icon: "FileText", color: "text-indigo-600 bg-indigo-50" },
      { label: "Новых заявок", value: dashboard.orders_new, icon: "Bell", color: "text-amber-600 bg-amber-50" },
      { label: "Откликов", value: dashboard.responses_count, icon: "MessageCircle", color: "text-teal-600 bg-teal-50" },
      { label: "Объявлений", value: dashboard.active_services, icon: "Briefcase", color: "text-emerald-600 bg-emerald-50" },
      { label: "Переписок", value: dashboard.chats_count, icon: "MessagesSquare", color: "text-sky-600 bg-sky-50" },
      { label: "Договорились", value: dashboard.deals_done, icon: "Handshake", color: "text-green-700 bg-green-50" },
      { label: "Отзывов", value: dashboard.reviews_count, icon: "Star", color: "text-yellow-600 bg-yellow-50" },
      { label: "Токенов в системе", value: dashboard.total_balance, icon: "Coins", color: "text-violet-600 bg-violet-50" },
      { label: "Выручка (₽)", value: dashboard.revenue ?? 0, icon: "TrendingUp", color: "text-green-600 bg-green-50" },
    ];
    return (
      <Section title="Обзор">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <Icon name={c.icon} size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{c.value ?? 0}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // ── МАСТЕРА ──
  if (tab === "masters") {
    if (loading) return <Loader />;
    const list = masters.filter(m =>
      !q || String(m.name).toLowerCase().includes(q) || String(m.phone).includes(q) || String(m.email).toLowerCase().includes(q)
    );
    return (
      <Section title="Мастера" count={masters.length}>
        <Input placeholder="Поиск по имени, телефону, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Нет мастеров" /> : (
          <div className="space-y-2">
            {list.map((m) => (
              <div key={String(m.id)} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${m.is_blocked ? "opacity-60 border-red-200" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-sm flex-shrink-0">
                  {String(m.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{String(m.name)}</span>
                    {m.is_blocked && <Badge className="bg-red-100 text-red-600 text-[10px]">Заблокирован</Badge>}
                    {m.email_verified && <Badge className="bg-green-100 text-green-600 text-[10px]">Email ✓</Badge>}
                  </div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500">{String(m.phone)}</span>
                    {m.email && <span className="text-xs text-gray-400">{String(m.email)}</span>}
                    {m.city && <span className="text-xs text-gray-400">{String(m.city)}</span>}
                    {m.category && <span className="text-xs text-purple-600">{String(m.category)}</span>}
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">Токены: <b className="text-gray-700">{String(m.balance ?? 0)}</b></span>
                    <span className="text-xs text-gray-400">Отзывов: <b className="text-gray-700">{String(m.reviews_count ?? 0)}</b></span>
                    <span className="text-xs text-gray-400">★ {Number(m.avg_rating ?? 0).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">с {fmtDate(String(m.created_at))}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenEdit("master", m)}>
                    <Icon name="Pencil" size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenBalance(m)}>
                    <Icon name="Coins" size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${m.is_blocked ? "text-green-600" : "text-amber-600"}`}
                    onClick={() => onBlockMaster(Number(m.id), !m.is_blocked)}>
                    <Icon name={m.is_blocked ? "Unlock" : "Lock"} size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                    onClick={() => onDeleteMaster(Number(m.id))}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ЗАКАЗЧИКИ ──
  if (tab === "customers") {
    if (loading) return <Loader />;
    const list = customers.filter(c =>
      !q || String(c.name).toLowerCase().includes(q) || String(c.phone).includes(q) || String(c.email).toLowerCase().includes(q)
    );
    return (
      <Section title="Заказчики" count={customers.length}>
        <Input placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Нет заказчиков" /> : (
          <div className="space-y-2">
            {list.map((c) => (
              <div key={String(c.id)} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${c.is_blocked ? "opacity-60 border-red-200" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                  {String(c.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{String(c.name)}</span>
                    {c.is_blocked && <Badge className="bg-red-100 text-red-600 text-[10px]">Заблокирован</Badge>}
                  </div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500">{String(c.phone)}</span>
                    {c.email && <span className="text-xs text-gray-400">{String(c.email)}</span>}
                    <span className="text-xs text-gray-400">с {fmtDate(String(c.created_at))}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenEdit("customer", c)}>
                    <Icon name="Pencil" size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${c.is_blocked ? "text-green-600" : "text-amber-600"}`}
                    onClick={() => onBlockCustomer(Number(c.id), !c.is_blocked)}>
                    <Icon name={c.is_blocked ? "Unlock" : "Lock"} size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                    onClick={() => onDeleteCustomer(Number(c.id))}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ЗАЯВКИ ──
  if (tab === "orders") {
    if (loading) return <Loader />;
    const list = orders.filter(o =>
      !q || String(o.title).toLowerCase().includes(q) || String(o.contact_name).toLowerCase().includes(q) || String(o.city).toLowerCase().includes(q)
    );
    return (
      <Section title="Заявки заказчиков" count={orders.length}>
        <Input placeholder="Поиск по названию, городу, имени..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Заявок нет" /> : (
          <div className="space-y-2">
            {list.map((o) => (
              <div key={String(o.id)} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">#{String(o.id)} {String(o.title)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[String(o.status)] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[String(o.status)] || String(o.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{String(o.description)}</p>
                    <div className="flex gap-3 flex-wrap text-xs text-gray-400">
                      <span>{String(o.category)}</span>
                      <span>{String(o.city)}</span>
                      {o.budget && <span className="text-green-600 font-medium">до {Number(o.budget).toLocaleString("ru")} ₽</span>}
                      <span>{String(o.contact_name)} · {String(o.contact_phone)}</span>
                      <span>{fmtDate(String(o.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-col items-end">
                    <select
                      value={String(o.status)}
                      onChange={e => onUpdateOrderStatus(Number(o.id), e.target.value)}
                      className="text-xs border rounded px-2 py-1 text-gray-600 bg-white"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                      onClick={() => onDeleteOrder(Number(o.id))}>
                      <Icon name="Trash2" size={12} className="mr-1" />Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ОТКЛИКИ ──
  if (tab === "responses") {
    if (loading) return <Loader />;
    const list = responses.filter(r =>
      !q || String(r.master_name).toLowerCase().includes(q) || String(r.order_title).toLowerCase().includes(q)
    );
    return (
      <Section title="Отклики мастеров на заявки" count={responses.length}>
        <Input placeholder="Поиск по мастеру или заявке..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Откликов нет" /> : (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={String(r.id)} className={`bg-white rounded-xl border p-4 ${r.accepted_response_id === r.id ? "border-green-200 bg-green-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-800">{String(r.master_name)}</span>
                      <span className="text-xs text-purple-600">{String(r.master_category)}</span>
                      {r.accepted_response_id === r.id && <Badge className="bg-green-100 text-green-700 text-[10px]">Принят</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Заявка: <b>{String(r.order_title)}</b> · {String(r.order_city)}</p>
                    {r.message && <p className="text-xs text-gray-400 line-clamp-2">«{String(r.message)}»</p>}
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{String(r.master_phone)}</span>
                      <span>{fmtDate(String(r.created_at))}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={() => onDeleteResponse(Number(r.id))}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ОБЪЯВЛЕНИЯ (УСЛУГИ МАСТЕРОВ) ──
  if (tab === "services") {
    if (loading) return <Loader />;
    const list = services.filter(s =>
      !q || String(s.title).toLowerCase().includes(q) || String(s.master_name).toLowerCase().includes(q) || String(s.city).toLowerCase().includes(q)
    );
    return (
      <Section title="Объявления мастеров" count={services.length}>
        <Input placeholder="Поиск по названию, мастеру, городу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Объявлений нет" /> : (
          <div className="space-y-2">
            {list.map((s) => (
              <div key={String(s.id)} className={`bg-white rounded-xl border p-4 ${!s.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-800">{String(s.title)}</span>
                      {s.is_active ? <Badge className="bg-green-100 text-green-700 text-[10px]">Активно</Badge>
                        : <Badge className="bg-gray-100 text-gray-500 text-[10px]">Неактивно</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Мастер: <b>{String(s.master_name)}</b> · {String(s.master_phone)}</p>
                    {s.description && <p className="text-xs text-gray-400 line-clamp-1">«{String(s.description)}»</p>}
                    <div className="flex gap-3 mt-1 flex-wrap text-xs text-gray-400">
                      <span>{String(s.category)}</span>
                      <span>{String(s.city)}</span>
                      {s.price && <span className="text-green-600">от {Number(s.price).toLocaleString("ru")} ₽</span>}
                      <span>{fmtDate(String(s.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${s.is_active ? "text-amber-600" : "text-green-600"}`}
                      onClick={() => onToggleService(Number(s.id), !s.is_active)}>
                      <Icon name={s.is_active ? "EyeOff" : "Eye"} size={12} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                      onClick={() => onDeleteService(Number(s.id))}>
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ПЕРЕПИСКИ ──
  if (tab === "chats") {
    if (loading) return <Loader />;
    const list = chats.filter(c =>
      !q || String(c.master_name).toLowerCase().includes(q) || String(c.contact_name).toLowerCase().includes(q)
    );
    return (
      <Section title="Переписки (мастер — заказчик)" count={chats.length}>
        <Input placeholder="Поиск по мастеру или заказчику..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        <div className="flex gap-4">
          {/* Список переписок */}
          <div className="flex-1 min-w-0 space-y-2">
            {list.length === 0 ? <Empty text="Переписок нет" /> : list.map((c) => (
              <div key={String(c.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${activeChatId === Number(c.id) ? "border-purple-400 bg-purple-50/30" : "hover:border-gray-300"}`}
                onClick={() => onViewChat(Number(c.id))}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-gray-800">{String(c.contact_name)}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-xs text-purple-700 font-medium">{String(c.master_name)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${DEAL_COLORS[String(c.deal_status)] || "bg-gray-100 text-gray-500"}`}>
                        {DEAL_LABELS[String(c.deal_status)] || String(c.deal_status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">«{String(c.message)}»</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{Number(c.messages_count)} сообщ.</span>
                      <span>{fmtDate(String(c.created_at))}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); onDeleteChat(Number(c.id)); }}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Просмотр сообщений */}
          {activeChatId && (
            <div className="w-80 flex-shrink-0 bg-white border rounded-xl p-4 flex flex-col max-h-[600px]">
              <p className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="MessageSquare" size={14} className="text-purple-500" /> Сообщения
              </p>
              <div className="flex-1 overflow-y-auto space-y-2">
                {chatMessages.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-4">Нет сообщений</p>
                  : chatMessages.map((m) => (
                    <div key={String(m.id)} className={`flex flex-col ${m.sender_role === "master" ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-gray-400 mb-0.5">{String(m.sender_name)}</span>
                      <div className={`px-3 py-1.5 rounded-xl text-xs max-w-[90%] ${m.sender_role === "master" ? "bg-purple-100 text-purple-900" : "bg-gray-100 text-gray-800"}`}>
                        {String(m.text)}
                      </div>
                      <span className="text-[9px] text-gray-300 mt-0.5">{fmt(String(m.created_at))}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </Section>
    );
  }

  // ── ПЛАТЕЖИ ──
  if (tab === "payments") {
    if (loading) return <Loader />;
    const list = payments.filter(p =>
      !q || String(p.master_name).toLowerCase().includes(q) || String(p.master_phone).includes(q)
    );
    const total = payments.filter(p => p.status === "succeeded").reduce((s, p) => s + Number(p.amount), 0);
    return (
      <Section title="Платежи" count={payments.length}>
        <div className="mb-4 flex items-center gap-4">
          <Input placeholder="Поиск по мастеру..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <span className="text-xs text-green-600">Выручка: </span>
            <span className="font-bold text-green-700">{total.toLocaleString("ru")} ₽</span>
          </div>
        </div>
        {list.length === 0 ? <Empty text="Платежей нет" /> : (
          <div className="space-y-2">
            {list.map((p) => (
              <div key={String(p.id)} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "succeeded" ? "bg-green-500" : p.status === "pending" ? "bg-yellow-400" : "bg-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-gray-800">{String(p.master_name)}</span>
                    <span className="text-xs text-gray-400">{String(p.master_phone)}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                    <span>{String(p.package_name || "—")}</span>
                    <span>{p.tokens_count ? `+${Number(p.tokens_count)} токенов` : ""}</span>
                    <span>{fmtDate(String(p.created_at))}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-800">{Number(p.amount).toLocaleString("ru")} ₽</p>
                  <p className={`text-xs ${p.status === "succeeded" ? "text-green-600" : p.status === "pending" ? "text-yellow-600" : "text-red-500"}`}>
                    {p.status === "succeeded" ? "Оплачен" : p.status === "pending" ? "Ожидание" : "Отменён"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ОТЗЫВЫ ──
  if (tab === "reviews") {
    if (loading) return <Loader />;
    const list = reviews.filter(r =>
      !q || String(r.master_name).toLowerCase().includes(q)
    );
    return (
      <Section title="Отзывы" count={reviews.length}>
        <Input placeholder="Поиск по мастеру..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Отзывов нет" /> : (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={String(r.id)} className="bg-white rounded-xl border p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-800">{String(r.master_name)}</span>
                    <span className="text-amber-500 text-sm">{"★".repeat(Number(r.rating))}{"☆".repeat(5 - Number(r.rating))}</span>
                    <span className="text-xs text-gray-400">{fmtDate(String(r.created_at))}</span>
                  </div>
                  {r.text && <p className="text-xs text-gray-500">«{String(r.text)}»</p>}
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                  onClick={() => onDeleteReview(Number(r.id))}>
                  <Icon name="Trash2" size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── КАТЕГОРИИ ──
  if (tab === "categories") {
    if (loading) return <Loader />;
    return (
      <Section title="Категории услуг" count={categories.length}>
        <div className="flex gap-2 mb-6 max-w-md">
          <Input placeholder="Новая категория..." value={newCategory} onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAddCategory()} />
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={onAddCategory}>Добавить</Button>
        </div>
        {categories.length === 0 ? <Empty text="Категорий нет" /> : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div key={String(c.id)} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">{String(c.name)}</span>
                <button onClick={() => onDeleteCategory(Number(c.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  return null;
}
