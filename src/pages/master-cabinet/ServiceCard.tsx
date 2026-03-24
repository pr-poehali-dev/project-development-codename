import Icon from "@/components/ui/icon";

interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

interface ServiceCardProps {
  service: MyService;
  onEdit: (s: MyService) => void;
  onDelete: (id: number) => void;
  onBoost: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
  onRenew: (id: number) => void;
}

export default function ServiceCard({ service: s, onEdit, onDelete, onBoost, onToggle, onRenew }: ServiceCardProps) {
  const now = new Date();
  const paidUntilDate = s.paid_until ? new Date(s.paid_until) : null;
  const isPaid = paidUntilDate && paidUntilDate > now;
  const isBoosted = s.boosted_until && new Date(s.boosted_until) > now;
  const daysLeft = paidUntilDate ? Math.ceil((paidUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <div className={`bg-white/4 border rounded-xl p-4 ${isBoosted ? "border-amber-500/30" : isExpiringSoon ? "border-orange-500/40" : s.is_active ? "border-white/8" : "border-white/4 opacity-60"}`}>
      {isExpiringSoon && !isExpired && (
        <div className="flex items-center gap-2 text-orange-400 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-3">
          <Icon name="Clock" size={13} />
          <span>Объявление истекает через <strong>{daysLeft === 0 ? "менее суток" : `${daysLeft} дн.`}</strong> — продлите, чтобы не пропасть из поиска</span>
        </div>
      )}
      {isExpired && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
          <Icon name="AlertCircle" size={13} />
          <span>Объявление истекло и скрыто из поиска — продлите для повторной публикации</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-white font-medium text-sm">{s.title}</p>
            {isBoosted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Icon name="TrendingUp" size={9} />В топе
              </span>
            )}
          </div>
          {s.subcategories?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {s.subcategories.map(sub => (
                <span key={sub} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-500/20">{sub}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-gray-500 text-xs">{s.category}</span>
            <span className="text-gray-600 text-xs flex items-center gap-1">
              <Icon name="MapPin" size={10} />{s.city}
            </span>
            {s.price && <span className="text-emerald-400 text-xs">от {s.price.toLocaleString("ru-RU")} ₽</span>}
            {isPaid && paidUntilDate && (
              <span className={`text-xs ${isExpiringSoon ? "text-orange-400 font-medium" : "text-violet-400"}`}>
                до {paidUntilDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          {s.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{s.description}</p>}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(s)}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-white/8 text-gray-300 border-white/10 hover:bg-white/15 transition-colors flex items-center gap-1"
          >
            <Icon name="Pencil" size={11} />Изменить
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-red-600/10 text-red-400 border-red-500/20 hover:bg-red-600/20 transition-colors flex items-center gap-1"
          >
            <Icon name="Trash2" size={11} />Удалить
          </button>
          <button
            onClick={() => onRenew(s.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-violet-600/15 text-violet-400 border-violet-500/20 hover:bg-violet-600/25 transition-colors flex items-center gap-1"
          >
            <Icon name="RefreshCw" size={11} />Продлить
          </button>
          <button
            onClick={() => onBoost(s.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-amber-600/15 text-amber-400 border-amber-500/20 hover:bg-amber-600/25 transition-colors flex items-center gap-1"
          >
            <Icon name="TrendingUp" size={11} />В топ
          </button>
          <button
            onClick={() => onToggle(s.id, !s.is_active)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              s.is_active
                ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20 hover:bg-red-600/15 hover:text-red-400 hover:border-red-500/20"
                : "bg-gray-600/15 text-gray-400 border-gray-500/20 hover:bg-emerald-600/15 hover:text-emerald-400 hover:border-emerald-500/20"
            }`}
          >
            {s.is_active ? "Скрыть" : "Показать"}
          </button>
        </div>
      </div>
    </div>
  );
}