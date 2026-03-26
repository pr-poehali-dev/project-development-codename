import { useState, useEffect } from "react";
import CabinetAuth from "@/components/cabinet/CabinetAuth";
import CabinetNav from "@/components/cabinet/CabinetNav";
import CabinetOrderList from "@/components/cabinet/CabinetOrderList";
import OrderModal from "@/components/home/OrderModal";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
const AUTH_URL = MY_ORDERS_URL;

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
  accepted_response_id: number | null;
  created_at: string;
  responses: Response[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

export default function Cabinet() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Форма входа
  const [loginMode, setLoginMode] = useState<"login" | "register" | "reset">("login");
  const [regStep, setRegStep] = useState<"form" | "code" | "password">("form");
  const [resetStep, setResetStep] = useState<"email" | "code_password">("email");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCity, setLoginCity] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Создание заявки
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ title: "", description: "", category: "", city: "", budget: "", contact_name: "", contact_phone: "", contact_email: "" });
  const [orderSent, setOrderSent] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [selectMasterLoading, setSelectMasterLoading] = useState<number | null>(null);

  const [reviewSuccess, setReviewSuccess] = useState("");

  // Смена пароля
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Редактирование профиля
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone");
    if (saved) loadProfile(saved);
  }, []);

  useEffect(() => {
    if (orderModalOpen && customer) {
      setOrderForm(f => ({ ...f, contact_name: customer.name, contact_phone: customer.phone, contact_email: customer.email }));
    }
    if (!orderModalOpen) { setOrderSent(false); setOrderError(""); }
  }, [orderModalOpen]);

  const loadProfile = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.customer) {
        setCustomer(parsed.customer);
        setOrders(parsed.orders || []);
        localStorage.setItem("customer_phone", parsed.customer.phone);
        setEditName(parsed.customer.name || "");
        setEditPhone(parsed.customer.phone || "");
        setEditEmail(parsed.customer.email || "");
        setEditCity(parsed.customer.city || "");
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
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth_login", email: loginIdentifier.includes("@") ? loginIdentifier : undefined, phone: !loginIdentifier.includes("@") ? loginIdentifier : undefined, password: loginPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        if (parsed.master_phone) localStorage.setItem("master_phone", parsed.master_phone);
        await loadProfile(parsed.user.phone);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email: loginEmail, phone: loginPhone, name: loginName, city: loginCity }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) {
        if (parsed.already_exists) setLoginMode("login");
        setLoginError(parsed.error);
        return;
      }
      if (parsed.success) setRegStep("code");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_code", email: loginEmail, code: regCode }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) setRegStep("password");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (regPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_password", email: loginEmail, password: regPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally { setLoginLoading(false); }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password_request", email: resetEmail }) });
      const d = await res.json();
      const parsed = typeof d === "string" ? JSON.parse(d) : d;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) setResetStep("code_password");
    } finally { setLoginLoading(false); }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword !== resetPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (resetPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password_confirm", email: resetEmail, code: resetCode, password: resetPassword }) });
      const d = await res.json();
      const parsed = typeof d === "string" ? JSON.parse(d) : d;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_phone");
    setCustomer(null);
    setOrders([]);
    setLoginIdentifier("");
    setLoginPassword("");
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true); setOrderError("");
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setOrderError(parsed.error); return; }
      setOrderSent(true);
      if (customer) await loadProfile(customer.phone);
    } finally { setOrderLoading(false); }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!customer) return;
    const res = await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_order", order_id: orderId, customer_id: customer.id }),
    });
    const data = await res.json();
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleUpdateOrder = async (orderId: number, data: { title: string; description: string; category: string; city: string; budget: string }) => {
    if (!customer) return;
    await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_order",
        order_id: orderId,
        customer_id: customer.id,
        title: data.title,
        description: data.description,
        category: data.category,
        city: data.city,
        budget: data.budget ? parseInt(data.budget) : null,
      }),
    });
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      title: data.title,
      description: data.description,
      category: data.category,
      city: data.city,
      budget: data.budget ? parseInt(data.budget) : null,
    } : o));
  };

  const handleSelectMaster = async (orderId: number, responseId: number) => {
    if (!customer) return;
    setSelectMasterLoading(responseId);
    await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select_master", order_id: orderId, response_id: responseId, customer_id: customer.id }),
    });
    await loadProfile(customer.phone);
    setSelectMasterLoading(null);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    if (!customer) return;
    setStatusLoading(orderId);
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, status, customer_id: customer.id }),
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    setStatusLoading(null);
  };

  const handleReview = async (
    e: React.FormEvent,
    form: { orderId: number; masterName: string; masterId: number | null },
    rating: number,
    comment: string,
  ) => {
    e.preventDefault();
    if (!customer) return;
    const res = await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "review",
        customer_id: customer.id,
        order_id: form.orderId,
        master_name: form.masterName,
        master_id: form.masterId,
        rating,
        comment,
      }),
    });
    const data = await res.json();
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.success) {
      setReviewSuccess("Отзыв отправлен!");
      await loadProfile(customer.phone);
      setTimeout(() => setReviewSuccess(""), 3000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setEditLoading(true); setEditError(""); setEditSuccess("");
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", customer_id: customer.id, name: editName, phone: editPhone, email: editEmail, city: editCity }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setEditError(d.error); return; }
      if (d.success && d.customer) {
        setCustomer(d.customer);
        localStorage.setItem("customer_phone", d.customer.phone);
        setEditSuccess("Профиль сохранён!");
        setTimeout(() => setEditSuccess(""), 3000);
      }
    } finally { setEditLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("Пароли не совпадают"); return; }
    if (pwNew.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", customer_id: customer?.id, old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setPwError(d.error); return; }
      setPwSuccess("Пароль изменён!");
      setPwOld(""); setPwNew(""); setPwConfirm("");
      setShowPwForm(false);
      setTimeout(() => setPwSuccess(""), 3000);
    } finally { setPwLoading(false); }
  };

  if (!customer && !loading) {
    return (
      <CabinetAuth
        loginMode={loginMode} setLoginMode={(m) => { setLoginMode(m); setLoginError(""); }}
        regStep={regStep} setRegStep={setRegStep}
        resetStep={resetStep} setResetStep={setResetStep}
        loginIdentifier={loginIdentifier} setLoginIdentifier={setLoginIdentifier}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        loginName={loginName} setLoginName={setLoginName}
        loginPhone={loginPhone} setLoginPhone={setLoginPhone}
        loginEmail={loginEmail} setLoginEmail={setLoginEmail}
        loginCity={loginCity} setLoginCity={setLoginCity}
        regCode={regCode} setRegCode={setRegCode}
        regPassword={regPassword} setRegPassword={setRegPassword}
        regPasswordConfirm={regPasswordConfirm} setRegPasswordConfirm={setRegPasswordConfirm}
        resetEmail={resetEmail} setResetEmail={setResetEmail}
        resetCode={resetCode} setResetCode={setResetCode}
        resetPassword={resetPassword} setResetPassword={setResetPassword}
        resetPasswordConfirm={resetPasswordConfirm} setResetPasswordConfirm={setResetPasswordConfirm}
        loginError={loginError} loginLoading={loginLoading}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onSetPassword={handleSetPassword}
        onResetRequest={handleResetRequest}
        onResetConfirm={handleResetConfirm}
      />
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
      <CabinetNav
        customer={customer!}
        showPwForm={showPwForm} setShowPwForm={setShowPwForm}
        pwOld={pwOld} setPwOld={setPwOld}
        pwNew={pwNew} setPwNew={setPwNew}
        pwConfirm={pwConfirm} setPwConfirm={setPwConfirm}
        pwLoading={pwLoading} pwError={pwError} setPwError={setPwError} pwSuccess={pwSuccess}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        onCreateOrder={() => setOrderModalOpen(true)}
        showEditProfile={showEditProfile} setShowEditProfile={setShowEditProfile}
        editName={editName} setEditName={setEditName}
        editPhone={editPhone} setEditPhone={setEditPhone}
        editEmail={editEmail} setEditEmail={setEditEmail}
        editCity={editCity} setEditCity={setEditCity}
        editLoading={editLoading} editError={editError} editSuccess={editSuccess}
        onSaveProfile={handleSaveProfile}
      />
      <OrderModal
        orderModalOpen={orderModalOpen}
        setOrderModalOpen={setOrderModalOpen}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        orderSent={orderSent}
        setOrderSent={setOrderSent}
        orderLoading={orderLoading}
        orderError={orderError}
        setOrderError={setOrderError}
        handleOrderSubmit={handleOrderSubmit}
      />
      <CabinetOrderList
        orders={orders}
        customer={customer!}
        reviewSuccess={reviewSuccess}
        statusLoading={statusLoading}
        selectMasterLoading={selectMasterLoading}
        onStatusChange={handleStatusChange}
        onSelectMaster={handleSelectMaster}
        onReviewSubmit={handleReview}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        onCreateOrder={() => setOrderModalOpen(true)}
      />
    </div>
  );
}