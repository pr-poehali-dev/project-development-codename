import { useState } from "react";
import type { Master, MyService } from "./useMasterProfile";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface UseMasterServicesProps {
  master: Master | null;
  phone: string;
  setMyServices: React.Dispatch<React.SetStateAction<MyService[]>>;
  setMaster: React.Dispatch<React.SetStateAction<Master | null>>;
  loadProfile: (p: string) => Promise<void>;
}

export function useMasterServices({ master, phone, setMyServices, setMaster, loadProfile }: UseMasterServicesProps) {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", category: "", subcategories: [] as string[], city: "", price: "" });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [serviceError, setServiceError] = useState("");

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
        subcategories: serviceForm.subcategories,
        city: serviceForm.city || master.city,
        price: serviceForm.price ? Number(serviceForm.price) : null,
      }),
    });
    const data = await res.json();
    setServiceLoading(false);
    if (data.success) {
      setServiceSuccess("Услуга опубликована!");
      setShowServiceForm(false);
      setServiceForm({ title: "", description: "", category: "", subcategories: [], city: "", price: "" });
      localStorage.removeItem("master_banner_dismissed");
      await loadProfile(phone);
      setTimeout(() => setServiceSuccess(""), 3000);
    } else {
      setServiceError(data.error || "Ошибка при публикации");
      setTimeout(() => setServiceError(""), 4000);
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
      setMaster(m => m ? { ...m, balance: m.balance - 5 } : m);
      setServiceSuccess("Услуга поднята в топ на 7 дней!");
      setTimeout(() => setServiceSuccess(""), 3000);
    } else if (data.no_balance) {
      setServiceError(data.error || "Недостаточно токенов. Нужно 5 токенов.");
      setTimeout(() => setServiceError(""), 4000);
    } else {
      setServiceError(data.error || "Ошибка при поднятии в топ");
      setTimeout(() => setServiceError(""), 4000);
    }
  };

  const handleRenewService = async (serviceId: number) => {
    if (!master) return;
    const res = await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "renew_service", service_id: serviceId, master_id: master.id }),
    });
    const data = await res.json();
    if (data.success) {
      setMyServices(prev => prev.map(s => s.id === serviceId ? { ...s, paid_until: data.paid_until, is_active: true } : s));
      setMaster(m => m ? { ...m, balance: m.balance - data.cost } : m);
      setServiceSuccess(`Услуга продлена на 30 дней! Списано ${data.cost} токенов.`);
      setTimeout(() => setServiceSuccess(""), 4000);
    } else if (data.no_balance) {
      setServiceError(data.error || "Недостаточно токенов для продления.");
      setTimeout(() => setServiceError(""), 4000);
    } else {
      setServiceError(data.error || "Ошибка при продлении услуги");
      setTimeout(() => setServiceError(""), 4000);
    }
  };

  return {
    showServiceForm, setShowServiceForm,
    serviceForm, setServiceForm,
    serviceLoading,
    serviceSuccess,
    serviceError,
    handleAddService,
    handleToggleService,
    handleDeleteService,
    handleUpdateService,
    handleBoostService,
    handleRenewService,
  };
}
