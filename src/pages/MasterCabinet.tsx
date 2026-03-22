import { useState, useEffect } from "react";
import MasterLoginForm from "@/pages/master-cabinet/MasterLoginForm";
import MasterCabinetHeader from "@/pages/master-cabinet/MasterCabinetHeader";
import MasterTabBalance from "@/pages/master-cabinet/MasterTabBalance";
import MasterTabServices from "@/pages/master-cabinet/MasterTabServices";
import MasterTabOther from "@/pages/master-cabinet/MasterTabOther";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
const PACKAGES_URL = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";
const PAYMENTS_URL = "https://functions.poehali.dev/cad10a69-4b34-4497-960c-f6026044d2f8";

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  categories: string[];
  city: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: number;
  type: "purchase" | "spend";
  amount: number;
  description: string;
  created_at: string;
}

interface MyResponse {
  id: number;
  order_id: number;
  order_title: string;
  order_category: string;
  order_status: string;
  order_city: string;
  message: string;
  created_at: string;
}

interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

interface Package {
  id: number;
  name: string;
  responses_count: number;
  price: number;
}

export default function MasterCabinet() {
  const [phone, setPhone] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [master, setMaster] = useState<Master | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myResponses, setMyResponses] = useState<MyResponse[]>([]);
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buySuccess, setBuySuccess] = useState("");
  const [paymentChecking, setPaymentChecking] = useState(false);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<number | null>(null);
  const initialTab = new URLSearchParams(window.location.search).get("tab");
  const initialPaymentId = new URLSearchParams(window.location.search).get("payment_id");
  const [tab, setTab] = useState<"balance" | "history" | "responses" | "services" | "profile">(
    initialTab === "services" || initialTab === "responses" || initialTab === "history" || initialTab === "profile" ? initialTab as "services" | "responses" | "history" | "profile" : "balance"
  );

  // Смена пароля
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Редактирование профиля
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", category: "", city: "", price: "" });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [serviceError, setServiceError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("master_phone");
    if (saved) {
      setPhone(saved);
      setInputPhone(saved);
      loadProfile(saved).then(() => {
        if (initialPaymentId) {
          checkPayment(initialPaymentId, saved);
        }
      });
    }
    loadPackages();
  }, []);

  const checkPayment = async (paymentId: string, masterPhone: string) => {
    setPaymentChecking(true);
    try {
      const res = await fetch(`${PAYMENTS_URL}?action=check&payment_id=${paymentId}`);
      const data = await res.json();
      if (data.status === "succeeded") {
        setBuySuccess(`Оплата прошла! Зачислено ${data.tokens} токенов.`);
        await loadProfile(masterPhone);
        setTimeout(() => setBuySuccess(""), 6000);
      } else if (data.status === "canceled") {
        setBuySuccess("Оплата отменена.");
        setTimeout(() => setBuySuccess(""), 4000);
      }
    } finally {
      setPaymentChecking(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("payment_id");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const loadPackages = async () => {
    const res = await fetch(PACKAGES_URL);
    const data = await res.json();
    setPackages(data.packages || []);
  };

  const loadProfile = async (p: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PROFILE_URL}?phone=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data.not_found) {
        setError("Мастер не найден. Сначала зарегистрируйтесь на главной странице.");
        setMaster(null);
      } else {
        setMaster(data.master);
        setTransactions(data.transactions || []);
        setMyResponses(data.my_responses || []);
        setMyServices(data.my_services || []);
        localStorage.setItem("master_phone", p);
        setEditName(data.master?.name || "");
        setEditCity(data.master?.city || "");
        setEditAbout(data.master?.about || "");
        setEditCategories(data.master?.categories?.length ? data.master.categories : (data.master?.category ? [data.master.category] : []));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone.trim()) return;
    setPhone(inputPhone.trim());
    loadProfile(inputPhone.trim());
  };

  const handleBuy = async (pkg: Package) => {
    if (!master) return;
    setBuyingId(pkg.id);
    setBuySuccess("");
    try {
      const res = await fetch(PAYMENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          master_id: master.id,
          package_id: pkg.id,
        }),
      });
      const data = await res.json();
      if (data.confirmation_token) {
        setCheckoutToken(data.confirmation_token);
        setCheckoutPaymentId(data.payment_id);
      } else {
        setBuySuccess("Ошибка при создании платежа. Попробуй ещё раз.");
        setTimeout(() => setBuySuccess(""), 4000);
      }
    } finally {
      setBuyingId(null);
    }
  };

  const handleCheckoutSuccess = async () => {
    setCheckoutToken(null);
    if (checkoutPaymentId) {
      setPaymentChecking(true);
      try {
        const res = await fetch(`${PAYMENTS_URL}?action=check&payment_id=${checkoutPaymentId}`);
        const data = await res.json();
        if (data.status === "succeeded") {
          setBuySuccess(`Оплата прошла! Зачислено ${data.tokens} токенов.`);
          await loadProfile(phone);
          setTimeout(() => setBuySuccess(""), 6000);
        }
      } finally {
        setPaymentChecking(false);
        setCheckoutPaymentId(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("master_phone");
    setMaster(null);
    setPhone("");
    setInputPhone("");
    setTransactions([]);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!master) return;
    setServiceLoading(true);
    const res = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_service",
        master_id: master.id,
        title: serviceForm.title,
        description: serviceForm.description,
        category: serviceForm.category || master.category,
        city: serviceForm.city || master.city,
        price: serviceForm.price ? Number(serviceForm.price) : null,
      }),
    });
    const data = await res.json();
    setServiceLoading(false);
    if (data.success) {
      setServiceSuccess("Услуга опубликована!");
      setShowServiceForm(false);
      setServiceForm({ title: "", description: "", category: "", city: "", price: "" });
      localStorage.removeItem("master_banner_dismissed");
      await loadProfile(phone);
      setTimeout(() => setServiceSuccess(""), 3000);
    }
  };

  const handleToggleService = async (serviceId: number, isActive: boolean) => {
    if (!master) return;
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_service", service_id: serviceId, master_id: master.id, is_active: isActive }),
    });
    setMyServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: isActive } : s));
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!master) return;
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_service", service_id: serviceId, master_id: master.id }),
    });
    setMyServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateService = async (serviceId: number, data: { title: string; description: string; category: string; city: string; price: string }) => {
    if (!master) return;
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_service",
        service_id: serviceId,
        master_id: master.id,
        title: data.title,
        description: data.description,
        category: data.category,
        city: data.city,
        price: data.price ? Number(data.price) : null,
      }),
    });
    setMyServices(prev => prev.map(s => s.id === serviceId ? {
      ...s,
      title: data.title,
      description: data.description,
      category: data.category,
      city: data.city,
      price: data.price ? Number(data.price) : null,
    } : s));
    setServiceSuccess("Услуга обновлена!");
    setTimeout(() => setServiceSuccess(""), 3000);
  };

  const handleBoostService = async (serviceId: number) => {
    if (!master) return;
    const res = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "boost_service", service_id: serviceId, master_id: master.id }),
    });
    const data = await res.json();
    if (data.success) {
      const boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      setMyServices(prev => prev.map(s => s.id === serviceId ? { ...s, boosted_until: boostedUntil, boost_count: s.boost_count + 1 } : s));
      setMaster(m => m ? { ...m, balance: m.balance - 100 } : m);
      setServiceSuccess("Услуга поднята в топ на 7 дней!");
      setTimeout(() => setServiceSuccess(""), 3000);
    } else if (data.no_balance) {
      setServiceError(data.error || "Недостаточно токенов. Нужно 100 токенов.");
      setTimeout(() => setServiceError(""), 4000);
    } else {
      setServiceError(data.error || "Ошибка при поднятии в топ");
      setTimeout(() => setServiceError(""), 4000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileSuccess("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", master_id: master?.id, name: editName, city: editCity, about: editAbout, categories: editCategories }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.success && d.master) {
        setMaster(d.master);
        setEditName(d.master.name || "");
        setEditCity(d.master.city || "");
        setEditAbout(d.master.about || "");
        setEditCategories(d.master.categories?.length ? d.master.categories : (d.master.category ? [d.master.category] : []));
        setProfileSuccess("Профиль сохранён!");
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("Пароли не совпадают"); return; }
    if (pwNew.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", master_id: master?.id, old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setPwError(d.error); return; }
      setPwSuccess("Пароль изменён!");
      setPwOld(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwSuccess(""), 3000);
    } finally { setPwLoading(false); }
  };

  if (!master && !loading) {
    return (
      <MasterLoginForm
        onLogin={(p) => { setPhone(p); setInputPhone(p); loadProfile(p); }}
      />
    );
  }

  if (loading) {
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
        master={master!}
        tab={tab}
        setTab={setTab}
        myServices={myServices}
        myResponses={myResponses}
        buySuccess={buySuccess}
        serviceSuccess={serviceSuccess}
        serviceError={serviceError}
        onLogout={handleLogout}
      />

      <div className="max-w-3xl mx-auto px-4 pb-8">
        {tab === "balance" && (
          <MasterTabBalance
            packages={packages}
            buyingId={buyingId}
            onBuy={handleBuy}
            paymentChecking={paymentChecking}
            checkoutToken={checkoutToken}
            onCheckoutSuccess={handleCheckoutSuccess}
            onCheckoutClose={() => setCheckoutToken(null)}
          />
        )}

        {tab === "services" && (
          <MasterTabServices
            master={master!}
            myServices={myServices}
            showServiceForm={showServiceForm}
            setShowServiceForm={setShowServiceForm}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            serviceLoading={serviceLoading}
            onAddService={handleAddService}
            onToggleService={handleToggleService}
            onBoostService={handleBoostService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
        )}

        {(tab === "responses" || tab === "history" || tab === "profile") && (
          <MasterTabOther
            tab={tab}
            master={master!}
            transactions={transactions}
            myResponses={myResponses}
            editName={editName} setEditName={setEditName}
            editCity={editCity} setEditCity={setEditCity}
            editAbout={editAbout} setEditAbout={setEditAbout}
            editCategories={editCategories} setEditCategories={setEditCategories}
            profileLoading={profileLoading} profileSuccess={profileSuccess}
            onSaveProfile={handleSaveProfile}
            pwOld={pwOld} setPwOld={setPwOld}
            pwNew={pwNew} setPwNew={setPwNew}
            pwConfirm={pwConfirm} setPwConfirm={setPwConfirm}
            pwLoading={pwLoading} pwError={pwError} pwSuccess={pwSuccess}
            onChangePassword={handleChangePassword}
          />
        )}
      </div>
    </div>
  );
}