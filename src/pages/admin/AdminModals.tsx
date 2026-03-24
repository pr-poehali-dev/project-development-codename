import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminModalsProps {
  editModal: { type: "master" | "customer"; data: Record<string, unknown> } | null;
  editForm: Record<string, string>;
  setEditForm: (fn: (f: Record<string, string>) => Record<string, string>) => void;
  onSaveEdit: () => void;
  onCloseEdit: () => void;

  balanceModal: Record<string, unknown> | null;
  balanceAmount: string;
  setBalanceAmount: (v: string) => void;
  balanceComment: string;
  setBalanceComment: (v: string) => void;
  onAdjustBalance: () => void;
  onCloseBalance: () => void;
}

export default function AdminModals({
  editModal,
  editForm,
  setEditForm,
  onSaveEdit,
  onCloseEdit,
  balanceModal,
  balanceAmount,
  setBalanceAmount,
  balanceComment,
  setBalanceComment,
  onAdjustBalance,
  onCloseBalance,
}: AdminModalsProps) {
  return (
    <>
      {/* Модалка редактирования */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-800 mb-4">
              Редактировать {editModal.type === "master" ? "мастера" : "заказчика"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Имя *</label>
                <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Телефон *</label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
              </div>
              {editModal.type === "master" && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Город</label>
                    <Input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} placeholder="Город" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Категория</label>
                    <Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} placeholder="Категория" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">О себе</label>
                    <textarea
                      rows={3}
                      value={editForm.about}
                      onChange={e => setEditForm(f => ({ ...f, about: e.target.value }))}
                      placeholder="О себе"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={onSaveEdit}>Сохранить</Button>
                <Button variant="outline" onClick={onCloseEdit}>Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка баланса */}
      {balanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-1">Изменить баланс</h3>
            <p className="text-sm text-gray-500 mb-4">{balanceModal.name as string} · текущий баланс: {balanceModal.balance as number}</p>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Сумма (+ пополнение, - списание)"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
              <Input
                placeholder="Комментарий"
                value={balanceComment}
                onChange={(e) => setBalanceComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={onAdjustBalance}>
                  Применить
                </Button>
                <Button variant="outline" onClick={onCloseBalance}>Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
