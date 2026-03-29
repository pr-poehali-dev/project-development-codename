import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { fmtDate, toCSV, downloadCSV } from "./adminUtils";

// ── DASHBOARD ──

interface DashboardTabProps {
  loading: boolean;
  dashboard: Record<string, number> | null;
}

export function DashboardTab({ loading, dashboard }: DashboardTabProps) {
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

interface MastersTabProps {
  loading: boolean;
  masters: Record<string, unknown>[];
  mastersDf: Record<string, unknown>[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onOpenEdit: (type: "master" | "customer", data: Record<string, unknown>) => void;
  onOpenBalance: (m: Record<string, unknown>) => void;
  onBlockMaster: (id: number, block: boolean) => void;
  onDeleteMaster: (id: number) => void;
}

export function MastersTab({
  loading, masters, mastersDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onOpenEdit, onOpenBalance, onBlockMaster, onDeleteMaster,
}: MastersTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
  const list = mastersDf.filter(m =>
    !q || String(m.name).toLowerCase().includes(q) || String(m.phone).includes(q) || String(m.email).toLowerCase().includes(q)
  );
  const exportCols = [
    { key: "id", label: "ID" }, { key: "name", label: "Имя" }, { key: "phone", label: "Телефон" },
    { key: "email", label: "Email" }, { key: "city", label: "Город" }, { key: "category", label: "Категория" },
    { key: "balance", label: "Токены" }, { key: "reviews_count", label: "Отзывов" },
    { key: "avg_rating", label: "Рейтинг" }, { key: "is_blocked", label: "Заблокирован" },
    { key: "created_at", label: "Дата регистрации" },
  ];
  return (
    <Section title="Мастера" count={list.length}>
      <FilterBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Имя, телефон, email..."
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => downloadCSV(toCSV(list, exportCols), `masters_${new Date().toISOString().slice(0,10)}.csv`)}
        exportLabel="Экспорт CSV"
        filteredCount={list.length} totalCount={masters.length}
      />
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
                <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenEdit("master", m)}><Icon name="Pencil" size={12} /></Button>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenBalance(m)}><Icon name="Coins" size={12} /></Button>
                <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${m.is_blocked ? "text-green-600" : "text-amber-600"}`}
                  onClick={() => onBlockMaster(Number(m.id), !m.is_blocked)}>
                  <Icon name={m.is_blocked ? "Unlock" : "Lock"} size={12} />
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteMaster(Number(m.id))}><Icon name="Trash2" size={12} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── ЗАКАЗЧИКИ ──

interface CustomersTabProps {
  loading: boolean;
  customers: Record<string, unknown>[];
  customersDf: Record<string, unknown>[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onOpenEdit: (type: "master" | "customer", data: Record<string, unknown>) => void;
  onBlockCustomer: (id: number, block: boolean) => void;
  onDeleteCustomer: (id: number) => void;
}

export function CustomersTab({
  loading, customers, customersDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onOpenEdit, onBlockCustomer, onDeleteCustomer,
}: CustomersTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
  const list = customersDf.filter(c =>
    !q || String(c.name).toLowerCase().includes(q) || String(c.phone).includes(q) || String(c.email).toLowerCase().includes(q)
  );
  const exportCols = [
    { key: "id", label: "ID" }, { key: "name", label: "Имя" }, { key: "phone", label: "Телефон" },
    { key: "email", label: "Email" }, { key: "is_blocked", label: "Заблокирован" }, { key: "created_at", label: "Дата" },
  ];
  return (
    <Section title="Заказчики" count={list.length}>
      <FilterBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Имя, телефон, email..."
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => downloadCSV(toCSV(list, exportCols), `customers_${new Date().toISOString().slice(0,10)}.csv`)}
        exportLabel="Экспорт CSV"
        filteredCount={list.length} totalCount={customers.length}
      />
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
                <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onOpenEdit("customer", c)}><Icon name="Pencil" size={12} /></Button>
                <Button size="sm" variant="outline" className={`text-xs h-7 px-2 ${c.is_blocked ? "text-green-600" : "text-amber-600"}`}
                  onClick={() => onBlockCustomer(Number(c.id), !c.is_blocked)}>
                  <Icon name={c.is_blocked ? "Unlock" : "Lock"} size={12} />
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteCustomer(Number(c.id))}><Icon name="Trash2" size={12} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
