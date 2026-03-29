import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { STATUS_LABELS, STATUS_COLORS, fmtDate, toCSV, downloadCSV } from "./adminUtils";

// ── ЗАЯВКИ ──

interface OrdersTabProps {
  loading: boolean;
  orders: Record<string, unknown>[];
  ordersDf: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onUpdateOrderStatus: (id: number, status: string) => void;
  onDeleteOrder: (id: number) => void;
}

export function OrdersTab({
  loading, orders, ordersDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onUpdateOrderStatus, onDeleteOrder,
}: OrdersTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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

interface ResponsesTabProps {
  loading: boolean;
  responses: Record<string, unknown>[];
  responsesDf: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onDeleteResponse: (id: number) => void;
}

export function ResponsesTab({
  loading, responses, responsesDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo, onDeleteResponse,
}: ResponsesTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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

interface ServicesTabProps {
  loading: boolean;
  services: Record<string, unknown>[];
  servicesDf: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onEditService: (s: Record<string, unknown>) => void;
  onDeleteService: (id: number) => void;
  onToggleService: (id: number, active: boolean) => void;
}

export function ServicesTab({
  loading, services, servicesDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onEditService, onDeleteService, onToggleService,
}: ServicesTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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
