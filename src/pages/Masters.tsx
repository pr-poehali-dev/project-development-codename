import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import MastersFilters from "@/pages/masters/MastersFilters";
import ServicesGrid from "@/pages/masters/ServicesGrid";
import MastersGrid from "@/pages/masters/MastersGrid";
import ContactMasterModal from "@/pages/masters/ContactMasterModal";
import { Master, Service, ContactForm, ContactMasterTarget, MASTER_URL } from "@/pages/masters/types";

export default function Masters() {
  useSeoMeta(
    "Мастера и услуги — HandyMan",
    "Найдите проверенного мастера или услугу рядом с вами. Фильтр по городу и категории."
  );

  const initialParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialTab = initialParams?.get("tab");

  const [tab, setTab] = useState<"services" | "masters">(
    initialTab === "masters" ? "masters" : "services"
  );
  const [autoSwitchedTab, setAutoSwitchedTab] = useState(false);
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(initialParams?.get("city") || "");
  const [category, setCategory] = useState(initialParams?.get("category") || "");
  const [search, setSearch] = useState(initialParams?.get("search") || "");
  const [servicesVisible, setServicesVisible] = useState(20);

  const isMaster = typeof window !== "undefined" && !!localStorage.getItem("master_phone");
  const isCustomer = typeof window !== "undefined" && !!localStorage.getItem("customer_phone");

  const [contactMaster, setContactMaster] = useState<ContactMasterTarget | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>({ name: "", phone: "", email: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");

  const loadData = async (c: string, cat: string, s: string) => {
    setLoading(true);
    try {
      const mastersParams = new URLSearchParams({ action: "masters" });
      if (c) mastersParams.set("city", c);
      if (cat) mastersParams.set("category", cat);
      if (s) mastersParams.set("search", s);

      const servicesParams = new URLSearchParams({ action: "services" });
      if (c) servicesParams.set("city", c);
      if (cat) servicesParams.set("category", cat);

      const [mRes, sRes] = await Promise.all([
        fetch(`${MASTER_URL}?${mastersParams}`),
        fetch(`${MASTER_URL}?${servicesParams}`),
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      const mParsed = typeof mData === "string" ? JSON.parse(mData) : mData;
      const sParsed = typeof sData === "string" ? JSON.parse(sData) : sData;
      setMasters(mParsed.masters || []);
      setServices(sParsed.services || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(city, category, search);
    setServicesVisible(20);
  }, [city, category]);

  useEffect(() => {
    const t = setTimeout(() => { loadData(city, category, search); setServicesVisible(20); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (loading || autoSwitchedTab || !search) return;
    const filteredServicesCount = services.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.master_name.toLowerCase().includes(search.toLowerCase())
    ).length;
    const mastersCount = masters.filter(m => m.name).length;
    if (tab === "services" && filteredServicesCount === 0 && mastersCount > 0) {
      setTab("masters");
    } else if (tab === "masters" && mastersCount === 0 && filteredServicesCount > 0) {
      setTab("services");
    }
    setAutoSwitchedTab(true);
  }, [loading, services, masters, search]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMaster) return;
    setContactLoading(true); setContactError("");
    try {
      const res = await fetch(MASTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contact_master",
          master_id: contactMaster.id,
          service_id: contactMaster.serviceId,
          contact_name: contactForm.name,
          contact_phone: contactForm.phone,
          contact_email: contactForm.email,
          message: contactForm.message,
        }),
      });
      const data = await res.json();
      if (data.error) { setContactError(data.error); return; }
      setContactSent(true);
    } finally { setContactLoading(false); }
  };

  const shown = masters.filter(m => m.name);
  const filteredServices = search
    ? services.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.master_name.toLowerCase().includes(search.toLowerCase()))
    : services;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <Icon name="ChevronRight" size={16} className="text-gray-600" />
          <a href="/" className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg"
              alt="HandyMan"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              HandyMan
            </span>
          </a>
          <Icon name="ChevronRight" size={16} className="text-gray-600" />
          <span className="text-white text-sm">Каталог</span>
        </div>
      </nav>

      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Каталог</h1>
          <p className="text-gray-400 text-sm mb-6">Объявления мастеров и профили специалистов</p>

          {/* Табы */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
            <button
              onClick={() => setTab("services")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${tab === "services" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Icon name="Briefcase" size={14} className="inline mr-1.5 -mt-0.5" />
              Объявления
              {!loading && filteredServices.length > 0 && <span className="ml-1.5 text-xs opacity-70">{filteredServices.length}</span>}
            </button>
            <button
              onClick={() => setTab("masters")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${tab === "masters" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Icon name="Users" size={14} className="inline mr-1.5 -mt-0.5" />
              Мастера
              {!loading && shown.length > 0 && <span className="ml-1.5 text-xs opacity-70">{shown.length}</span>}
            </button>
          </div>

          {/* Фильтры */}
          <MastersFilters
            tab={tab}
            search={search}
            setSearch={setSearch}
            city={city}
            setCity={setCity}
            category={category}
            setCategory={setCategory}
          />

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : tab === "services" ? (
            <ServicesGrid
              filteredServices={filteredServices}
              servicesVisible={servicesVisible}
              setServicesVisible={setServicesVisible}
              isMaster={isMaster}
              isCustomer={isCustomer}
              setContactMaster={setContactMaster}
              setContactForm={setContactForm}
              setContactSent={setContactSent}
              setContactError={setContactError}
            />
          ) : (
            <MastersGrid shown={shown} />
          )}
        </div>
      </section>

      <ContactMasterModal
        contactMaster={contactMaster}
        setContactMaster={setContactMaster}
        contactForm={contactForm}
        setContactForm={setContactForm}
        contactLoading={contactLoading}
        contactSent={contactSent}
        contactError={contactError}
        handleContactSubmit={handleContactSubmit}
      />
    </div>
  );
}