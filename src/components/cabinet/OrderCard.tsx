import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-600/15 text-blue-400 border-blue-500/20" },
  in_progress: { label: "В работе", color: "bg-amber-600/15 text-amber-400 border-amber-500/20" },
  done: { label: "Выполнена", color: "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Отменена", color: "bg-gray-600/15 text-gray-400 border-gray-500/20" },
};

const categoryColors: Record<string, string> = {
  "Авторемонт": "bg-blue-600/15 text-blue-400 border-blue-500/20",
  "Ремонт жилья": "bg-amber-600/15 text-amber-400 border-amber-500/20",
  "Строительство": "bg-orange-600/15 text-orange-400 border-orange-500/20",
  "Бьюти": "bg-pink-600/15 text-pink-400 border-pink-500/20",
  "IT-помощь": "bg-violet-600/15 text-violet-400 border-violet-500/20",
  "Сантехника": "bg-cyan-600/15 text-cyan-400 border-cyan-500/20",
  "Электрика": "bg-yellow-600/15 text-yellow-400 border-yellow-500/20",
  "Перевозки": "bg-red-600/15 text-red-400 border-red-500/20",
  "Няня": "bg-emerald-600/15 text-emerald-400 border-emerald-500/20",
  "Клининг": "bg-teal-600/15 text-teal-400 border-teal-500/20",
  "Прочее": "bg-gray-600/15 text-gray-400 border-gray-500/20",
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-xl transition-colors ${(hovered || value) >= star ? "text-amber-400" : "text-gray-600"} ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

interface Review {
  id: number;
  rating: number;
  comment: string;
}

interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  master_id: number | null;
  master_balance: number;
  message: string;
  created_at: string;
  review: Review | null;
}

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  status: string;
  accepted_response_id: number | null;
  created_at: string;
  responses: Response[];
}

interface OrderCardProps {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  statusLoading: number | null;
  selectMasterLoading: number | null;
  onStatusChange: (orderId: number, status: string) => void;
  onSelectMaster: (orderId: number, responseId: number) => void;
  onOpenEdit: (order: Order) => void;
  onOpenDelete: (orderId: number) => void;
  onOpenReview: (orderId: number, masterName: string, masterId: number | null) => void;
}

