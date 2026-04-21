import Icon from "@/components/ui/icon";
import { Review, formatDate } from "./masterPageTypes";

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? "text-amber-400" : "text-gray-700"}>★</span>
      ))}
    </span>
  );
}

interface MasterReviewsListProps {
  reviews: Review[];
  reviewsTotal: number;
}

export default function MasterReviewsList({ reviews, reviewsTotal }: MasterReviewsListProps) {
  return (
    <>
      <h2 className="text-lg font-semibold text-white mb-4">
        Отзывы
        {reviewsTotal > 0 && <span className="text-gray-500 font-normal text-sm ml-2">{reviewsTotal}</span>}
      </h2>

      {reviews.length === 0 ? (
        <div className="bg-white/4 border border-white/8 rounded-2xl p-8 text-center">
          <Icon name="Star" size={28} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Отзывов пока нет</p>
          <p className="text-gray-600 text-sm mt-1">Станьте первым заказчиком этого мастера</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white/4 border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <StarRating value={r.rating} />
                <span className="text-gray-600 text-xs">{formatDate(r.created_at)}</span>
              </div>
              {r.order_title && <p className="text-gray-500 text-xs mb-1.5">Заявка: {r.order_title}</p>}
              {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="/orders" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          ← Смотреть все заявки
        </a>
      </div>
    </>
  );
}
