import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { categoryColors } from "@/pages/categoryColors";

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  contact_name: string;
  status: string;
  created_at: string;
}

interface ResponseForm {
  master_name: string;
  master_phone: string;
  master_category: string;
  message: string;
}

interface MasterData {
  name: string;
  phone: string;
  category: string;
}

interface OrderResponseModalProps {
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
  masterData: MasterData | null;
  masterId: number | null;
  masterBalance: number | null;
  responseForm: ResponseForm;
  setResponseForm: (f: ResponseForm) => void;
  responseSent: boolean;
  setResponseSent: (v: boolean) => void;
  responseLoading: boolean;
  responseError: string;
  setResponseError: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  formatDate: (iso: string) => string;
}

export default function OrderResponseModal({
  selectedOrder,
  setSelectedOrder,
  masterData,
  masterId,
  masterBalance,
  responseForm,
  setResponseForm,
  responseSent,
  setResponseSent,
  responseLoading,
  responseError,
  setResponseError,
  onSubmit,
  formatDate,
}: OrderResponseModalProps) {
  return (
    <Dialog open={!!selectedOrder} onOpenChange={(v) => {
      if (!v) { setSelectedOrder(null); setResponseSent(false); setResponseError(""); }
      if (v && masterData) {
        setResponseForm({ ...responseForm, master_name: masterData.name, master_phone: masterData.phone, master_category: masterData.category });
      }
    }}>
      <DialogContent className="bg-[#1a1d27] border border-white/10 text-white max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {responseSent ? "Отклик отправлен!" : selectedOrder?.title}
          </DialogTitle>
        </DialogHeader>

        {responseSent ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-emerald-400" />
            </div>
            <p className="text-gray-300 mb-2">Ваш отклик отправлен заказчику!</p>
            <p className="text-gray-500 text-sm">Заказчик рассмотрит все отклики и свяжется с вами.</p>
            <Button
              className="mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={() => setSelectedOrder(null)}
            >
              Вернуться к заявкам
            </Button>
          </div>
        ) : selectedOrder && (
          <div className="space-y-4">
            {/* Детали заявки */}
            <div className="bg-white/4 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[selectedOrder.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                  {selectedOrder.category}
                </Badge>
                {selectedOrder.budget && (
                  <span className="text-emerald-400 text-sm font-semibold">до {selectedOrder.budget.toLocaleString("ru-RU")} ₽</span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedOrder.description}</p>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs pt-1">
                <Icon name="User" size={13} />
                {selectedOrder.contact_name} · {formatDate(selectedOrder.created_at)}
              </div>
            </div>

            {/* Баланс мастера */}
            {masterId !== null && (
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${masterBalance && masterBalance > 0 ? "bg-violet-600/10 border border-violet-500/20" : "bg-red-600/10 border border-red-500/20"}`}>
                <div className="flex items-center gap-2">
                  <Icon name="Coins" size={16} className={masterBalance && masterBalance > 0 ? "text-violet-400" : "text-red-400"} />
                  <span className={`text-sm ${masterBalance && masterBalance > 0 ? "text-violet-300" : "text-red-300"}`}>
                    {masterBalance && masterBalance > 0
                      ? `Баланс: ${masterBalance} токенов`
                      : "Недостаточно токенов для отклика"}
                  </span>
                </div>
                <a href="/master" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Пополнить →</a>
              </div>
            )}
            {masterId === null && (
              <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-amber-300/80 text-sm">Войдите в кабинет мастера для отклика</span>
                <a href="/master" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Войти →</a>
              </div>
            )}

            {/* Форма отклика */}
            <form onSubmit={onSubmit} className="space-y-3">
              <p className="text-sm font-semibold text-white">Ваш отклик</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Имя *</label>
                  <input
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Ваше имя"
                    value={responseForm.master_name}
                    onChange={(e) => setResponseForm({ ...responseForm, master_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Телефон *</label>
                  <input
                    required
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="+7 (999) 000-00-00"
                    value={responseForm.master_phone}
                    onChange={(e) => setResponseForm({ ...responseForm, master_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Сообщение заказчику</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="Расскажите об опыте, когда сможете приступить и ваша цена..."
                  value={responseForm.message}
                  onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                />
              </div>
              {responseError && <p className="text-red-400 text-sm">{responseError}</p>}
              <Button
                type="submit"
                disabled={responseLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {responseLoading ? "Отправляем..." : "Откликнуться на заявку"}
                {!responseLoading && <Icon name="ArrowRight" size={16} className="ml-2" />}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
