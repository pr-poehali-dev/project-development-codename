import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Master {
  id: number;
  name: string;
  category: string;
  categories: string[];
  city: string;
  about: string | null;
  avatar_color: string;
  responses_count: number;
  created_at: string;
}

interface Service {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  city: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  order_title: string;
  created_at: string;
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(value) ? "text-amber-400" : "text-gray-700"}>★</span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function MasterPage() {
  const [master, setMaster] = useState<Master | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const masterId = new URLSearchParams(window.location.search).get("id");
    if (!masterId) { setNotFound(true); setLoading(false); return; }

    fetch(`${PROFILE_URL}?master_id=${masterId}`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.error) { setNotFound(true); return; }
        setMaster(parsed.master);
        setRating(parsed.rating);
        setReviewsTotal(parsed.reviews_total);
        setReviews(parsed.reviews || []);
        setServices(parsed.services || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Мастер не найден</p>
        <a href="/" className="text-violet-400 hover:text-violet-300">← На главную</a>
      </div>
    </div>
  );

  const initials = master?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      {/* Шапка */}
      <div className="border-b border-white/8 bg-[#0a0d16]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/orders" className="text-gray-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </a>
          <a href="/" className="flex items-center gap-2">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Карточка мастера */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${master?.avatar_color || "#7c3aed"}, #4f46e5)` }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1">{master?.name}</h1>
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {(master?.categories?.length ? master.categories : master?.category ? [master.category] : []).map((cat) => (
                  <Badge key={cat} className="bg-violet-600/15 text-violet-400 border-violet-500/20 text-xs">{cat}</Badge>
                ))}
                {master?.city && (
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
                {master?.responses_count ? (
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Icon name="Zap" size={13} className="text-violet-400" />
                    {master.responses_count} откликов
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {master?.about && (
            <p className="text-gray-300 text-sm leading-relaxed mt-5 pt-5 border-t border-white/8">{master.about}</p>
          )}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
            <Icon name="Calendar" size={13} className="text-gray-600" />
            <span className="text-gray-600 text-xs">На платформе с {master?.created_at ? formatDate(master.created_at) : "—"}</span>
          </div>
        </div>

        {/* Услуги */}
        {services.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Услуги</h2>
            <div className="grid gap-3 sm:grid-cols-2 mb-8">
              {services.map((s) => (
                <div key={s.id} className="bg-white/4 border border-white/8 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium text-sm leading-snug">{s.title}</p>
                    {s.price && (
                      <span className="text-emerald-400 text-sm font-semibold whitespace-nowrap">от {s.price.toLocaleString("ru-RU")} ₽</span>
                    )}
                  </div>
                  {s.description && <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{s.description}</p>}
                  <div className="flex items-center gap-2 mt-auto pt-1">
                    <Badge className="bg-violet-600/15 text-violet-400 border-violet-500/20 text-xs">{s.category}</Badge>
                    {s.city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10} />{s.city}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Кнопка — оставить заявку */}
        <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Нужна помощь {master?.name?.split(" ")[0]}?</p>
            <p className="text-gray-400 text-sm mt-0.5">Оставьте заявку — мастер откликнется в ближайшее время</p>
          </div>
          <a href="/" className="flex-shrink-0">
            <button className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
              Создать заявку
            </button>
          </a>
        </div>

        {/* Отзывы */}
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
      </div>
    </div>
  );
}