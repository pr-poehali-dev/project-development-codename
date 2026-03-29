import { useMemo } from "react";

export const STATUS_LABELS: Record<string, string> = {
  new: "Новая", in_progress: "В работе", done: "Завершена", cancelled: "Отменена",
};
export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
};
export const DEAL_LABELS: Record<string, string> = {
  pending: "В процессе", deal: "Договорились", no_deal: "Не договорились",
};
export const DEAL_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600", deal: "bg-green-100 text-green-700", no_deal: "bg-red-100 text-red-700",
};

export function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function toCSV(rows: Record<string, unknown>[], cols: { key: string; label: string }[]): string {
  const header = cols.map(c => `"${c.label}"`).join(";");
  const body = rows.map(row =>
    cols.map(c => {
      const v = row[c.key];
      if (v === null || v === undefined) return "";
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(";")
  ).join("\n");
  return "\uFEFF" + header + "\n" + body;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function useDateFilter<T extends Record<string, unknown>>(
  items: T[],
  dateKey: string,
  dateFrom: string,
  dateTo: string
): T[] {
  return useMemo(() => {
    if (!dateFrom && !dateTo) return items;
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Infinity;
    return items.filter(item => {
      const d = new Date(String(item[dateKey] || "")).getTime();
      return d >= from && d <= to;
    });
  }, [items, dateKey, dateFrom, dateTo]);
}
