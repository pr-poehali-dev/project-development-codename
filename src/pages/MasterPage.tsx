import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import MasterPageHeader from "@/pages/master-page/MasterPageHeader";
import MasterProfileCard from "@/pages/master-page/MasterProfileCard";
import MasterServicesList from "@/pages/master-page/MasterServicesList";
import MasterReviewsList from "@/pages/master-page/MasterReviewsList";
import ContactMasterDialog from "@/pages/master-page/ContactMasterDialog";
import AuthPromptDialog from "@/pages/master-page/AuthPromptDialog";
import { useMasterPageData } from "@/pages/master-page/useMasterPageData";
import { useContactMasterForm } from "@/pages/master-page/useContactMasterForm";

export default function MasterPage() {
  const { master, rating, reviewsTotal, reviews, services, loading, notFound } = useMasterPageData();

  const isAuth = typeof window !== "undefined" && (!!localStorage.getItem("customer_phone") || !!localStorage.getItem("master_phone"));
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const contact = useContactMasterForm(master);

  if (loading) return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Мастер не найден</p>
        <a href="/" className="text-violet-400 hover:text-violet-300">← На главную</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <MasterPageHeader />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <MasterProfileCard master={master!} rating={rating} reviewsTotal={reviewsTotal} />

        <MasterServicesList services={services} />

        {/* Кнопка — написать мастеру */}
        <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Нужна помощь {master?.name?.split(" ")[0]}?</p>
            <p className="text-gray-400 text-sm mt-0.5">Напишите напрямую — мастер получит уведомление</p>
          </div>
          <Button
            onClick={() => {
              if (!isAuth) { setAuthPromptOpen(true); return; }
              contact.setContactOpen(true); contact.setContactSent(false); contact.setContactError("");
            }}
            className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            <Icon name="MessageSquare" size={15} className="mr-2" />
            Написать мастеру
          </Button>
        </div>

        <ContactMasterDialog
          master={master!}
          contactOpen={contact.contactOpen}
          setContactOpen={contact.setContactOpen}
          contactForm={contact.contactForm}
          setContactForm={contact.setContactForm}
          contactLoading={contact.contactLoading}
          contactSent={contact.contactSent}
          contactError={contact.contactError}
          handleContactSubmit={contact.handleContactSubmit}
        />

        <AuthPromptDialog
          authPromptOpen={authPromptOpen}
          setAuthPromptOpen={setAuthPromptOpen}
        />

        <MasterReviewsList reviews={reviews} reviewsTotal={reviewsTotal} />
      </div>
    </div>
  );
}
