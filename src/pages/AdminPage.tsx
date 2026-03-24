import { useState, useEffect, useCallback } from "react";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import AdminTabContent from "@/pages/admin/AdminTabContent";
import AdminModals from "@/pages/admin/AdminModals";

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

type Tab = "dashboard" | "masters" | "customers" | "orders" | "reviews" | "categories";

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<Record<string, number> | null>(null);
  const [masters, setMasters] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [balanceModal, setBalanceModal] = useState<Record<string, unknown> | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceComment, setBalanceComment] = useState("");

  const [editModal, setEditModal] = useState<{ type: "master" | "customer"; data: Record<string, unknown> } | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const openEdit = (type: "master" | "customer", data: Record<string, unknown>) => {
    setEditModal({ type, data });
    if (type === "master") {
      setEditForm({
        name: String(data.name || ""),
        phone: String(data.phone || ""),
        email: String(data.email || ""),
        city: String(data.city || ""),
        category: String(data.category || ""),
        about: String(data.about || ""),
      });
    } else {
      setEditForm({
        name: String(data.name || ""),
        phone: String(data.phone || ""),
        email: String(data.email || ""),
      });
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

  const loadTab = useCallback(async (t: Tab, tk: string) => {
    setLoading(true);
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
    const tk = setupMode ? res.token || token : res.token;
    localStorage.setItem("admin_token", tk || token);
    setToken(tk || token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
  };

  const blockMaster = async (id: number, block: boolean) => {
    await api("admin_block_master", "POST", { master_id: id, block }, token);
    loadTab("masters", token);
  };

  const blockCustomer = async (id: number, block: boolean) => {
    await api("admin_block_customer", "POST", { customer_id: id, block }, token);
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
      master_id: balanceModal.id,
      amount: Number(balanceAmount),
      comment: balanceComment || "Корректировка администратором",
    }, token);
    setBalanceModal(null);
    setBalanceAmount("");
    setBalanceComment("");
    loadTab("masters", token);
  };

  if (!isLoggedIn) {
    return (
      <AdminLogin
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginError={loginError}
        setupMode={setupMode}
        setSetupMode={setSetupMode}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar tab={tab} setTab={setTab} onLogout={logout} />

      <AdminTabContent
        tab={tab}
        loading={loading}
        dashboard={dashboard}
        masters={masters}
        customers={customers}
        orders={orders}
        reviews={reviews}
        categories={categories}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onOpenEdit={openEdit}
        onOpenBalance={(m) => { setBalanceModal(m); setBalanceAmount(""); setBalanceComment(""); }}
        onBlockMaster={blockMaster}
        onBlockCustomer={blockCustomer}
        onUpdateOrderStatus={updateOrderStatus}
        onDeleteOrder={deleteOrder}
        onDeleteReview={deleteReview}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />

      <AdminModals
        editModal={editModal}
        editForm={editForm}
        setEditForm={setEditForm}
        onSaveEdit={saveEdit}
        onCloseEdit={() => setEditModal(null)}
        balanceModal={balanceModal}
        balanceAmount={balanceAmount}
        setBalanceAmount={setBalanceAmount}
        balanceComment={balanceComment}
        setBalanceComment={setBalanceComment}
        onAdjustBalance={adjustBalance}
        onCloseBalance={() => setBalanceModal(null)}
      />
    </div>
  );
}
