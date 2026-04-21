import { useState } from "react";
import MasterLoginForm from "@/pages/master-cabinet/MasterLoginForm";
import MasterCabinetHeader from "@/pages/master-cabinet/MasterCabinetHeader";
import MasterCabinetContent from "@/pages/master-cabinet/MasterCabinetContent";
import MasterCabinetLoader from "@/pages/master-cabinet/MasterCabinetLoader";
import { useMasterProfile } from "@/pages/master-cabinet/useMasterProfile";
import { useMasterServices } from "@/pages/master-cabinet/useMasterServices";
import { useMasterProfileEdit } from "@/pages/master-cabinet/useMasterProfileEdit";
import { useMasterPayments } from "@/pages/master-cabinet/useMasterPayments";
import { useMasterCabinetInit } from "@/pages/master-cabinet/useMasterCabinetInit";
import { MasterTab, getInitialTab } from "@/pages/master-cabinet/masterCabinetTypes";

export default function MasterCabinet() {
  const [tab, setTab] = useState<MasterTab>(getInitialTab());

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

  useMasterCabinetInit({
    setPhone: profile.setPhone,
    setInputPhone: profile.setInputPhone,
    loadProfile: profile.loadProfile,
    loadPackages: payments.loadPackages,
    checkPayment: payments.checkPayment,
  });

  if (!profile.master && !profile.loading) {
    return (
      <MasterLoginForm
        onLogin={(p) => { profile.setPhone(p); profile.setInputPhone(p); profile.loadProfile(p); }}
      />
    );
  }

  if (profile.loading) {
    return <MasterCabinetLoader />;
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

      <MasterCabinetContent
        tab={tab}
        profile={profile}
        services={services}
        edit={edit}
        payments={payments}
      />
    </div>
  );
}
