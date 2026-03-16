import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

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

interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  message: string;
  created_at: string;
}

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  status: string;
  created_at: string;
  responses: Response[];
}

const Cabinet = () => {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) {
        setError(parsed.error);
      } else {
        setOrders(parsed.orders || []);
        setSearched(true);
      }
    } catch {
      setError("Не удалось загрузить данные. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  const totalResponses = orders.reduce((sum, o) => sum + o.responses.length, 0);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              HandyMan
            </span>
          </a>
          <a href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm gap-2">
              <Icon name="ArrowLeft" size={16} />
              На главную
            </Button>
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="LayoutDashboard" size={28} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Мои заявки</h1>
          <p className="text-gray-400">Введите номер телефона, который указывали при создании заявки</p>
        </div>

        {/* Форма поиска */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto mb-10">
          <div className="flex-1 relative">
            <Icon name="Phone" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              required
              type="tel"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 rounded-xl disabled:opacity-60"
          >
            {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Найти"}
          </Button>
        </form>

        {error && (
          <div className="text-center text-red-400 text-sm mb-6">{error}</div>
        )}

        {/* Результаты */}
        {searched && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Icon name="ClipboardList" size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-500 text-lg">Заявок не найдено</p>
                <p className="text-gray-600 text-sm mt-1">Убедитесь, что номер телефона указан правильно</p>
                <a href="/">
                  <Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Создать заявку
                  </Button>
                </a>
              </div>
            ) : (
              <>
                {/* Сводка */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Заявок", value: orders.length, icon: "ClipboardList", color: "text-violet-400" },
                    { label: "Откликов", value: totalResponses, icon: "MessageCircle", color: "text-emerald-400" },
                    { label: "Активных", value: orders.filter(o => o.status === "new").length, icon: "Clock", color: "text-amber-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/4 border border-white/8 rounded-2xl p-4 text-center">
                      <Icon name={stat.icon} size={20} className={`${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Список заявок */}
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                      {/* Заголовок заявки */}
                      <div
                        className="p-5 cursor-pointer hover:bg-white/2 transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                                {order.category}
                              </Badge>
                              {order.budget && (
                                <span className="text-emerald-400 text-xs font-medium">до {order.budget.toLocaleString("ru-RU")} ₽</span>
                              )}
                              <span className="text-gray-600 text-xs">{formatDate(order.created_at)}</span>
                            </div>
                            <h3 className="text-white font-semibold text-base">{order.title}</h3>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-1">{order.description}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {order.responses.length > 0 && (
                              <div className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                <Icon name="MessageCircle" size={14} />
                                {order.responses.length}
                              </div>
                            )}
                            <Icon
                              name={expandedOrder === order.id ? "ChevronUp" : "ChevronDown"}
                              size={18}
                              className="text-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Отклики */}
                      {expandedOrder === order.id && (
                        <div className="border-t border-white/8 bg-black/20">
                          {order.responses.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                              <Icon name="Clock" size={24} className="text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">Откликов пока нет</p>
                              <p className="text-gray-600 text-xs mt-1">Мастера увидят заявку и начнут откликаться</p>
                            </div>
                          ) : (
                            <div className="p-5 space-y-3">
                              <p className="text-gray-400 text-sm font-medium mb-4">
                                {order.responses.length} {order.responses.length === 1 ? "отклик" : order.responses.length < 5 ? "отклика" : "откликов"}
                              </p>
                              {order.responses.map((r) => (
                                <div key={r.id} className="bg-white/4 border border-white/8 rounded-xl p-4">
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {r.master_name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-white font-semibold text-sm">{r.master_name}</div>
                                        {r.master_category && (
                                          <div className="text-gray-500 text-xs">{r.master_category}</div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-gray-600 text-xs flex-shrink-0">{formatDate(r.created_at)}</span>
                                  </div>
                                  {r.message && (
                                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{r.message}</p>
                                  )}
                                  <a href={`tel:${r.master_phone}`}>
                                    <Button size="sm" className="bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 rounded-lg text-xs transition-all gap-1.5">
                                      <Icon name="Phone" size={13} />
                                      {r.master_phone}
                                    </Button>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cabinet;