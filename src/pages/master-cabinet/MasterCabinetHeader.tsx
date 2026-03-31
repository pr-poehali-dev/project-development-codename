import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";

const PUSH_URL = "https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BG_Ln-RdvWrg20JsfURtHHgC2BclRonRGl260CyCL3VzbY9yHhJkiBZn7RYUmy62E7FaxAW9vd63kJu3oB8iQPs";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from([...atob(base64)].map(c => c.charCodeAt(0)));
}

function PushButton({ phone }: { phone: string }) {
  const [perm, setPerm] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  if (!("Notification" in window) || !("serviceWorker" in navigator) || !VAPID_PUBLIC_KEY) return null;
  if (perm === "denied") return null;

  const handleEnable = async () => {
    const permission = perm === "granted" ? "granted" : await Notification.requestPermission();
    setPerm(permission);
    if (permission !== "granted") return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
      await fetch(PUSH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "subscribe", phone, role: "master", subscription: sub.toJSON() }) });
      setPerm("granted");
    } catch (e) { console.error(e); }
  };

  if (perm === "granted") return (
    <span className="text-emerald-400 text-xs flex items-center gap-1">
      <Icon name="Bell" size={13} />
      <span className="hidden sm:inline">Уведомления включены</span>
    </span>
  );

  return (
    <button onClick={handleEnable} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1.5 transition-colors">
      <Icon name="Bell" size={15} />
      <span className="hidden sm:inline">Включить уведомления</span>
    </button>
  );
}

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

type Tab = "balance" | "history" | "responses" | "services" | "profile" | "inquiries";

interface MasterCabinetHeaderProps {
  master: Master;
  tab: Tab;
  setTab: (t: Tab) => void;
  myServices: { id: number }[];
  myResponses: { id: number }[];
  unreadInquiries?: number;
  buySuccess: string;
  serviceSuccess: string;
  serviceError: string;
  onLogout: () => void;
}

export default function MasterCabinetHeader({
  master,
  tab,
  setTab,
  myServices,
  myResponses,
  unreadInquiries = 0,
  buySuccess,
  serviceSuccess,
  serviceError,
  onLogout,
}: MasterCabinetHeaderProps) {
  return (
    <>
      {/* Шапка */}
      <div className="border-b border-white/8 bg-[#0a0d16]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </a>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
              {master?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{master?.name}</p>
              <p className="text-gray-500 text-xs">{master?.category} · {master?.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PushButton phone={master?.phone} />
            {master?.id && (
              <a href={`/master-page?id=${master.id}`} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1.5 transition-colors">
                <Icon name="User" size={15} />
                Мой профиль
              </a>
            )}
            <button onClick={onLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Баланс */}
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Баланс токенов</p>
            <p className="text-5xl font-bold text-white">{master?.balance ?? 0}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center">
            <Icon name="Zap" size={30} className="text-violet-400" />
          </div>
        </div>

        {/* Уведомления */}
        {buySuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{buySuccess}
          </div>
        )}
        {serviceSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{serviceSuccess}
          </div>
        )}
        {serviceError && (
          <div className="bg-red-600/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
            <Icon name="AlertCircle" size={16} />{serviceError}
          </div>
        )}

        {/* Вкладки */}
        <div className="grid grid-cols-6 gap-1 bg-white/4 rounded-xl p-1 mb-6">
          <button onClick={() => setTab("balance")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "balance" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Баланс
          </button>
          <button onClick={() => setTab("services")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "services" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Услуги
            {myServices.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "services" ? "bg-white/20" : "bg-white/10"}`}>{myServices.length}</span>}
          </button>
          <button onClick={() => setTab("responses")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "responses" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Отклики
            {myResponses.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "responses" ? "bg-white/20" : "bg-white/10"}`}>{myResponses.length}</span>}
          </button>
          <button onClick={() => setTab("inquiries")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "inquiries" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Клиенты
            {unreadInquiries > 0 && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500 text-white">{unreadInquiries}</span>}
          </button>
          <button onClick={() => setTab("history")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "history" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            История
          </button>
          <button onClick={() => setTab("profile")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "profile" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Профиль
          </button>
        </div>
      </div>
    </>
  );
}