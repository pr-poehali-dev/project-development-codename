import { useState, useEffect, useCallback } from "react";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminSidebar, { type Tab } from "@/pages/admin/AdminSidebar";
import AdminTabContent from "@/pages/admin/AdminTabContent";
import AdminModals from "@/pages/admin/AdminModals";
import LiveLogs from "@/components/LiveLogs";

const API = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";

function api(action: string, method = "GET", body?: object, token?: string) {
  const sep = action ? "?" : "";
  return fetch(`${API}${sep}${action ? `action=${action}` : ""}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Admin-Token": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [masters, setMasters] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, unknown>[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [balanceModal, setBalanceModal] = useState<Record<string, unknown> | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceComment, setBalanceComment] = useState("");

  const [editModal, setEditModal] = useState<{ type: "master" | "customer"; data: Record<string, unknown> } | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const [serviceEditModal, setServiceEditModal] = useState<Record<string, unknown> | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState<Record<string, string>>({});

  const openEdit = (type: "master" | "customer", data: Record<string, unknown>) => {
    setEditModal({ type, data });
    if (type === "master") {
      setEditForm({ name: String(data.name || ""), phone: String(data.phone || ""), email: String(data.email || ""), city: String(data.city || ""), category: String(data.category || ""), about: String(data.about || "") });
    } else {
      setEditForm({ name: String(data.name || ""), phone: String(data.phone || ""), email: String(data.email || "") });
    }
  };

  const saveEdit = async () => {
    if (!editModal) return;
    if (editModal.type === "master") {
      await api("admin_update_master", "POST", { master_id: editModal.data.id, ...editForm }, token);
      loadTab("masters", token);
    } else {
      await api("admin_update_customer", "POST", { customer_id: editModal.data.id, ...editForm }, token);
      loadTab("customers", token);
    }
    setEditModal(null);
  };

  const openEditService = (s: Record<string, unknown>) => {
    setServiceEditModal(s);
    setServiceEditForm({
      title: String(s.title || ""),
      description: String(s.description || ""),
      category: String(s.category || ""),
      city: String(s.city || ""),
      price: s.price ? String(s.price) : "",
    });
  };

  const saveServiceEdit = async () => {
    if (!serviceEditModal) return;
    await api("admin_update_service", "POST", {
      service_id: serviceEditModal.id,
      ...serviceEditForm,
      price: serviceEditForm.price ? Number(serviceEditForm.price) : null,
    }, token);
    setServiceEditModal(null);
    loadTab("services", token);
  };

  const loadTab = useCallback(async (t: Tab, tk: string) => {
    setLoading(true);
    setSearchQuery("");
    try {
      if (t === "dashboard") {
        const d = await api("admin_dashboard", "GET", undefined, tk);
        setDashboard(d);
      } else if (t === "masters") {
        const d = await api("admin_masters", "GET", undefined, tk);
        setMasters(d.masters || []);
      } else if (t === "customers") {
        const d = await api("admin_customers", "GET", undefined, tk);
        setCustomers(d.customers || []);
      } else if (t === "orders") {
        const d = await api("admin_orders", "GET", undefined, tk);
        setOrders(d.orders || []);
      } else if (t === "reviews") {
        const d = await api("admin_reviews", "GET", undefined, tk);
        setReviews(d.reviews || []);
      } else if (t === "categories") {
        const d = await api("admin_categories", "GET", undefined, tk);
        setCategories(d.categories || []);
      } else if (t === "services") {
        const d = await api("admin_services", "GET", undefined, tk);
        setServices(d.services || []);
      } else if (t === "chats") {
        const d = await api("admin_chats", "GET", undefined, tk);
        setChats(d.chats || []);
        setActiveChatId(null);
        setChatMessages([]);
      } else if (t === "responses") {
        const d = await api("admin_responses", "GET", undefined, tk);
        setResponses(d.responses || []);
      } else if (t === "payments") {
        const d = await api("admin_payments", "GET", undefined, tk);
        setPayments(d.payments || []);
      } else if (t === "tickets") {
        const d = await api("admin_tickets", "GET", undefined, tk);
        setTickets(d.tickets || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadTab(tab, token);
  }, [tab, isLoggedIn, loadTab, token]);

  const handleLogin = async () => {
    setLoginError("");
    const res = await api(setupMode ? "admin_setup" : "admin_login", "POST", loginForm);
    if (res.error) return setLoginError(res.error);
    const tk = res.token || token;
    localStorage.setItem("admin_token", tk);
    setToken(tk);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
  };

  const viewChat = async (id: number) => {
    setActiveChatId(id);
    const d = await api(`admin_chat_messages&inquiry_id=${id}`, "GET", undefined, token);
    setChatMessages(d.messages || []);
  };

  const blockMaster = async (id: number, block: boolean) => {
    await api("admin_block_master", "POST", { master_id: id, block }, token);
    loadTab("masters", token);
  };

  const blockCustomer = async (id: number, block: boolean) => {
    await api("admin_block_customer", "POST", { customer_id: id, block }, token);
    loadTab("customers", token);
  };

  const deleteMaster = async (id: number) => {
    if (!confirm("Удалить мастера и все его данные? Это нельзя отменить.")) return;
    await api("admin_delete_master", "POST", { master_id: id }, token);
    loadTab("masters", token);
  };

  const deleteCustomer = async (id: number) => {
    if (!confirm("Удалить заказчика? Это нельзя отменить.")) return;
    await api("admin_delete_customer", "POST", { customer_id: id }, token);
    loadTab("customers", token);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await api("admin_update_order_status", "POST", { order_id: id, status }, token);
    loadTab("orders", token);
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    await api("admin_delete_order", "POST", { order_id: id }, token);
    loadTab("orders", token);
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    await api("admin_delete_review", "POST", { review_id: id }, token);
    loadTab("reviews", token);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await api("admin_add_category", "POST", { name: newCategory.trim() }, token);
    setNewCategory("");
    loadTab("categories", token);
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    await api("admin_delete_category", "POST", { id }, token);
    loadTab("categories", token);
  };

  const adjustBalance = async () => {
    if (!balanceModal || !balanceAmount) return;
    await api("admin_adjust_balance", "POST", {
      master_id: balanceModal.id, amount: Number(balanceAmount),
      comment: balanceComment || "Корректировка администратором",
    }, token);
    setBalanceModal(null); setBalanceAmount(""); setBalanceComment("");
    loadTab("masters", token);
  };

  const deleteService = async (id: number) => {
    if (!confirm("Удалить объявление?")) return;
    await api("admin_delete_service", "POST", { service_id: id }, token);
    loadTab("services", token);
  };

  const toggleService = async (id: number, active: boolean) => {
    await api("admin_toggle_service", "POST", { service_id: id, is_active: active }, token);
    loadTab("services", token);
  };

  const deleteChat = async (id: number) => {
    if (!confirm("Удалить переписку и все сообщения?")) return;
    await api("admin_delete_chat", "POST", { inquiry_id: id }, token);
    if (activeChatId === id) { setActiveChatId(null); setChatMessages([]); }
    loadTab("chats", token);
  };

  const deleteResponse = async (id: number) => {
    if (!confirm("Удалить отклик?")) return;
    await api("admin_delete_response", "POST", { response_id: id }, token);
    loadTab("responses", token);
  };

  const replyTicket = async (id: number, reply: string) => {
    await api("admin_reply_ticket", "POST", { ticket_id: id, reply }, token);
    loadTab("tickets", token);
  };

  const deleteTicket = async (id: number) => {
    if (!confirm("Удалить обращение?")) return;
    await api("admin_delete_ticket", "POST", { ticket_id: id }, token);
    loadTab("tickets", token);
  };

  if (!isLoggedIn) {
    return (
      <AdminLogin loginForm={loginForm} setLoginForm={setLoginForm}
        loginError={loginError} setupMode={setupMode} setSetupMode={setSetupMode} onLogin={handleLogin} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar tab={tab} setTab={setTab} onLogout={logout} />

      <div className="flex-1 min-w-0 overflow-auto">
        <AdminTabContent
          tab={tab} loading={loading} dashboard={dashboard}
          masters={masters} customers={customers} orders={orders}
          reviews={reviews} categories={categories} services={services}
          chats={chats} chatMessages={chatMessages} activeChatId={activeChatId}
          responses={responses} payments={payments}
          newCategory={newCategory} setNewCategory={setNewCategory}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          onOpenEdit={openEdit}
          onOpenBalance={(m) => { setBalanceModal(m); setBalanceAmount(""); setBalanceComment(""); }}
          onBlockMaster={blockMaster} onBlockCustomer={blockCustomer}
          onDeleteMaster={deleteMaster} onDeleteCustomer={deleteCustomer}
          onUpdateOrderStatus={updateOrderStatus} onDeleteOrder={deleteOrder}
          onDeleteReview={deleteReview} onAddCategory={addCategory} onDeleteCategory={deleteCategory}
          onEditService={openEditService} onDeleteService={deleteService} onToggleService={toggleService}
          onDeleteChat={deleteChat} onViewChat={viewChat}
          onDeleteResponse={deleteResponse}
          tickets={tickets} onReplyTicket={replyTicket} onDeleteTicket={deleteTicket}
        />
      </div>

      <AdminModals
        editModal={editModal} editForm={editForm} setEditForm={setEditForm}
        onSaveEdit={saveEdit} onCloseEdit={() => setEditModal(null)}
        balanceModal={balanceModal} balanceAmount={balanceAmount}
        setBalanceAmount={setBalanceAmount} balanceComment={balanceComment}
        setBalanceComment={setBalanceComment} onAdjustBalance={adjustBalance}
        onCloseBalance={() => setBalanceModal(null)}
        serviceEditModal={serviceEditModal} serviceEditForm={serviceEditForm}
        setServiceEditForm={setServiceEditForm}
        onSaveServiceEdit={saveServiceEdit} onCloseServiceEdit={() => setServiceEditModal(null)}
      />

      {/* Live Logs — только для администратора */}
      <LiveLogs />
    </div>
  );
}