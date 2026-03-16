import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";
const RESPONSES_URL = "https://functions.poehali.dev/889ae9dd-c29e-4b5b-b05e-1110dc8e5eaa";

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

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [responseForm, setResponseForm] = useState({ master_name: "", master_phone: "", master_category: "", message: "" });
  const [responseSent, setResponseSent] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [masterBalance, setMasterBalance] = useState<number | null>(null);
  const [masterId, setMasterId] = useState<number | null>(null);

  useEffect(() => {
    const savedPhone = localStorage.getItem("master_phone");
    if (savedPhone) {
      fetch(`${PROFILE_URL}?phone=${encodeURIComponent(savedPhone)}`)
        .then((r) => r.json())
        .then((data) => {
          const parsed = typeof data === "string" ? JSON.parse(data) : data;
          if (parsed.master) {
            setMasterBalance(parsed.master.balance);
            setMasterId(parsed.master.id);
            setResponseForm((f) => ({ ...f, master_name: parsed.master.name, master_phone: parsed.master.phone, master_category: parsed.master.category }));
          }
        });
    }
  }, []);

  useEffect(() => {
    const url = selectedCity ? `${ORDERS_URL}?city=${encodeURIComponent(selectedCity)}` : ORDERS_URL;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const raw = typeof data === "string" ? JSON.parse(data) : data;
        setOrders(raw.orders || []);
      })
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const cities = ["Все", ...Array.from(new Set(orders.map((o) => o.city).filter(Boolean)))];
  const categories = ["Все", ...Array.from(new Set(orders.map((o) => o.category)))];
  const filtered = orders.filter((o) =>
    (activeCategory === "Все" || o.category === activeCategory)
  );

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setResponseLoading(true);
    setResponseError("");
    try {
      const res = await fetch(RESPONSES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...responseForm, order_id: selectedOrder.id, master_id: masterId }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.success) {
        setResponseSent(true);
      } else {
        setResponseError(parsed.error || "Ошибка при отправке");
      }
    } catch {
      setResponseError("Не удалось отправить. Попробуйте позже.");
    } finally {
      setResponseLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Icon name="Zap" size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                ХэндиМэн
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm gap-2">
                <Icon name="ArrowLeft" size={16} />
                На главную
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Заголовок */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Лента заявок</h1>
            <p className="text-gray-400">Найди подходящий заказ и откликнись — заказчик выберет лучшего мастера</p>
          </div>

          {/* Фильтр по городу */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <CitySelect
              value={selectedCity}
              onChange={setSelectedCity}
              allCitiesLabel="Все города"
              variant="glass"
              cities={cities.filter(c => c !== "Все")}
            />
            {selectedCity && (
              <button onClick={() => setSelectedCity("")} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 transition-colors">
                <Icon name="X" size={14} />
                Сбросить
              </button>
            )}
          </div>

          {/* Фильтр по категориям */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                  activeCategory === cat
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Список заявок */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-3 w-1/3" />
                  <div className="h-5 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Icon name="ClipboardList" size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-lg">Заявок пока нет</p>
              <p className="text-gray-600 text-sm mt-1">Новые заявки появятся здесь автоматически</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-white/6 transition-all cursor-pointer flex flex-col"
                  onClick={() => { setSelectedOrder(order); setResponseSent(false); setResponseError(""); setResponseForm({ master_name: "", master_phone: "", master_category: "", message: "" }); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                        {order.category}
                      </Badge>
                      {order.city && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <Icon name="MapPin" size={11} />
                          {order.city}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs flex-shrink-0">{formatDate(order.created_at)}</span>
                  </div>

                  <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-violet-200 transition-colors">
                    {order.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                    {order.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/6">
                    <div>
                      {order.budget ? (
                        <span className="text-white font-bold">
                          до {order.budget.toLocaleString("ru-RU")} ₽
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Бюджет не указан</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Icon name="User" size={13} />
                      {order.contact_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Модалка с деталями заявки и формой отклика */}
      <Dialog open={!!selectedOrder} onOpenChange={(v) => { if (!v) setSelectedOrder(null); }}>
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
                    <Icon name="Zap" size={15} className={masterBalance && masterBalance > 0 ? "text-violet-400" : "text-red-400"} />
                    <span className="text-sm text-gray-300">Откликов на балансе: <strong className={masterBalance && masterBalance > 0 ? "text-violet-300" : "text-red-400"}>{masterBalance}</strong></span>
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
              <form onSubmit={handleRespond} className="space-y-3">
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
    </div>
  );
};

export default Orders;