import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import type { Tab } from "./AdminSidebar";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { DashboardTab, MastersTab, CustomersTab } from "./AdminTabUsers";
import {
  STATUS_LABELS, STATUS_COLORS, DEAL_LABELS, DEAL_COLORS,
  fmt, fmtDate, toCSV, downloadCSV, useDateFilter,
} from "./adminUtils";

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
  onEditService: (s: Record<string, unknown>) => void;
  onDeleteService: (id: number) => void;
  onToggleService: (id: number, active: boolean) => void;
  onDeleteChat: (id: number) => void;
  onViewChat: (id: number) => void;
  onDeleteResponse: (id: number) => void;
  tickets: Record<string, unknown>[];
  onReplyTicket: (id: number, reply: string) => void;
  onDeleteTicket: (id: number) => void;
}

export default function AdminTabContent({
  tab, loading, dashboard, masters, customers, orders, reviews, categories,
  services, chats, chatMessages, activeChatId, responses, payments,
  newCategory, setNewCategory, searchQuery, setSearchQuery,
  onOpenEdit, onOpenBalance, onBlockMaster, onBlockCustomer, onDeleteMaster, onDeleteCustomer,
  onUpdateOrderStatus, onDeleteOrder, onDeleteReview, onAddCategory, onDeleteCategory,
  onEditService, onDeleteService, onToggleService, onDeleteChat, onViewChat, onDeleteResponse,
  tickets, onReplyTicket, onDeleteTicket,
}: AdminTabContentProps) {

  const q = searchQuery.toLowerCase();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const mastersDf = useDateFilter(masters, "created_at", dateFrom, dateTo);
  const customersDf = useDateFilter(customers, "created_at", dateFrom, dateTo);
  const ordersDf = useDateFilter(orders, "created_at", dateFrom, dateTo);
  const reviewsDf = useDateFilter(reviews, "created_at", dateFrom, dateTo);
  const servicesDf = useDateFilter(services, "created_at", dateFrom, dateTo);
  const chatsDf = useDateFilter(chats, "created_at", dateFrom, dateTo);
  const responsesDf = useDateFilter(responses, "created_at", dateFrom, dateTo);
  const paymentsDf = useDateFilter(payments, "created_at", dateFrom, dateTo);

  if (tab === "dashboard") {
    return <DashboardTab loading={loading} dashboard={dashboard} />;
  }

  if (tab === "masters") {
    return (
      <MastersTab
        loading={loading} masters={masters} mastersDf={mastersDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onOpenEdit={onOpenEdit} onOpenBalance={onOpenBalance}
        onBlockMaster={onBlockMaster} onDeleteMaster={onDeleteMaster}
      />
    );
  }

  if (tab === "customers") {
    return (
      <CustomersTab
        loading={loading} customers={customers} customersDf={customersDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onOpenEdit={onOpenEdit} onBlockCustomer={onBlockCustomer} onDeleteCustomer={onDeleteCustomer}
      />
    );
  }

  // ── ЗАЯВКИ ──
  if (tab === "orders") {
    if (loading) return <Loader />;
    const list = ordersDf.filter(o =>
      !q || String(o.title).toLowerCase().includes(q) || String(o.contact_name).toLowerCase().includes(q) || String(o.city).toLowerCase().includes(q)
    );
    const exportCols = [
      { key: "id", label: "ID" }, { key: "title", label: "Название" }, { key: "description", label: "Описание" },
      { key: "category", label: "Категория" }, { key: "city", label: "Город" }, { key: "budget", label: "Бюджет" },
      { key: "contact_name", label: "Заказчик" }, { key: "contact_phone", label: "Телефон" },
      { key: "status", label: "Статус" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Заявки заказчиков" count={list.length}>
        <FilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Название, город, имя..."
          dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
          onExport={() => downloadCSV(toCSV(list, exportCols), `orders_${new Date().toISOString().slice(0,10)}.csv`)}
          exportLabel="Экспорт CSV"
          filteredCount={list.length} totalCount={orders.length}
        />
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
                      <span>{String(o.category)}</span><span>{String(o.city)}</span>
                      {o.budget && <span className="text-green-600 font-medium">до {Number(o.budget).toLocaleString("ru")} ₽</span>}
                      <span>{String(o.contact_name)} · {String(o.contact_phone)}</span>
                      <span>{fmtDate(String(o.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-col items-end">
                    <select value={String(o.status)} onChange={e => onUpdateOrderStatus(Number(o.id), e.target.value)}
                      className="text-xs border rounded px-2 py-1 text-gray-600 bg-white">
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
    const list = responsesDf.filter(r =>
      !q || String(r.master_name).toLowerCase().includes(q) || String(r.order_title).toLowerCase().includes(q)
    );
    const exportCols = [
      { key: "id", label: "ID" }, { key: "master_name", label: "Мастер" }, { key: "master_phone", label: "Телефон" },
      { key: "master_category", label: "Категория" }, { key: "order_title", label: "Заявка" },
      { key: "order_city", label: "Город" }, { key: "order_status", label: "Статус заявки" },
      { key: "message", label: "Сообщение" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Отклики мастеров на заявки" count={list.length}>
        <FilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Мастер или заявка..."
          dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
          onExport={() => downloadCSV(toCSV(list, exportCols), `responses_${new Date().toISOString().slice(0,10)}.csv`)}
          exportLabel="Экспорт CSV"
          filteredCount={list.length} totalCount={responses.length}
        />
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
                      <span>{String(r.master_phone)}</span><span>{fmtDate(String(r.created_at))}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                    onClick={() => onDeleteResponse(Number(r.id))}><Icon name="Trash2" size={12} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    );
  }

  // ── ОБЪЯВЛЕНИЯ ──
  if (tab === "services") {
    if (loading) return <Loader />;
    const list = servicesDf.filter(s =>
      !q || String(s.title).toLowerCase().includes(q) || String(s.master_name).toLowerCase().includes(q) || String(s.city).toLowerCase().includes(q)
    );
    const exportCols = [
      { key: "id", label: "ID" }, { key: "title", label: "Название" }, { key: "master_name", label: "Мастер" },
      { key: "master_phone", label: "Телефон" }, { key: "category", label: "Категория" },
      { key: "city", label: "Город" }, { key: "price", label: "Цена" },
      { key: "is_active", label: "Активно" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Объявления мастеров" count={list.length}>
        <FilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Название, мастер, город..."
          dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
          onExport={() => downloadCSV(toCSV(list, exportCols), `services_${new Date().toISOString().slice(0,10)}.csv`)}
          exportLabel="Экспорт CSV"
          filteredCount={list.length} totalCount={services.length}
        />
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
                      <span>{String(s.category)}</span><span>{String(s.city)}</span>
                      {s.price && <span className="text-green-600">от {Number(s.price).toLocaleString("ru")} ₽</span>}
                      <span>{fmtDate(String(s.created_at))}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                      onClick={() => onEditService(s)}><Icon name="Pencil" size={12} /></Button>
                    <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${s.is_active ? "text-amber-600" : "text-green-600"}`}
                      onClick={() => onToggleService(Number(s.id), !s.is_active)}>
                      <Icon name={s.is_active ? "EyeOff" : "Eye"} size={12} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                      onClick={() => onDeleteService(Number(s.id))}><Icon name="Trash2" size={12} /></Button>
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
    const list = chatsDf.filter(c =>
      !q || String(c.master_name).toLowerCase().includes(q) || String(c.contact_name).toLowerCase().includes(q)
    );
    const exportCols = [
      { key: "id", label: "ID" }, { key: "contact_name", label: "Заказчик" },
      { key: "contact_phone", label: "Телефон" }, { key: "contact_email", label: "Email" },
      { key: "master_name", label: "Мастер" }, { key: "master_phone", label: "Тел. мастера" },
      { key: "deal_status", label: "Статус" }, { key: "messages_count", label: "Сообщений" },
      { key: "message", label: "Первое сообщение" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Переписки (мастер — заказчик)" count={list.length}>
        <FilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Мастер или заказчик..."
          dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
          onExport={() => downloadCSV(toCSV(list, exportCols), `chats_${new Date().toISOString().slice(0,10)}.csv`)}
          exportLabel="Экспорт CSV"
          filteredCount={list.length} totalCount={chats.length}
        />
        <div className="flex gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {list.length === 0 ? <Empty text="Переписок нет" /> : list.map((c) => (
              <div key={String(c.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${activeChatId === Number(c.id) ? "border-purple-400 bg-purple-50/30" : "hover:border-gray-300"}`}
                onClick={() => onViewChat(Number(c.id))}>
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
    const list = paymentsDf.filter(p =>
      !q || String(p.master_name).toLowerCase().includes(q) || String(p.master_phone).includes(q)
    );
    const total = list.filter(p => p.status === "succeeded").reduce((s, p) => s + Number(p.amount), 0);
    const exportCols = [
      { key: "id", label: "ID" }, { key: "master_name", label: "Мастер" }, { key: "master_phone", label: "Телефон" },
      { key: "package_name", label: "Пакет" }, { key: "tokens_count", label: "Токены" },
      { key: "amount", label: "Сумма (₽)" }, { key: "status", label: "Статус" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Платежи" count={list.length}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Input placeholder="Мастер..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-52" />
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 whitespace-nowrap">с</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400" />
            <label className="text-xs text-gray-500">по</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400" />
          </div>
          {(searchQuery || dateFrom || dateTo) && (
            <button onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Icon name="X" size={13} /> Сбросить
            </button>
          )}
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-1.5">
            <span className="text-xs text-green-600">Выручка (фильтр): </span>
            <span className="font-bold text-green-700">{total.toLocaleString("ru")} ₽</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => downloadCSV(toCSV(list, exportCols), `payments_${new Date().toISOString().slice(0,10)}.csv`)}
            className="text-xs h-8 px-3 gap-1.5 text-green-700 border-green-300 hover:bg-green-50 ml-auto">
            <Icon name="Download" size={14} /> Экспорт CSV
          </Button>
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
    const list = reviewsDf.filter(r => !q || String(r.master_name).toLowerCase().includes(q));
    const exportCols = [
      { key: "id", label: "ID" }, { key: "master_name", label: "Мастер" },
      { key: "rating", label: "Оценка" }, { key: "text", label: "Текст" }, { key: "created_at", label: "Дата" },
    ];
    return (
      <Section title="Отзывы" count={list.length}>
        <FilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Мастер..."
          dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
          onExport={() => downloadCSV(toCSV(list, exportCols), `reviews_${new Date().toISOString().slice(0,10)}.csv`)}
          exportLabel="Экспорт CSV"
          filteredCount={list.length} totalCount={reviews.length}
        />
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
                  onClick={() => onDeleteReview(Number(r.id))}><Icon name="Trash2" size={12} /></Button>
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
          <Button size="sm" variant="outline" onClick={() => downloadCSV(toCSV(categories, [{ key: "id", label: "ID" }, { key: "name", label: "Название" }]), "categories.csv")}
            className="text-xs gap-1.5 text-green-700 border-green-300 hover:bg-green-50">
            <Icon name="Download" size={14} />
          </Button>
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

  // ── ТИКЕТЫ ПОДДЕРЖКИ ──
  if (tab === "tickets") {
    if (loading) return <Loader />;
    const SUBJECT_LABELS: Record<string, string> = {
      question: "Вопрос", complaint: "Жалоба", bug: "Техн. сбой", fraud: "Мошенничество", other: "Другое",
    };
    const list = tickets.filter(t =>
      !q || String(t.name).toLowerCase().includes(q) || String(t.email).toLowerCase().includes(q) || String(t.message).toLowerCase().includes(q)
    );
    const newCount = tickets.filter(t => t.status === "new").length;
    return (
      <Section title="Обращения в поддержку" count={list.length}>
        {newCount > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Icon name="Bell" size={15} className="text-amber-500" />
            <span className="text-amber-700 text-sm font-medium">{newCount} новых обращений без ответа</span>
          </div>
        )}
        <Input placeholder="Поиск по имени, email, тексту..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-4 max-w-sm" />
        {list.length === 0 ? <Empty text="Обращений нет" /> : (
          <div className="space-y-3">
            {list.map((t) => (
              <TicketCard key={String(t.id)} ticket={t} subjectLabels={SUBJECT_LABELS}
                onReply={onReplyTicket} onDelete={onDeleteTicket} fmtDate={fmtDate} />
            ))}
          </div>
        )}
      </Section>
    );
  }

  return null;
}

function TicketCard({ ticket, subjectLabels, onReply, onDelete, fmtDate }: {
  ticket: Record<string, unknown>;
  subjectLabels: Record<string, string>;
  onReply: (id: number, reply: string) => void;
  onDelete: (id: number) => void;
  fmtDate: (iso: string) => string;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(Number(ticket.id), replyText.trim());
    setReplyText("");
    setReplyOpen(false);
    setSending(false);
  };

  const isNew = ticket.status === "new";
  return (
    <div className={`bg-white rounded-xl border p-4 ${isNew ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-gray-800">{String(ticket.name || "Аноним")}</span>
            {ticket.email && <span className="text-xs text-gray-400">{String(ticket.email)}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              {subjectLabels[String(ticket.subject)] || String(ticket.subject)}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isNew ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
              {isNew ? "Новое" : "Отвечено"}
            </span>
            <span className="text-xs text-gray-400 ml-auto">{fmtDate(String(ticket.created_at))}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{String(ticket.message)}</p>
          {ticket.admin_reply && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                <Icon name="Reply" size={11} /> Ответ администратора:
              </p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{String(ticket.admin_reply)}</p>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-blue-600 hover:bg-blue-50"
            onClick={() => setReplyOpen(v => !v)}>
            <Icon name="Reply" size={12} className="mr-1" />Ответить
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
            onClick={() => onDelete(Number(ticket.id))}>
            <Icon name="Trash2" size={12} />
          </Button>
        </div>
      </div>
      {replyOpen && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <textarea
            rows={3}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Текст ответа пользователю..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              disabled={sending || !replyText.trim()} onClick={handleReply}>
              {sending ? "Отправка..." : "Отправить ответ на почту"}
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setReplyOpen(false)}>Отмена</Button>
          </div>
        </div>
      )}
    </div>
  );
}