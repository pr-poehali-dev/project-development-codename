import { useState, useEffect } from "react";
import MasterLoginForm from "@/pages/master-cabinet/MasterLoginForm";
import MasterCabinetHeader from "@/pages/master-cabinet/MasterCabinetHeader";
import MasterTabBalance from "@/pages/master-cabinet/MasterTabBalance";
import MasterTabServices from "@/pages/master-cabinet/MasterTabServices";
import MasterTabOther from "@/pages/master-cabinet/MasterTabOther";
import MasterTabInquiries from "@/pages/master-cabinet/MasterTabInquiries";
import { useMasterProfile } from "@/pages/master-cabinet/useMasterProfile";
import { useMasterServices } from "@/pages/master-cabinet/useMasterServices";
import { useMasterProfileEdit } from "@/pages/master-cabinet/useMasterProfileEdit";
import { useMasterPayments } from "@/pages/master-cabinet/useMasterPayments";

const initialTab = new URLSearchParams(window.location.search).get("tab");
const initialPaymentId = new URLSearchParams(window.location.search).get("payment_id");

export default function MasterCabinet() {
  const [tab, setTab] = useState<"balance" | "history" | "responses" | "services" | "profile" | "inquiries">(
    initialTab === "services" || initialTab === "responses" || initialTab === "history" || initialTab === "profile" || initialTab === "inquiries"
      ? initialTab as "services" | "responses" | "history" | "profile" | "inquiries"
      : "balance"
  );

  const profile = useMasterProfile();

  const edit = useMasterProfileEdit({
    master: profile.master,
    setMaster: profile.setMaster,
    editName: profile.editName, setEditName: profile.setEditName,
    editCity: profile.editCity, setEditCity: profile.setEditCity,
    editAbout: profile.editAbout, setEditAbout: profile.setEditAbout,
    editCategories: profile.editCategories, setEditCategories: profile.setEditCategories,
  });

  const services = useMasterServices({
    master: profile.master,
    phone: profile.phone,
    setMyServices: profile.setMyServices,
    setMaster: profile.setMaster,
    loadProfile: profile.loadProfile,
  });

  const payments = useMasterPayments({
    master: profile.master,
    phone: profile.phone,
    loadProfile: profile.loadProfile,
  });

  useEffect(() => {
    const saved = localStorage.getItem("master_phone");
    if (saved) {
      profile.setPhone(saved);
      profile.setInputPhone(saved);
      profile.loadProfile(saved).then(() => {
        if (initialPaymentId) payments.checkPayment(initialPaymentId, saved);
      });
    }
    payments.loadPackages();
  }, []);

  if (!profile.master && !profile.loading) {
    return (
      <MasterLoginForm
        onLogin={(p) => { profile.setPhone(p); profile.setInputPhone(p); profile.loadProfile(p); }}
      />
    );
  }

  if (profile.loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <MasterCabinetHeader
        master={profile.master!}
        tab={tab}
        setTab={(t) => {
          setTab(t);
          if (t === "inquiries" && profile.unreadInquiries > 0) {
            profile.markInquiriesRead();
          }
        }}
        myServices={profile.myServices}
        myResponses={profile.myResponses}
        unreadInquiries={profile.unreadInquiries}
        buySuccess={payments.buySuccess}
        serviceSuccess={services.serviceSuccess}
        serviceError={services.serviceError}
        onLogout={profile.handleLogout}
      />

      <div className="max-w-3xl mx-auto px-4 pb-8">
        {tab === "balance" && (
          <MasterTabBalance
            packages={payments.packages}
            buyingId={payments.buyingId}
            onBuy={payments.handleBuy}
            paymentChecking={payments.paymentChecking}
            checkoutToken={payments.checkoutToken}
            onCheckoutSuccess={payments.handleCheckoutSuccess}
            onCheckoutClose={() => payments.setCheckoutToken(null)}
          />
        )}

        {tab === "services" && (
          <MasterTabServices
            master={profile.master!}
            myServices={profile.myServices}
            showServiceForm={services.showServiceForm}
            setShowServiceForm={services.setShowServiceForm}
            serviceForm={services.serviceForm}
            setServiceForm={services.setServiceForm}
            serviceLoading={services.serviceLoading}
            onAddService={services.handleAddService}
            onToggleService={services.handleToggleService}
            onBoostService={services.handleBoostService}
            onRenewService={services.handleRenewService}
            onUpdateService={services.handleUpdateService}
            onDeleteService={services.handleDeleteService}
          />
        )}

        {tab === "inquiries" && (
          <MasterTabInquiries inquiries={profile.inquiries} />
        )}

        {(tab === "responses" || tab === "history" || tab === "profile") && (
          <MasterTabOther
            tab={tab}
            master={profile.master!}
            transactions={profile.transactions}
            myResponses={profile.myResponses}
            editName={profile.editName} setEditName={profile.setEditName}
            editCity={profile.editCity} setEditCity={profile.setEditCity}
            editAbout={profile.editAbout} setEditAbout={profile.setEditAbout}
            editCategories={profile.editCategories} setEditCategories={profile.setEditCategories}
            profileLoading={edit.profileLoading} profileSuccess={edit.profileSuccess}
            onSaveProfile={edit.handleSaveProfile}
            pwOld={edit.pwOld} setPwOld={edit.setPwOld}
            pwNew={edit.pwNew} setPwNew={edit.setPwNew}
            pwConfirm={edit.pwConfirm} setPwConfirm={edit.setPwConfirm}
            pwLoading={edit.pwLoading} pwError={edit.pwError} pwSuccess={edit.pwSuccess}
            onChangePassword={edit.handleChangePassword}
          />
        )}
      </div>
    </div>
  );
}
