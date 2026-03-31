import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { useState, useEffect } from "react";

const PUSH_URL = "https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BDWLtMqUirnG-1n_v3dRwA0o80T918sNw1fU4RGgm-n0Upo4gmQ1OVcTT0VOPgcu4zdzwjMyqWp34jdXTgMVwrk";

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
      await fetch(PUSH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "subscribe", phone, role: "customer", subscription: sub.toJSON() }) });
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

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface CabinetNavProps {
  customer: Customer;
  showPwForm: boolean;
  setShowPwForm: (v: boolean | ((prev: boolean) => boolean)) => void;
  pwOld: string;
  setPwOld: (v: string) => void;
  pwNew: string;
  setPwNew: (v: string) => void;
  pwConfirm: string;
  setPwConfirm: (v: string) => void;
  pwLoading: boolean;
  pwError: string;
  setPwError: (v: string) => void;
  pwSuccess: string;
  onChangePassword: (e: React.FormEvent) => void;
  onLogout: () => void;
  onCreateOrder: () => void;
  showEditProfile?: boolean;
  setShowEditProfile?: (v: boolean | ((prev: boolean) => boolean)) => void;
  editName?: string;
  setEditName?: (v: string) => void;
  editPhone?: string;
  setEditPhone?: (v: string) => void;
  editEmail?: string;
  setEditEmail?: (v: string) => void;
  editCity?: string;
  setEditCity?: (v: string) => void;
  editLoading?: boolean;
  editError?: string;
  editSuccess?: string;
  onSaveProfile?: (e: React.FormEvent) => void;
}

export default function CabinetNav({
  customer,
  showPwForm, setShowPwForm,
  pwOld, setPwOld,
  pwNew, setPwNew,
  pwConfirm, setPwConfirm,
  pwLoading, pwError, setPwError, pwSuccess,
  onChangePassword, onLogout, onCreateOrder,
  showEditProfile, setShowEditProfile,
  editName, setEditName,
  editPhone, setEditPhone,
  editEmail, setEditEmail,
  editCity, setEditCity,
  editLoading, editError, editSuccess,
  onSaveProfile,
}: CabinetNavProps) {
  const isMaster = typeof window !== "undefined" && !!localStorage.getItem("master_phone");

  return (
    <>
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="text-gray-500 hover:text-white transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </button>
            <a href="/" className="flex items-center gap-3">
              <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/masters" className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm transition-colors">
              <Icon name="Search" size={15} />
              Найти мастера
            </a>
            <Button onClick={onCreateOrder} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm h-9 px-4 hidden sm:flex items-center gap-1.5">
              <Icon name="Plus" size={15} />
              Создать заявку
            </Button>
            <button type="button" onClick={onCreateOrder} className="sm:hidden w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <Icon name="Plus" size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 text-sm">
                {customer?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-gray-300 text-sm hidden sm:block">{customer?.name}</span>
            </div>
            {isMaster && (
              <a href="/master" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1.5 transition-colors hidden sm:flex">
                <Icon name="Briefcase" size={15} />
                Кабинет мастера
              </a>
            )}
            <PushButton phone={customer?.phone} />
            {setShowEditProfile && (
              <button onClick={() => setShowEditProfile(v => !v)}
                className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors hidden sm:flex">
                <Icon name="UserPen" size={15} />
                Профиль
              </button>
            )}
            <button onClick={() => { setShowPwForm(v => !v); setPwError(""); }}
              className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors hidden sm:flex">
              <Icon name="KeyRound" size={15} />
              Пароль
            </button>
            <button onClick={onLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </nav>

      {pwSuccess && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={15} />{pwSuccess}
          </div>
        </div>
      )}

      {showPwForm && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 mb-0 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Изменить пароль</h3>
              <button onClick={() => { setShowPwForm(false); setPwError(""); }} className="text-gray-500 hover:text-gray-300 transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
            <form onSubmit={onChangePassword} className="flex flex-col gap-3">
              {[
                { label: "Текущий пароль", val: pwOld, set: setPwOld },
                { label: "Новый пароль", val: pwNew, set: setPwNew },
                { label: "Повторите новый", val: pwConfirm, set: setPwConfirm },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                  <input type="password" required value={val} onChange={e => set(e.target.value)} placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
              ))}
              {pwError && <p className="text-amber-400 text-sm">{pwError}</p>}
              <Button type="submit" disabled={pwLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full">
                {pwLoading ? "Сохранение..." : "Изменить пароль"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {showEditProfile && onSaveProfile && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Редактировать профиль</h3>
              {setShowEditProfile && (
                <button onClick={() => setShowEditProfile(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
            {editSuccess && (
              <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
                <Icon name="CheckCircle" size={15} />{editSuccess}
              </div>
            )}
            <form onSubmit={onSaveProfile} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Имя</label>
                <input value={editName || ""} onChange={e => setEditName?.(e.target.value)} required placeholder="Ваше имя"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Телефон</label>
                <input value={editPhone || ""} onChange={e => setEditPhone?.(e.target.value)} placeholder="+7 (999) 123-45-67"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                <input type="email" value={editEmail || ""} onChange={e => setEditEmail?.(e.target.value)} placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Город</label>
                <CitySelect value={editCity || ""} onChange={v => setEditCity?.(v)} variant="glass" className="w-full" />
              </div>
              {editError && <p className="text-amber-400 text-sm">{editError}</p>}
              <Button type="submit" disabled={editLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full">
                {editLoading ? "Сохранение..." : "Сохранить"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}