import { useState, useEffect } from "react";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import OrdersFilters from "@/pages/OrdersFilters";
import OrderCard from "@/pages/OrderCard";
import OrderResponseModal from "@/pages/OrderResponseModal";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";
const RESPONSES_URL = "https://functions.poehali.dev/889ae9dd-c29e-4b5b-b05e-1110dc8e5eaa";
const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const initialCategory = new URLSearchParams(window.location.search).get("category") || "";
  const [activeCategories, setActiveCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);

  const seoTitle = activeCategories.length === 1
    ? `${activeCategories[0]} — заявки на HandyMan`
    : "Лента заявок — HandyMan";
  const seoDesc = activeCategories.length === 1
    ? `Заявки на услугу «${activeCategories[0]}» — откликайтесь и получайте заказы на HandyMan.`
    : "Лента заявок от заказчиков. Найдите подходящий заказ и откликнитесь на HandyMan.";
  useSeoMeta(seoTitle, seoDesc);
  const [selectedCity, setSelectedCity] = useState("");
  const [mainTab, setMainTab] = useState<"all" | "active" | "done">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [responseForm, setResponseForm] = useState({ master_name: "", master_phone: "", master_category: "", message: "" });
  const [responseSent, setResponseSent] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [masterBalance, setMasterBalance] = useState<number | null>(null);
  const [masterId, setMasterId] = useState<number | null>(null);
  const [masterData, setMasterData] = useState<{ name: string; phone: string; category: string } | null>(null);

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
            const md = { name: parsed.master.name, phone: parsed.master.phone, category: parsed.master.category };
            setMasterData(md);
            setResponseForm((f) => ({ ...f, master_name: md.name, master_phone: md.phone, master_category: md.category }));
          }
        });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tab: mainTab });
    if (mainTab === "all" && selectedCity) params.set("city", selectedCity);
    if ((mainTab === "active" || mainTab === "done") && masterId) params.set("master_id", String(masterId));
    fetch(`${ORDERS_URL}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const raw = typeof data === "string" ? JSON.parse(data) : data;
        setOrders(raw.orders || []);
      })
      .finally(() => setLoading(false));
  }, [selectedCity, mainTab, masterId]);

  const cities = ["Все", ...Array.from(new Set(orders.map((o) => o.city).filter(Boolean)))];
  const categories = Array.from(new Set(orders.map((o) => o.category)));
  const q = searchQuery.trim().toLowerCase();
  const filtered = orders.filter((o) =>
    (activeCategories.length === 0 || activeCategories.includes(o.category)) &&
    (!q || o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
  );
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, activeCategories, selectedCity, mainTab]);

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
              <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                HandyMan
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {masterData && (
              <a href="/master" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <div className="w-7 h-7 rounded-lg bg-violet-600/30 flex items-center justify-center text-violet-400 font-bold text-xs">
                  {masterData.name[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block">{masterData.name}</span>
              </a>
            )}
            <a href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm gap-2">
                <Icon name="ArrowLeft" size={16} />
                На главную
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <OrdersFilters
            mainTab={mainTab}
            setMainTab={setMainTab}
            masterId={masterId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            activeCategories={activeCategories}
            setActiveCategories={setActiveCategories}
            categories={categories}
            cities={cities}
          />

          {/* Список заявок */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-white/4 border border-white/8 rounded-xl p-3.5 animate-pulse">
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
              <p className="text-gray-500 text-lg">
                {q ? "Ничего не найдено" : mainTab === "active" ? "Нет активных заявок" : mainTab === "done" ? "Нет завершённых заявок" : "Заявок пока нет"}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {q ? `По запросу «${searchQuery}» заявок не найдено` : mainTab === "active" ? "Здесь появятся заявки, которые ты принял в работу" : mainTab === "done" ? "Здесь будут отображаться выполненные заказы" : "Новые заявки появятся здесь автоматически"}
              </p>
              {q && <button onClick={() => setSearchQuery("")} className="mt-4 text-violet-400 hover:text-violet-300 text-sm transition-colors">Сбросить поиск</button>}
            </div>
          ) : (
            <>
            {(activeCategories.length > 0 || searchQuery || selectedCity) && (
              <p className="text-sm text-gray-400 mb-4">
                Найдено{" "}
                <span className="text-white font-semibold">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "заявка" : filtered.length >= 2 && filtered.length <= 4 ? "заявки" : "заявок"}
                {activeCategories.length > 0 && (
                  <> в {activeCategories.length === 1 ? <span className="text-violet-400">{activeCategories[0]}</span> : <><span className="text-violet-400">{activeCategories.length} категориях</span></>}</>
                )}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visible.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  formatDate={formatDate}
                  onClick={(o) => {
                    setSelectedOrder(o);
                    setResponseSent(false);
                    setResponseError("");
                    setResponseForm({
                      master_name: masterData?.name || "",
                      master_phone: masterData?.phone || "",
                      master_category: masterData?.category || "",
                      message: "",
                    });
                  }}
                />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="text-center mt-8">
                <Button
                  variant="ghost"
                  className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-8"
                  onClick={() => setVisibleCount(v => v + 20)}
                >
                  Показать ещё ({filtered.length - visibleCount} осталось)
                </Button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      <OrderResponseModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        masterData={masterData}
        masterId={masterId}
        masterBalance={masterBalance}
        responseForm={responseForm}
        setResponseForm={setResponseForm}
        responseSent={responseSent}
        setResponseSent={setResponseSent}
        responseLoading={responseLoading}
        responseError={responseError}
        setResponseError={setResponseError}
        onSubmit={handleRespond}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Orders;