import { useState, useEffect } from "react";
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
  created_at: string;
  responses: Response[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
}

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

export default function Cabinet() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Форма входа
  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Форма отзыва
  const [reviewForm, setReviewForm] = useState<{ orderId: number; masterName: string; masterId: number | null } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone");
    if (saved) {
      setLoginPhone(saved);
      loadProfile(saved);
    }
  }, []);

  const loadProfile = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.customer) {
        setCustomer(parsed.customer);
        setOrders(parsed.orders || []);
        localStorage.setItem("customer_phone", phone);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const body: Record<string, string> = { phone: loginPhone };
      if (isNewUser) body.name = loginName;

      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (parsed.not_found) {
        setIsNewUser(true);
        setLoginError("Аккаунт не найден. Введите имя для регистрации.");
        return;
      }
      if (parsed.error) {
        setLoginError(parsed.error);
        return;
      }
      setCustomer(parsed.customer);
      setOrders(parsed.orders || []);
      localStorage.setItem("customer_phone", loginPhone);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_phone");
    setCustomer(null);
    setOrders([]);
    setLoginPhone("");
    setIsNewUser(false);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm || !customer) return;
    setReviewLoading(true);
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          customer_id: customer.id,
          order_id: reviewForm.orderId,
          master_name: reviewForm.masterName,
          master_id: reviewForm.masterId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.success) {
        setReviewSuccess("Отзыв отправлен!");
        setReviewForm(null);
        setReviewComment("");
        setReviewRating(5);
        await loadProfile(customer.phone);
        setTimeout(() => setReviewSuccess(""), 3000);
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const totalResponses = orders.reduce((s, o) => s + o.responses.length, 0);

  // Экран входа
  if (!customer && !loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-white">HandyMan</span>
            </a>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Icon name="LayoutDashboard" size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Мои заявки</h1>
            <p className="text-gray-400 text-sm">Войдите по номеру телефона, который указывали при создании заявки</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона</label>
              <input
                type="tel"
                required
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {isNewUser && (
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя</label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Как вас зовут?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            )}
            {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
            <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
              {loginLoading ? "Загрузка..." : isNewUser ? "Зарегистрироваться" : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 text-sm">
                {customer?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-gray-300 text-sm hidden sm:block">{customer?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Уведомление об отзыве */}
        {reviewSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />
            {reviewSuccess}
          </div>
        )}

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

        {/* Форма отзыва */}
        {reviewForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-white font-semibold text-lg mb-1">Отзыв о мастере</h3>
              <p className="text-gray-400 text-sm mb-5">{reviewForm.masterName}</p>
              <form onSubmit={handleReview} className="space-y-4">
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
                  <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={() => setReviewForm(null)}>Отмена</Button>
                  <Button type="submit" disabled={reviewLoading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    {reviewLoading ? "Отправка..." : "Отправить"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Список заявок */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Icon name="ClipboardList" size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg">Заявок пока нет</p>
            <a href="/"><Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Создать заявку</Button></a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 cursor-pointer hover:bg-white/2 transition-colors" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
                          {order.category}
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
                      <Icon name={expandedOrder === order.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-white/6 px-5 pb-5 pt-4">
                    <p className="text-gray-400 text-sm mb-4">{order.description}</p>
                    {order.responses.length === 0 ? (
                      <p className="text-gray-600 text-sm">Откликов пока нет — мастера скоро увидят вашу заявку</p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Отклики мастеров</p>
                        {order.responses.map((r) => (
                          <div key={r.id} className="bg-white/3 border border-white/6 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <p className="text-white font-semibold text-sm">{r.master_name}</p>
                                {r.master_category && <p className="text-gray-500 text-xs">{r.master_category}</p>}
                              </div>
                              <a href={`tel:${r.master_phone}`} className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                                <Icon name="Phone" size={13} />
                                {r.master_phone}
                              </a>
                            </div>
                            {r.message && <p className="text-gray-300 text-sm mb-3">{r.message}</p>}
                            {r.review ? (
                              <div className="bg-amber-600/10 border border-amber-500/15 rounded-lg px-3 py-2 flex items-center gap-2">
                                <StarRating value={r.review.rating} />
                                {r.review.comment && <p className="text-gray-400 text-xs ml-1">{r.review.comment}</p>}
                              </div>
                            ) : (
                              <button
                                onClick={() => { setReviewForm({ orderId: order.id, masterName: r.master_name, masterId: r.master_id }); setReviewRating(5); setReviewComment(""); }}
                                className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <Icon name="Star" size={13} />
                                Оставить отзыв
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
