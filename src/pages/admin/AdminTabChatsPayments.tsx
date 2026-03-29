import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { DEAL_LABELS, DEAL_COLORS, fmt, fmtDate, toCSV, downloadCSV } from "./adminUtils";

// ── ПЕРЕПИСКИ ──

interface ChatsTabProps {
  loading: boolean;
  chats: Record<string, unknown>[];
  chatsDf: Record<string, unknown>[];
  chatMessages: Record<string, unknown>[];
  activeChatId: number | null;
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onDeleteChat: (id: number) => void;
  onViewChat: (id: number) => void;
}

export function ChatsTab({
  loading, chats, chatsDf, chatMessages, activeChatId,
  searchQuery, setSearchQuery, dateFrom, setDateFrom, dateTo, setDateTo,
  onDeleteChat, onViewChat,
}: ChatsTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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

interface PaymentsTabProps {
  loading: boolean;
  payments: Record<string, unknown>[];
  paymentsDf: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
}

export function PaymentsTab({
  loading, payments, paymentsDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo,
}: PaymentsTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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
