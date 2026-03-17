import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const CATEGORIES = [
  "Авторемонт","Ремонт жилья","Строительство","Бьюти","IT-помощь",
  "Сантехника","Электрика","Перевозки","Няня","Клининг","Прочее",
];

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
  responses: unknown[];
}

// ── Модалка удаления заявки ──────────────────────────────────────────────────

interface DeleteOrderModalProps {
  deleteOrderId: number | null;
  deleteLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteOrderModal({ deleteOrderId, deleteLoading, onConfirm, onCancel }: DeleteOrderModalProps) {
  if (!deleteOrderId) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-red-600/15 flex items-center justify-center mx-auto mb-4">
          <Icon name="Trash2" size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Удалить заявку?</h3>
        <p className="text-gray-400 text-sm mb-6">Это действие нельзя отменить. Заявка и все отклики будут удалены.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 text-gray-400" onClick={onCancel}>Отмена</Button>
          <Button disabled={deleteLoading} onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
            {deleteLoading ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Модалка редактирования заявки ────────────────────────────────────────────

interface EditOrderForm {
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string;
}

interface EditOrderModalProps {
  editOrder: Order | null;
  editForm: EditOrderForm;
  editLoading: boolean;
  setEditForm: (fn: (f: EditOrderForm) => EditOrderForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function EditOrderModal({ editOrder, editForm, editLoading, setEditForm, onSubmit, onCancel }: EditOrderModalProps) {
  if (!editOrder) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Редактировать заявку</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Название *</label>
            <input
              required
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Описание *</label>
            <textarea
              required
              rows={3}
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Категория *</label>
              <select
                required
                value={editForm.category}
                onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                style={{ colorScheme: "dark" }}
              >
                <option value="" disabled>Выберите</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Город</label>
              <input
                value={editForm.city}
                onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Бюджет, ₽</label>
            <input
              type="number"
              min="0"
              value={editForm.budget}
              onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="Оставьте пустым, если не знаете"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={onCancel}>Отмена</Button>
            <Button type="submit" disabled={editLoading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {editLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Модалка отзыва ───────────────────────────────────────────────────────────

interface ReviewForm {
  orderId: number;
  masterName: string;
  masterId: number | null;
}

interface ReviewModalProps {
  reviewForm: ReviewForm | null;
  reviewRating: number;
  reviewComment: string;
  reviewLoading: boolean;
  setReviewRating: (v: number) => void;
  setReviewComment: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ReviewModal({ reviewForm, reviewRating, reviewComment, reviewLoading, setReviewRating, setReviewComment, onSubmit, onCancel }: ReviewModalProps) {
  if (!reviewForm) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white font-semibold text-lg mb-1">Отзыв о мастере</h3>
        <p className="text-gray-400 text-sm mb-5">{reviewForm.masterName}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Оценка</label>
            <StarRating value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Комментарий</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Расскажите о работе мастера..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={onCancel}>Отмена</Button>
            <Button type="submit" disabled={reviewLoading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {reviewLoading ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
