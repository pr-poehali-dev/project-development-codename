import { useState, useEffect, useCallback } from "react";
import CabinetAuth from "@/components/cabinet/CabinetAuth";
import CabinetNav from "@/components/cabinet/CabinetNav";
import CabinetOrderList from "@/components/cabinet/CabinetOrderList";
import OrderModal from "@/components/home/OrderModal";
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
    </div>
  );
}
