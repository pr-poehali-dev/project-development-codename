import Icon from "@/components/ui/icon";
import { Master } from "./types";
import { highlightMatch } from "./highlightMatch";

function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Icon name="Star" size={12} />
      {rating.toFixed(1)}
    </span>
  );
}

interface MastersGridProps {
  shown: Master[];
  search?: string;
}

export default function MastersGrid({ shown, search = "" }: MastersGridProps) {
  if (shown.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Icon name="Users" size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-400 text-lg mb-2">Мастера не найдены</p>
        <p className="text-gray-600 text-sm">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {shown.map(m => (
        <a
          key={m.id}
          href={`/master-page?id=${m.id}`}
          className="group bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <Avatar name={m.name} color={m.avatar_color} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm truncate">{highlightMatch(m.name, search)}</span>
                <StarRating rating={m.rating} />
              </div>
              {(m.categories.length > 0 || m.category) && (
                <p className="text-violet-400 text-xs mt-0.5 truncate">
                  {highlightMatch(m.categories.length > 0 ? m.categories.slice(0, 2).join(", ") : m.category, search)}
                </p>
              )}
              {m.city && (
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <Icon name="MapPin" size={11} />
                  {m.city}
                </div>
              )}
            </div>
          </div>

          {m.about && (
            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{highlightMatch(m.about, search)}</p>
          )}

          <div className="flex items-center gap-3 mt-auto pt-1 border-t border-white/6 text-xs text-gray-500">
            {m.reviews_count > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="MessageSquare" size={11} />
                {m.reviews_count} отзыв{m.reviews_count === 1 ? "" : m.reviews_count <= 4 ? "а" : "ов"}
              </span>
            )}
            {m.services_count > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="Briefcase" size={11} />
                {m.services_count} услуг{m.services_count === 1 ? "а" : m.services_count <= 4 ? "и" : ""}
              </span>
            )}
            <span className="ml-auto text-violet-400 group-hover:text-violet-300 transition-colors flex items-center gap-1">
              Профиль <Icon name="ArrowRight" size={11} />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}