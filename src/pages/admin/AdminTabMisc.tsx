import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { fmtDate, toCSV, downloadCSV } from "./adminUtils";

// ── ОТЗЫВЫ ──

interface ReviewsTabProps {
  loading: boolean;
  reviews: Record<string, unknown>[];
  reviewsDf: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onDeleteReview: (id: number) => void;
}

export function ReviewsTab({
  loading, reviews, reviewsDf, searchQuery, setSearchQuery,
  dateFrom, setDateFrom, dateTo, setDateTo, onDeleteReview,
}: ReviewsTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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

interface CategoriesTabProps {
  loading: boolean;
  categories: Record<string, unknown>[];
  newCategory: string;
  setNewCategory: (v: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number) => void;
}

export function CategoriesTab({
  loading, categories, newCategory, setNewCategory, onAddCategory, onDeleteCategory,
}: CategoriesTabProps) {
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

interface TicketsTabProps {
  loading: boolean;
  tickets: Record<string, unknown>[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  onReplyTicket: (id: number, reply: string) => void;
  onDeleteTicket: (id: number) => void;
}

const SUBJECT_LABELS: Record<string, string> = {
  question: "Вопрос", complaint: "Жалоба", bug: "Техн. сбой", fraud: "Мошенничество", other: "Другое",
};

export function TicketsTab({
  loading, tickets, searchQuery, setSearchQuery, onReplyTicket, onDeleteTicket,
}: TicketsTabProps) {
  if (loading) return <Loader />;
  const q = searchQuery.toLowerCase();
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
            <TicketCard key={String(t.id)} ticket={t}
              onReply={onReplyTicket} onDelete={onDeleteTicket} />
          ))}
        </div>
      )}
    </Section>
  );
}

function TicketCard({ ticket, onReply, onDelete }: {
  ticket: Record<string, unknown>;
  onReply: (id: number, reply: string) => void;
  onDelete: (id: number) => void;
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
              {SUBJECT_LABELS[String(ticket.subject)] || String(ticket.subject)}
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
