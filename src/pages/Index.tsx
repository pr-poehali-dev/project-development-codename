import { useState, useEffect } from "react";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeHeroStats from "@/components/home/HomeHeroStats";
import HomeCategoriesServices from "@/components/home/HomeCategoriesServices";
import HomeModals from "@/components/home/HomeModals";
import HomeCtaBanner from "@/pages/home/HomeCtaBanner";
import HomePricing from "@/pages/home/HomePricing";
import HomeBottomCta from "@/pages/home/HomeBottomCta";
import HomeFooter from "@/pages/home/HomeFooter";
import ScrollToTopButton from "@/pages/home/ScrollToTopButton";
import { useHomePwaInstall } from "@/pages/home/useHomePwaInstall";
import { useHomeMasterForm, useHomeOrderForm } from "@/pages/home/useHomeForms";
import { MASTER_URL, Service } from "@/pages/home/homeTypes";

const Index = () => {
  useSeoMeta(
    "HandyMan — маркетплейс бытовых услуг",
    "Найдите мастера для ремонта, сантехники, электрики, клининга и других бытовых услуг. Быстро, удобно, надёжно."
  );

  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedCity, setSelectedCityFilter] = useState("");
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const masterFormState = useHomeMasterForm();
  const orderFormState = useHomeOrderForm();
  const { installPrompt, isInstalled, handleInstall } = useHomePwaInstall();

  const loadServices = async (category: string, city: string) => {
    setServicesLoading(true);
    try {
      const params = new URLSearchParams({ action: "services" });
      if (category && category !== "Все") params.set("category", category);
      if (city) params.set("city", city);
      const res = await fetch(`${MASTER_URL}?${params}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setServices(parsed.services || []);
      setAvailableCities(parsed.cities || []);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => { loadServices(activeCategory, selectedCity); }, [activeCategory, selectedCity]);

  const [isMaster] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("master_phone"));
  const [isCustomer] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("customer_phone"));
  const [masterBannerDismissed, setMasterBannerDismissed] = useState(
    typeof window !== "undefined" && localStorage.getItem("master_banner_dismissed") === "1"
  );

  const openOrderModal = () => {
    if (!isCustomer && !isMaster) { setLoginModalOpen(true); return; }
    orderFormState.setOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <HomeNavbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        installPrompt={installPrompt}
        isInstalled={isInstalled}
        handleInstall={handleInstall}
        isMaster={isMaster}
        isCustomer={isCustomer}
        masterBannerDismissed={masterBannerDismissed}
        setMasterBannerDismissed={setMasterBannerDismissed}
        setRegisterModalOpen={setRegisterModalOpen}
        setMasterModalOpen={masterFormState.setMasterModalOpen}
        setLoginModalOpen={setLoginModalOpen}
      />

      {!isMaster && (
        <HomeCtaBanner
          onBecomeMaster={() => masterFormState.setMasterModalOpen(true)}
          onFindMaster={openOrderModal}
        />
      )}

      <HomeHeroStats onSearch={(query, city) => { setHeroSearchQuery(query); if (city) setSelectedCityFilter(city); }} />

      <HomeCategoriesServices />

      <HomePricing />

      {!isMaster && (
        <HomeBottomCta
          onBecomeMaster={() => masterFormState.setMasterModalOpen(true)}
          onFindMaster={openOrderModal}
        />
      )}

      <HomeFooter isCustomer={isCustomer} />

      <ScrollToTopButton />

      <HomeModals
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        registerModalOpen={registerModalOpen}
        setRegisterModalOpen={setRegisterModalOpen}
        masterModalOpen={masterFormState.masterModalOpen}
        setMasterModalOpen={masterFormState.setMasterModalOpen}
        masterForm={masterFormState.masterForm}
        setMasterForm={masterFormState.setMasterForm}
        masterSent={masterFormState.masterSent}
        setMasterSent={masterFormState.setMasterSent}
        masterLoading={masterFormState.masterLoading}
        masterError={masterFormState.masterError}
        handleMasterSubmit={masterFormState.handleMasterSubmit}
        orderModalOpen={orderFormState.orderModalOpen}
        setOrderModalOpen={orderFormState.setOrderModalOpen}
        orderForm={orderFormState.orderForm}
        setOrderForm={orderFormState.setOrderForm}
        orderSent={orderFormState.orderSent}
        setOrderSent={orderFormState.setOrderSent}
        orderLoading={orderFormState.orderLoading}
        orderError={orderFormState.orderError}
        setOrderError={orderFormState.setOrderError}
        handleOrderSubmit={orderFormState.handleOrderSubmit}
      />
    </div>
  );
};

export default Index;
