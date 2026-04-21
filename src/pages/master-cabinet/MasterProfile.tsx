import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { categories as ALL_CATEGORIES } from "@/components/home/categories";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Master {
  id: number;
  name: string;
  phone: string;
  email?: string;
  category: string;
  categories: string[];
  city: string;
  about?: string;
  balance: number;
  created_at: string;
}

interface MasterProfileProps {
  master: Master;
  editName: string;
  setEditName: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editAbout: string;
  setEditAbout: (v: string) => void;
  editCategories: string[];
  setEditCategories: (v: string[]) => void;
  profileLoading: boolean;
  profileSuccess: string;
  onSaveProfile: (e: React.FormEvent) => void;
  onMasterUpdate: (m: Master) => void;
  pwOld: string;
  setPwOld: (v: string) => void;
  pwNew: string;
  setPwNew: (v: string) => void;
  pwConfirm: string;
  setPwConfirm: (v: string) => void;
  pwLoading: boolean;
  pwError: string;
  pwSuccess: string;
  onChangePassword: (e: React.FormEvent) => void;
}

type Mode = "view" | "edit" | "verify_email" | "verify_phone";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

export default function MasterProfile({
  master,
  editName, setEditName,
  editCity, setEditCity,
  editAbout, setEditAbout,
  editCategories, setEditCategories,
  profileLoading, profileSuccess,
  onSaveProfile,
  onMasterUpdate,
  pwOld, setPwOld,
  pwNew, setPwNew,
  pwConfirm, setPwConfirm,
  pwLoading, pwError, pwSuccess,
  onChangePassword,
}: MasterProfileProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [editEmail, setEditEmail] = useState(master.email || "");
  const [editPhone, setEditPhone] = useState(master.phone || "");
  const [contactError, setContactError] = useState("");

  // Email verification
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeLoading, setEmailCodeLoading] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState("");

  // Phone verification
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeLoading, setPhoneCodeLoading] = useState(false);
  const [phoneCodeError, setPhoneCodeError] = useState("");

  const [contactSuccess, setContactSuccess] = useState("");

  const openEdit = () => {
    setEditEmail(master.email || "");
    setEditPhone(master.phone || "");
    setContactError("");
    setMode("edit");
  };

  // Сохранить основные данные + проверить нужна ли верификация email/телефона
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    // Сначала сохраняем имя, город, описание, категории
    await onSaveProfile(e);

    const emailChanged = editEmail.trim().toLowerCase() !== (master.email || "").toLowerCase();
    const phoneChanged = editPhone.trim() !== master.phone;

    if (emailChanged) {
      await requestEmailCode(editEmail.trim().toLowerCase());
      return;
    }
    if (phoneChanged) {
      await requestPhoneCode(editPhone.trim());
      return;
    }
    setMode("view");
  };

  const requestEmailCode = async (newEmail: string) => {
    setEmailCodeLoading(true); setContactError("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_email_change", master_id: master.id, new_email: newEmail }),
      });
      const d = await res.json();
      if (d.error) { setContactError(d.error); return; }
      setPendingEmail(newEmail);
      setEmailCode("");
      setEmailCodeError("");
      setMode("verify_email");
    } finally {
      setEmailCodeLoading(false);
    }
  };

  const requestPhoneCode = async (newPhone: string) => {
    setPhoneCodeLoading(true); setContactError("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_phone_change", master_id: master.id, new_phone: newPhone }),
      });
      const d = await res.json();
      if (d.error) { setContactError(d.error); return; }
      setPendingPhone(newPhone);
      setPhoneCode("");
      setPhoneCodeError("");
      setMode("verify_phone");
    } finally {
      setPhoneCodeLoading(false);
    }
  };

  const confirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode.trim()) { setEmailCodeError("Введите код"); return; }
    setEmailCodeLoading(true); setEmailCodeError("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_email_change", master_id: master.id, new_email: pendingEmail, code: emailCode }),
      });
      const d = await res.json();
      if (d.error) { setEmailCodeError(d.error); return; }
      if (d.master) onMasterUpdate(d.master);
      // Проверить телефон тоже
      const phoneChanged = editPhone.trim() !== master.phone;
      if (phoneChanged) {
        await requestPhoneCode(editPhone.trim());
        return;
      }
      setContactSuccess("Email успешно изменён!");
      setTimeout(() => setContactSuccess(""), 4000);
      setMode("view");
    } finally {
      setEmailCodeLoading(false);
    }
  };

  const confirmPhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCode.trim()) { setPhoneCodeError("Введите код"); return; }
    setPhoneCodeLoading(true); setPhoneCodeError("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_phone_change", master_id: master.id, new_phone: pendingPhone, code: phoneCode }),
      });
      const d = await res.json();
      if (d.error) { setPhoneCodeError(d.error); return; }
      if (d.master) {
        onMasterUpdate(d.master);
        localStorage.setItem("master_phone", d.master.phone);
      }
      setContactSuccess("Телефон успешно изменён!");
      setTimeout(() => setContactSuccess(""), 4000);
      setMode("view");
    } finally {
      setPhoneCodeLoading(false);
    }
  };

  const toggleCategory = (name: string) => {
    setEditCategories(
      editCategories.includes(name)
        ? editCategories.filter(c => c !== name)
        : [...editCategories, name]
    );
  };

  // === VIEW ===
  if (mode === "view") {
    return (
      <div className="flex flex-col gap-5">
        {(contactSuccess || profileSuccess) && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{contactSuccess || profileSuccess}
          </div>
        )}

        {/* Шапка */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Мой профиль</h3>
          <Button onClick={openEdit} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5 h-8 px-3 text-xs">
            <Icon name="Pencil" size={12} />
            Редактировать
          </Button>
        </div>

        {/* Аватар + имя */}
        <div className="flex items-center gap-4 p-4 bg-white/4 border border-white/8 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {master.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold">{master.name}</div>
            <div className="text-gray-400 text-sm mt-0.5">
              {master.categories?.length > 1 ? master.categories.slice(0, 2).join(", ") : master.category}
            </div>
            {master.city && (
              <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <Icon name="MapPin" size={11} />{master.city}
              </div>
            )}
          </div>
        </div>

        {/* Данные */}
        <div className="space-y-2">
          {[
            { label: "Email", value: master.email || "Не указан", icon: "Mail" },
            { label: "Телефон", value: master.phone || "Не указан", icon: "Phone" },
            { label: "Город", value: master.city || "Не указан", icon: "MapPin" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 bg-white/4 border border-white/8 rounded-xl">
              <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                <Icon name={icon} size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-500 text-xs">{label}</div>
                <div className="text-white text-sm font-medium truncate">{value}</div>
              </div>
            </div>
          ))}

          {master.about && (
            <div className="p-3.5 bg-white/4 border border-white/8 rounded-xl">
              <div className="text-gray-500 text-xs mb-1">О себе</div>
              <div className="text-white text-sm">{master.about}</div>
            </div>
          )}
        </div>

        {/* Смена пароля */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 mt-2">
          <h4 className="text-white font-semibold text-sm mb-4">Изменить пароль</h4>
          {pwSuccess && (
            <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2 text-emerald-400 text-sm">
              <Icon name="CheckCircle" size={14} />{pwSuccess}
            </div>
          )}
          <form onSubmit={onChangePassword} className="flex flex-col gap-3">
            {[
              { label: "Текущий пароль", val: pwOld, set: setPwOld },
              { label: "Новый пароль", val: pwNew, set: setPwNew },
              { label: "Повторите новый", val: pwConfirm, set: setPwConfirm },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                <input type="password" value={val} onChange={e => set(e.target.value)} className={inputCls} />
              </div>
            ))}
            {pwError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <Icon name="AlertCircle" size={14} />{pwError}
              </div>
            )}
            <Button type="submit" disabled={pwLoading} className="bg-violet-600 hover:bg-violet-500 text-white">
              {pwLoading ? "Сохранение..." : "Изменить пароль"}
            </Button>
          </form>
        </div>

        <p className="text-gray-600 text-xs text-center">
          При изменении email или телефона потребуется подтверждение кодом
        </p>
      </div>
    );
  }

  // === EDIT ===
  if (mode === "edit") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("view")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h3 className="text-white font-semibold">Редактировать профиль</h3>
        </div>

        <form onSubmit={handleSaveAll} className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Имя *</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ваше имя" className={inputCls} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Город</label>
            <CitySelect value={editCity} onChange={setEditCity} allCitiesLabel="Не указан" variant="glass" className="w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">О себе</label>
            <textarea value={editAbout} onChange={e => setEditAbout(e.target.value)} rows={3} placeholder="Опыт, специализация, преимущества..."
              className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Категории услуг</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((c) => {
                const sel = editCategories.includes(c.name);
                return (
                  <button key={c.name} type="button" onClick={() => toggleCategory(c.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${sel ? "bg-violet-600 text-white" : "bg-white/6 text-gray-400 hover:bg-white/10 hover:text-white"}`}>
                    <Icon name={c.icon} size={12} />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/8 pt-4">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={12} className="text-amber-400" />
              Для изменения email или телефона потребуется код на почту
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" placeholder="email@example.com" className={inputCls} />
                  {editEmail.toLowerCase() !== (master.email || "").toLowerCase() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">Изменён</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Телефон</label>
                <div className="relative">
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} type="tel" placeholder="+7 (999) 000-00-00" className={inputCls} />
                  {editPhone !== master.phone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">Изменён</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {contactError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <Icon name="AlertCircle" size={14} />{contactError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" onClick={() => setMode("view")} variant="ghost" className="flex-1 border border-white/10 text-gray-400 hover:text-white">
              Отмена
            </Button>
            <Button type="submit" disabled={profileLoading || emailCodeLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
              {(profileLoading || emailCodeLoading) ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Сохранение...</span>
              ) : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // === VERIFY EMAIL ===
  if (mode === "verify_email") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("edit")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h3 className="text-white font-semibold">Подтверждение email</h3>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Mail" size={24} className="text-violet-400" />
          </div>
          <p className="text-center text-white font-semibold mb-1">Код отправлен на почту</p>
          <p className="text-center text-gray-400 text-sm mb-5">
            Мы отправили 6-значный код на <span className="text-white font-medium">{pendingEmail}</span>
          </p>
          <form onSubmit={confirmEmailChange} className="space-y-4">
            <input
              value={emailCode}
              onChange={e => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="— — — — — —"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-white text-center tracking-[0.5em] font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {emailCodeError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <Icon name="AlertCircle" size={14} />{emailCodeError}
              </div>
            )}
            <Button type="submit" disabled={emailCodeLoading || emailCode.length < 6} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              {emailCodeLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Проверка...</span> : "Подтвердить"}
            </Button>
            <button type="button" onClick={() => requestEmailCode(pendingEmail)} disabled={emailCodeLoading}
              className="w-full text-center text-violet-400 hover:text-violet-300 text-sm transition-colors py-1">
              Отправить код повторно
            </button>
          </form>
        </div>
      </div>
    );
  }

  // === VERIFY PHONE ===
  if (mode === "verify_phone") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("edit")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <h3 className="text-white font-semibold">Подтверждение телефона</h3>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Icon name="Phone" size={24} className="text-emerald-400" />
          </div>
          <p className="text-center text-white font-semibold mb-1">Подтверждение номера</p>
          <p className="text-center text-gray-400 text-sm mb-5">
            Код отправлен на почту <span className="text-white font-medium">{master.email}</span>
          </p>
          <form onSubmit={confirmPhoneChange} className="space-y-4">
            <input
              value={phoneCode}
              onChange={e => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="— — — — — —"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-white text-center tracking-[0.5em] font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {phoneCodeError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <Icon name="AlertCircle" size={14} />{phoneCodeError}
              </div>
            )}
            <Button type="submit" disabled={phoneCodeLoading || phoneCode.length < 6} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              {phoneCodeLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Проверка...</span> : "Подтвердить"}
            </Button>
            <button type="button" onClick={() => requestPhoneCode(pendingPhone)} disabled={phoneCodeLoading}
              className="w-full text-center text-violet-400 hover:text-violet-300 text-sm transition-colors py-1">
              Отправить код повторно
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}