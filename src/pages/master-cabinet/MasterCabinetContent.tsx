import MasterTabBalance from "@/pages/master-cabinet/MasterTabBalance";
import MasterTabServices from "@/pages/master-cabinet/MasterTabServices";
import MasterTabOther from "@/pages/master-cabinet/MasterTabOther";
import MasterTabInquiries from "@/pages/master-cabinet/MasterTabInquiries";
import MasterTabReferral from "@/pages/master-cabinet/MasterTabReferral";
import { useMasterProfile } from "@/pages/master-cabinet/useMasterProfile";
import { useMasterServices } from "@/pages/master-cabinet/useMasterServices";
import { useMasterProfileEdit } from "@/pages/master-cabinet/useMasterProfileEdit";
import { useMasterPayments } from "@/pages/master-cabinet/useMasterPayments";
import { MasterTab } from "./masterCabinetTypes";

type ProfileReturn = ReturnType<typeof useMasterProfile>;
type ServicesReturn = ReturnType<typeof useMasterServices>;
type EditReturn = ReturnType<typeof useMasterProfileEdit>;
type PaymentsReturn = ReturnType<typeof useMasterPayments>;

interface MasterCabinetContentProps {
  tab: MasterTab;
  profile: ProfileReturn;
  services: ServicesReturn;
  edit: EditReturn;
  payments: PaymentsReturn;
}

export default function MasterCabinetContent({ tab, profile, services, edit, payments }: MasterCabinetContentProps) {
  return (
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
        <MasterTabInquiries inquiries={profile.inquiries} masterName={profile.master!.name} masterId={profile.master!.id} onRefresh={() => profile.loadProfile(profile.phone)} />
      )}

      {tab === "referral" && (
        <MasterTabReferral masterId={profile.master!.id} />
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
          onMasterUpdate={profile.setMaster}
          pwOld={edit.pwOld} setPwOld={edit.setPwOld}
          pwNew={edit.pwNew} setPwNew={edit.setPwNew}
          pwConfirm={edit.pwConfirm} setPwConfirm={edit.setPwConfirm}
          pwLoading={edit.pwLoading} pwError={edit.pwError} pwSuccess={edit.pwSuccess}
          onChangePassword={edit.handleChangePassword}
        />
      )}
    </div>
  );
}
