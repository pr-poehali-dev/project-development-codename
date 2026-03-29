import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

export function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
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

export function Loader() {
  return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
}

export function Empty({ text }: { text: string }) {
  return <div className="text-center py-16 text-gray-400">{text}</div>;
}

export function FilterBar({
  searchQuery, setSearchQuery, searchPlaceholder,
  dateFrom, setDateFrom, dateTo, setDateTo,
  onExport, exportLabel,
  filteredCount, totalCount,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void; searchPlaceholder: string;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onExport: () => void; exportLabel: string;
  filteredCount: number; totalCount: number;
}) {
  const hasFilter = searchQuery || dateFrom || dateTo;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Input
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-52"
      />
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-500 whitespace-nowrap">с</label>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400" />
        <label className="text-xs text-gray-500">по</label>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400" />
      </div>
      {hasFilter && (
        <button onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); }}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <Icon name="X" size={13} /> Сбросить
        </button>
      )}
      <div className="ml-auto flex items-center gap-3">
        {hasFilter && filteredCount !== totalCount && (
          <span className="text-xs text-gray-400">Показано: {filteredCount} из {totalCount}</span>
        )}
        <Button size="sm" variant="outline" onClick={onExport}
          className="text-xs h-8 px-3 gap-1.5 text-green-700 border-green-300 hover:bg-green-50">
          <Icon name="Download" size={14} /> {exportLabel}
        </Button>
      </div>
    </div>
  );
}