export default function OrderCard({
  order,
  expanded,
  onToggle,
  statusLoading,
  selectMasterLoading,
  onStatusChange,
  onSelectMaster,
  onOpenEdit,
  onOpenDelete,
  onOpenReview,
}: OrderCardProps) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
      {/* Заголовок карточки */}
      <div className="p-5 cursor-pointer hover:bg-white/2 transition-colors" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                {order.category}
              </Badge>
              <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${STATUS_LABELS[order.status]?.color || STATUS_LABELS.new.color}`}>
                {STATUS_LABELS[order.status]?.label || "Новая"}
              </Badge>
              {order.city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={11} />{order.city}</span>}
              {order.budget && <span className="text-emerald-400 text-xs font-medium">до {order.budget.toLocaleString("ru-RU")} ₽</span>}
              <span className="text-gray-600 text-xs">{formatDate(order.created_at)}</span>
            </div>
            <h3 className="text-white font-semibold">{order.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {order.responses.length > 0 && (
              <span className="bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-lg">
                {order.responses.length} {order.responses.length === 1 ? "отклик" : "отклика"}
              </span>
            )}
            <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Тело карточки */}
      {expanded && (
        <div className="border-t border-white/6 px-5 pb-5 pt-4">
          <p className="text-gray-400 text-sm mb-4">{order.description}</p>

          {/* Кнопки смены статуса */}
          {order.status !== "done" && order.status !== "cancelled" && (
            <div className="flex gap-2 flex-wrap mb-4">
              {order.status === "new" && (
                <button
                  onClick={() => onOpenEdit(order)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/8 text-gray-300 border border-white/10 hover:bg-white/15 transition-colors flex items-center gap-1.5"
                >
                  <Icon name="Pencil" size={12} />
                  Редактировать
                </button>
              )}
              {order.status !== "in_progress" && (
                <button
                  disabled={statusLoading === order.id}
                  onClick={() => onStatusChange(order.id, "in_progress")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 transition-colors"
                >
                  Мастер приступил
                </button>
              )}
              <button
                disabled={statusLoading === order.id}
                onClick={() => onStatusChange(order.id, "done")}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-colors"
              >
                Работа выполнена ✓
              </button>
              <button
                disabled={statusLoading === order.id}
                onClick={() => onStatusChange(order.id, "cancelled")}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-600/15 text-gray-500 border border-gray-500/20 hover:bg-gray-600/25 transition-colors"
              >
                Отменить
              </button>
            </div>
          )}

          {/* Кнопка удаления */}
          {(order.status === "new" || order.status === "cancelled") && (
            <div className="flex mb-4">
              <button
                onClick={() => onOpenDelete(order.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 transition-colors flex items-center gap-1.5"
              >
                <Icon name="Trash2" size={12} />
                Удалить заявку
              </button>
            </div>
          )}

          {/* Отклики */}
          {order.responses.length === 0 ? (
            <p className="text-gray-600 text-sm">Откликов пока нет — мастера скоро увидят вашу заявку</p>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                {order.accepted_response_id ? "Выбранный исполнитель" : `Отклики мастеров · ${order.responses.length}`}
              </p>
              {order.responses
                .filter(r => !order.accepted_response_id || r.id === order.accepted_response_id)
                .map((r) => {
                  const isAccepted = order.accepted_response_id === r.id;
                  return (
                    <div key={r.id} className={`border rounded-xl p-4 ${isAccepted ? "bg-emerald-600/8 border-emerald-500/25" : "bg-white/3 border-white/6"}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-sm">{r.master_name}</p>
                            {isAccepted && (
                              <span className="text-emerald-400 text-xs flex items-center gap-1 bg-emerald-600/15 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                                <Icon name="CheckCircle" size={11} /> Выбран
                              </span>
                            )}
                            {r.master_id && (
                              <a href={`/master-page?id=${r.master_id}`} className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
                                <Icon name="ExternalLink" size={11} />профиль
                              </a>
                            )}
                          </div>
                          {r.master_category && <p className="text-gray-500 text-xs mt-0.5">{r.master_category}</p>}
                        </div>
                        {isAccepted ? (
                          <a href={`tel:${r.master_phone}`} className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex-shrink-0">
                            <Icon name="Phone" size={13} />
                            {r.master_phone}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 text-gray-600 text-xs flex-shrink-0">
                            <Icon name="Lock" size={12} />
                            Контакт скрыт
                          </span>
                        )}
                      </div>
                      {r.message && <p className="text-gray-300 text-sm mb-3">{r.message}</p>}
                      <div className="flex items-center gap-3 flex-wrap">
                        {!order.accepted_response_id && order.status === "new" && (
                          r.master_balance >= 5 ? (
                            <button
                              disabled={selectMasterLoading === r.id}
                              onClick={() => onSelectMaster(order.id, r.id)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors flex items-center gap-1.5"
                            >
                              <Icon name="UserCheck" size={13} />
                              {selectMasterLoading === r.id ? "Выбираем..." : "Выбрать исполнителем"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-600 flex items-center gap-1.5">
                              <Icon name="Lock" size={12} />
                              Мастер временно недоступен
                            </span>
                          )
                        )}
                        {r.review ? (
                          <div className="bg-amber-600/10 border border-amber-500/15 rounded-lg px-3 py-2 flex items-center gap-2">
                            <StarRating value={r.review.rating} />
                            {r.review.comment && <p className="text-gray-400 text-xs ml-1">{r.review.comment}</p>}
                          </div>
                        ) : order.status === "done" && isAccepted ? (
                          <button
                            onClick={() => onOpenReview(order.id, r.master_name, r.master_id)}
                            className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Icon name="Star" size={13} />
                            Оставить отзыв
                          </button>
                        ) : order.status !== "done" && isAccepted ? (
                          <span className="text-gray-600 text-xs flex items-center gap-1">
                            <Icon name="Lock" size={12} />
                            Отзыв после выполнения
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              {order.accepted_response_id && order.responses.filter(r => r.id !== order.accepted_response_id).length > 0 && (
                <details className="text-xs text-gray-600 cursor-pointer">
                  <summary className="hover:text-gray-400 transition-colors">
                    Ещё {order.responses.length - 1} {order.responses.length - 1 === 1 ? "отклик" : "отклика"}
                  </summary>
                  <div className="space-y-2 mt-2">
                    {order.responses.filter(r => r.id !== order.accepted_response_id).map(r => (
                      <div key={r.id} className="bg-white/2 border border-white/5 rounded-xl p-3 text-gray-500">
                        <p className="text-sm text-gray-400">{r.master_name}</p>
                        {r.master_category && <p className="text-xs">{r.master_category}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}