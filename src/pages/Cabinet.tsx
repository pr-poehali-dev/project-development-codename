import { useState, useEffect, useCallback } from "react";
import CabinetAuth from "@/components/cabinet/CabinetAuth";
import CabinetNav from "@/components/cabinet/CabinetNav";
import CabinetOrderList from "@/components/cabinet/CabinetOrderList";
import CustomerInquiries from "@/components/cabinet/CustomerInquiries";
import OrderModal from "@/components/home/OrderModal";
import Icon from "@/components/ui/icon";
import { useCabinetAuth } from "@/pages/cabinet/useCabinetAuth";
import { useCabinetOrders } from "@/pages/cabinet/useCabinetOrders";
import { useCabinetProfile } from "@/pages/cabinet/useCabinetProfile";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

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
  const [cabinetTab, setCabinetTab] = useState<"orders" | "inquiries">("orders");
  const [inquiryCount, setInquiryCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [editFieldSetters, setEditFieldSetters] = useState<{
    setEditName: (v: string) => void;
    setEditPhone: (v: string) => void;
    setEditEmail: (v: string) => void;
    setEditCity: (v: string) => void;
  } | null>(null);

  const loadProfile = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.customer) {
        setCustomer(parsed.customer);
        setOrders(parsed.orders || []);
        localStorage.setItem("customer_phone", parsed.customer.phone);
        if (editFieldSetters) {
          editFieldSetters.setEditName(parsed.customer.name || "");
          editFieldSetters.setEditPhone(parsed.customer.phone || "");
          editFieldSetters.setEditEmail(parsed.customer.email || "");
          editFieldSetters.setEditCity(parsed.customer.city || "");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [editFieldSetters]);

  const auth = useCabinetAuth({ loadProfile, setCustomer, setOrders });
  const orders_ = useCabinetOrders({ customer, orders, setOrders, loadProfile });
  const profile = useCabinetProfile({ customer, setCustomer });

  useEffect(() => {
    setEditFieldSetters({
      setEditName: profile.setEditName,
      setEditPhone: profile.setEditPhone,
      setEditEmail: profile.setEditEmail,
      setEditCity: profile.setEditCity,
    });
  }, [profile.setEditName, profile.setEditPhone, profile.setEditEmail, profile.setEditCity]);

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone");
    if (saved) loadProfile(saved);
  }, []);

  useEffect(() => {
    if (orders_.orderModalOpen && customer) {
      orders_.setOrderForm(f => ({ ...f, contact_name: customer.name, contact_phone: customer.phone, contact_email: customer.email, city: f.city || customer.city || "" }));
    }
    if (!orders_.orderModalOpen) { orders_.setOrderSent(false); orders_.setOrderError(""); }
  }, [orders_.orderModalOpen]);

  // Polling: счётчик обращений + непрочитанных сообщений каждые 15 сек
  useEffect(() => {
    if (!customer) return;
    const poll = async () => {
      try {
        const res = await fetch(MY_ORDERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_customer_inquiries", customer_email: customer.email, customer_phone: customer.phone }),
        });
        const data = await res.json();
        const inqs: { id: number }[] = data.inquiries || [];
        setInquiryCount(inqs.length);
        // Считаем непрочитанные сообщения от мастеров по всем чатам
        let totalUnread = 0;
        await Promise.all(inqs.map(async (inq) => {
          try {
            const r = await fetch(`${MY_ORDERS_URL}?inquiry_id=${inq.id}`);
            const d = await r.json();
            const msgs: { id: number; sender_role: string }[] = d.messages || [];
            const lastSeen = parseInt(localStorage.getItem(`chat_last_seen_${inq.id}`) || "0", 10);
            totalUnread += msgs.filter(m => m.sender_role === "master" && m.id > lastSeen).length;
          } catch { /* игнор */ }
        }));
        setUnreadMessages(totalUnread);
      } catch { /* игнорируем */ }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [customer?.id]);

  if (!customer && !loading) {
    return (
      <CabinetAuth
        loginMode={auth.loginMode} setLoginMode={auth.setLoginMode}
        regStep={auth.regStep} setRegStep={auth.setRegStep}
        resetStep={auth.resetStep} setResetStep={auth.setResetStep}
        loginIdentifier={auth.loginIdentifier} setLoginIdentifier={auth.setLoginIdentifier}
        loginPassword={auth.loginPassword} setLoginPassword={auth.setLoginPassword}
        loginName={auth.loginName} setLoginName={auth.setLoginName}
        loginPhone={auth.loginPhone} setLoginPhone={auth.setLoginPhone}
        loginEmail={auth.loginEmail} setLoginEmail={auth.setLoginEmail}
        loginCity={auth.loginCity} setLoginCity={auth.setLoginCity}
        regCode={auth.regCode} setRegCode={auth.setRegCode}
        regPassword={auth.regPassword} setRegPassword={auth.setRegPassword}
        regPasswordConfirm={auth.regPasswordConfirm} setRegPasswordConfirm={auth.setRegPasswordConfirm}
        resetEmail={auth.resetEmail} setResetEmail={auth.setResetEmail}
        resetCode={auth.resetCode} setResetCode={auth.setResetCode}
        resetPassword={auth.resetPassword} setResetPassword={auth.setResetPassword}
        resetPasswordConfirm={auth.resetPasswordConfirm} setResetPasswordConfirm={auth.setResetPasswordConfirm}
        loginError={auth.loginError} loginLoading={auth.loginLoading}
        onLogin={auth.handleLogin}
        onRegister={auth.handleRegister}
        onVerifyCode={auth.handleVerifyCode}
        onSetPassword={auth.handleSetPassword}
        onResetRequest={auth.handleResetRequest}
        onResetConfirm={auth.handleResetConfirm}
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
        showPwForm={profile.showPwForm} setShowPwForm={profile.setShowPwForm}
        pwOld={profile.pwOld} setPwOld={profile.setPwOld}
        pwNew={profile.pwNew} setPwNew={profile.setPwNew}
        pwConfirm={profile.pwConfirm} setPwConfirm={profile.setPwConfirm}
        pwLoading={profile.pwLoading} pwError={profile.pwError} setPwError={profile.setPwError} pwSuccess={profile.pwSuccess}
        onChangePassword={profile.handleChangePassword}
        onLogout={auth.handleLogout}
        onCreateOrder={() => orders_.setOrderModalOpen(true)}
        showEditProfile={profile.showEditProfile} setShowEditProfile={profile.setShowEditProfile}
        editName={profile.editName} setEditName={profile.setEditName}
        editPhone={profile.editPhone} setEditPhone={profile.setEditPhone}
        editEmail={profile.editEmail} setEditEmail={profile.setEditEmail}
        editCity={profile.editCity} setEditCity={profile.setEditCity}
        editLoading={profile.editLoading} editError={profile.editError} editSuccess={profile.editSuccess}
        onSaveProfile={profile.handleSaveProfile}
      />
      <OrderModal
        orderModalOpen={orders_.orderModalOpen}
        setOrderModalOpen={orders_.setOrderModalOpen}
        orderForm={orders_.orderForm}
        setOrderForm={orders_.setOrderForm}
        orderSent={orders_.orderSent}
        setOrderSent={orders_.setOrderSent}
        orderLoading={orders_.orderLoading}
        orderError={orders_.orderError}
        setOrderError={orders_.setOrderError}
        handleOrderSubmit={orders_.handleOrderSubmit}
      />
      {/* Переключатель вкладок */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setCabinetTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cabinetTab === "orders" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
          >
            <Icon name="ClipboardList" size={15} />
            Мои заявки
            {orders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${cabinetTab === "orders" ? "bg-white/20" : "bg-white/10"}`}>{orders.length}</span>}
          </button>
          <button
            onClick={() => setCabinetTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cabinetTab === "inquiries" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
          >
            <Icon name="MessageSquare" size={15} />
            Мои обращения
            {unreadMessages > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-medium">{unreadMessages}</span>
            )}
            {unreadMessages === 0 && inquiryCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${cabinetTab === "inquiries" ? "bg-white/20" : "bg-white/10"}`}>{inquiryCount}</span>
            )}
          </button>
        </div>
      </div>

      {cabinetTab === "orders" && (
        <CabinetOrderList
          orders={orders}
          customer={customer!}
          reviewSuccess={orders_.reviewSuccess}
          statusLoading={orders_.statusLoading}
          selectMasterLoading={orders_.selectMasterLoading}
          onStatusChange={orders_.handleStatusChange}
          onSelectMaster={orders_.handleSelectMaster}
          onReviewSubmit={orders_.handleReview}
          onUpdateOrder={orders_.handleUpdateOrder}
          onDeleteOrder={orders_.handleDeleteOrder}
          onCreateOrder={() => orders_.setOrderModalOpen(true)}
        />
      )}

      {cabinetTab === "inquiries" && (
        <CustomerInquiries
          customerName={customer!.name}
          customerEmail={customer!.email}
          customerPhone={customer!.phone}
          onUnreadChange={(count) => { setUnreadMessages(count); setInquiryCount(prev => prev); }}
        />
      )}
    </div>
  );
}