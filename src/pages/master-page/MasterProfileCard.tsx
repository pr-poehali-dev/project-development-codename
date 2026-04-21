import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Master, formatDate } from "./masterPageTypes";

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? "text-amber-400" : "text-gray-700"}>★</span>
      ))}
    </span>
  );
}

interface MasterProfileCardProps {
  master: Master;
  rating: number | null;
  reviewsTotal: number;
}

export default function MasterProfileCard({ master, rating, reviewsTotal }: MasterProfileCardProps) {
  const initials = master.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${master.avatar_color || "#7c3aed"}, #4f46e5)` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-1">{master.name}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            {(master.categories?.length ? master.categories : master.category ? [master.category] : []).map((cat) => (
              <Badge key={cat} className="bg-violet-600/15 text-violet-400 border-violet-500/20 text-xs">{cat}</Badge>
            ))}
            {master.city && (
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <Icon name="MapPin" size={13} />{master.city}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {rating !== null ? (
              <div className="flex items-center gap-2">
                <StarRating value={rating} />
                <span className="text-white font-semibold">{rating}</span>
                <span className="text-gray-500 text-sm">({reviewsTotal} {reviewsTotal === 1 ? "отзыв" : reviewsTotal < 5 ? "отзыва" : "отзывов"})</span>
              </div>
            ) : (
              <span className="text-gray-500 text-sm">Отзывов пока нет</span>
            )}
            {master.responses_count ? (
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Icon name="Zap" size={13} className="text-violet-400" />
                {master.responses_count} откликов
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {master.about && (
        <p className="text-gray-300 text-sm leading-relaxed mt-5 pt-5 border-t border-white/8">{master.about}</p>
      )}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
        <Icon name="Calendar" size={13} className="text-gray-600" />
        <span className="text-gray-600 text-xs">На платформе с {master.created_at ? formatDate(master.created_at) : "—"}</span>
      </div>
    </div>
  );
}
