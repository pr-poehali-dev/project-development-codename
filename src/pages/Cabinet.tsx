import { useState, useEffect } from "react";
import CabinetNav from "@/components/cabinet/CabinetNav";
import CabinetOrderList from "@/components/cabinet/CabinetOrderList";
import CabinetProfile from "@/components/cabinet/CabinetProfile";
import CustomerInquiries from "@/components/cabinet/CustomerInquiries";
import OrderModal from "@/components/home/OrderModal";
import CabinetAuthView from "@/pages/cabinet/CabinetAuthView";
import CabinetTabs from "@/pages/cabinet/CabinetTabs";
import { useCabinetAuth } from "@/pages/cabinet/useCabinetAuth";
import { useCabinetOrders } from "@/pages/cabinet/useCabinetOrders";
import { useCabinetProfile } from "@/pages/cabinet/useCabinetProfile";
import { useCustomerProfile } from "@/pages/cabinet/useCustomerProfile";
import { useInquiryPolling } from "@/pages/cabinet/useInquiryPolling";

export default function Cabinet() {
  const {
    customer,
    setCustomer,
    orders,
    setOrders,
    loading,
    loadProfile,
    setEditFieldSetters,
  } = useCustomerProfile();

  const [cabinetTab, setCabinetTab] = useState<"orders" | "inquiries" | "profile">(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "chats" || t === "inquiries") return "inquiries";
    if (t === "profile") return "profile";
    return "orders";
  });

  const auth = useCabinetAuth({ loadProfile, setCustomer, setOrders });
  const orders_ = useCabinetOrders({ customer, orders, setOrders, loadProfile });
  const profile = useCabinetProfile({ customer, setCustomer });

  const { inquiryCount, unreadMessages, setInquiryCount, setUnreadMessages } = useInquiryPolling(customer);

  useEffect(() => {
    setEditFieldSetters({
      setEditName: profile.setEditName,
      setEditPhone: profile.setEditPhone,
      setEditEmail: profile.setEditEmail,
      setEditCity: profile.setEditCity,
    });
  }, [profile.setEditName, profile.setEditPhone, profile.setEditEmail, profile.setEditCity]);

  useEffect(() => {
    if (orders_.orderModalOpen && customer) {
      orders_.setOrderForm(f => ({ ...f, contact_name: customer.name, contact_phone: customer.phone, contact_email: customer.email, city: f.city || customer.city || "" }));
    }
    if (!orders_.orderModalOpen) { orders_.setOrderSent(false); orders_.setOrderError(""); }
  }, [orders_.orderModalOpen]);

  if (!customer && !loading) {
    return <CabinetAuthView auth={auth} />;
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

      <CabinetTabs
        cabinetTab={cabinetTab}
        setCabinetTab={setCabinetTab}
        ordersCount={orders.length}
        inquiryCount={inquiryCount}
        unreadMessages={unreadMessages}
      />

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
          onSwitchToInquiries={() => setCabinetTab("inquiries")}
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

      {cabinetTab === "profile" && (
        <CabinetProfile
          customer={customer!}
          onCustomerUpdate={(updated) => {
            setCustomer(updated);
            localStorage.setItem("customer_phone", updated.phone);
            localStorage.setItem("customer_profile", JSON.stringify({ name: updated.name, phone: updated.phone, email: updated.email }));
          }}
        />
      )}
    </div>
  );
}
