import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Section, Loader, Empty, FilterBar } from "./AdminShared";
import { fmtDate, toCSV, downloadCSV } from "./adminUtils";

const DONATIONS_URL = "https://functions.poehali.dev/64a0e43a-4d64-4be5-bc69-90e6d3138e97";

interface Donation {
  id: number;
  amount: number;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  status: string;
  yookassa_payment_id: string | null;
  created_at: string | null;
  succeeded_at: string | null;
}

interface DonationsTabProps {
  token: string;
}

export default function DonationsTab({ token }: DonationsTabProps) {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "succeeded" | "pending">("all");

  useEffect(() => {
    setLoading(true);
    fetch(`${DONATIONS_URL}?action=list`, {
      headers: { "X-Admin-Token": token },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setDonations(d.donations || []);
        setTotal(d.total || 0);
        setCount(d.count || 0);
      })
      .catch(() => setError("Не удалось загрузить пожертвования"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <Section title="Пожертвования" count={0}>
        <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-4">{error}</div>
      </Section>
    );
  }

  const q = searchQuery.toLowerCase();
  const filtered = donations.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (dateFrom && d.created_at && new Date(d.created_at) < new Date(dateFrom)) return false;
    if (dateTo && d.created_at && new Date(d.created_at) > new Date(dateTo + "T23:59:59")) return false;
    if (!q) return true;
    return (
      (d.donor_name || "").toLowerCase().includes(q) ||
      (d.donor_email || "").toLowerCase().includes(q) ||
      (d.message || "").toLowerCase().includes(q)
    );
  });

  const exportCols = [
    { key: "id", label: "ID" },
    { key: "amount", label: "Сумма" },
    { key: "donor_name", label: "Имя" },
    { key: "donor_email", label: "Email" },
    { key: "message", label: "Сообщение" },
    { key: "status", label: "Статус" },
    { key: "created_at", label: "Создано" },
    { key: "succeeded_at", label: "Оплачено" },
  ];

  return (
    <Section title="Пожертвования" count={filtered.length}>
      {/* Сводка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Heart" size={14} className="text-pink-500" />
            <p className="text-gray-600 text-xs">Всего получено</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{total.toLocaleString("ru-RU")} ₽</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Users" size={14} className="text-gray-400" />
            <p className="text-gray-600 text-xs">Поддержали</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="TrendingUp" size={14} className="text-gray-400" />
            <p className="text-gray-600 text-xs">Средняя сумма</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {count > 0 ? Math.round(total / count).toLocaleString("ru-RU") : 0} ₽
          </p>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Имя, email или текст пожелания..."
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onExport={() => downloadCSV(toCSV(filtered, exportCols), `donations_${new Date().toISOString().slice(0, 10)}.csv`)}
        exportLabel="Экспорт CSV"
        filteredCount={filtered.length}
        totalCount={donations.length}
      />

      {/* Фильтр статуса */}
      <div className="flex gap-2 mb-4">
        {(["all", "succeeded", "pending"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "Все" : s === "succeeded" ? "Оплачено" : "В ожидании"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty text="Пожертвований пока нет" />
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-bold text-gray-800 text-lg">
                      {d.amount.toLocaleString("ru-RU")} ₽
                    </span>
                    {d.status === "succeeded" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        Оплачено
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        В ожидании
                      </span>
                    )}
                    <span className="text-xs text-gray-400">#{d.id}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    {d.donor_name ? (
                      <span className="font-medium">{d.donor_name}</span>
                    ) : (
                      <span className="text-gray-400 italic">Анонимно</span>
                    )}
                    {d.donor_email && (
                      <span className="text-gray-500 ml-2 text-xs">{d.donor_email}</span>
                    )}
                  </div>
                  {d.message && (
                    <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mt-2 text-sm text-gray-700 italic">
                      «{d.message}»
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  <div>{fmtDate(d.created_at || "")}</div>
                  {d.succeeded_at && (
                    <div className="text-emerald-600 mt-0.5">
                      Оплачено: {fmtDate(d.succeeded_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
