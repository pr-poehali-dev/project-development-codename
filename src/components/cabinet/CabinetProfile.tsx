import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import CitySelect from "@/components/ui/city-select";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface CabinetProfileProps {
  customer: Customer;
  onCustomerUpdate: (c: Customer) => void;
}

type EditMode = "view" | "edit" | "verify_email" | "verify_phone";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

export default function CabinetProfile({ customer, onCustomerUpdate }: CabinetProfileProps) {
  const [mode, setMode] = useState<EditMode>("view");

  // Форма редактирования
  const [editName, setEditName] = useState(customer.name);
  const [editCity, setEditCity] = useState(customer.city || "");
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editPhone, setEditPhone] = useState(customer.phone);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Подтверждение email
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeLoading, setEmailCodeLoading] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);

  // Подтверждение телефона
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeLoading, setPhoneCodeLoading] = useState(false);
  const [phoneCodeError, setPhoneCodeError] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);

  const [success, setSuccess] = useState("");

  const openEdit = () => {
    setEditName(customer.name);
    setEditCity(customer.city || "");
    setEditEmail(customer.email);
    setEditPhone(customer.phone);
    setEditError("");
    setMode("edit");
  };

  // Сохранить имя и город (без проверки)
  const handleSaveBasic = async () => {
    if (!editName.trim()) { setEditError("Укажите имя"); return; }
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", customer_id: customer.id, name: editName, phone: customer.phone, email: customer.email, city: editCity }),
      });
      const d = await res.json();
      if (d.error) { setEditError(d.error); return; }
      if (d.success && d.customer) {
        onCustomerUpdate(d.customer);
        localStorage.setItem("customer_phone", d.customer.phone);
        localStorage.setItem("customer_profile", JSON.stringify({ name: d.customer.name, phone: d.customer.phone, email: d.customer.email }));
      }
      // Если email/телефон изменились — запускаем верификацию
      const emailChanged = editEmail.trim().toLowerCase() !== customer.email.toLowerCase();
      const phoneChanged = editPhone.trim() !== customer.phone;
      if (emailChanged) {
        await requestEmailCode(editEmail.trim().toLowerCase());
        return;
      }
      if (phoneChanged) {
        await requestPhoneCode(editPhone.trim());
        return;
      }
      setSuccess("Профиль сохранён!");
      setTimeout(() => setSuccess(""), 3000);
      setMode("view");
    } finally {
      setEditLoading(false);
    }
  };

  const requestEmailCode = async (newEmail: string) => {
    setEmailCodeLoading(true); setEmailCodeError("");
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_email_change", customer_id: customer.id, new_email: newEmail }),
      });
      const d = await res.json();
      if (d.error) { setEditError(d.error); return; }
      setPendingEmail(newEmail);
      setEmailCode("");
      setEmailCodeSent(true);
      setMode("verify_email");
    } finally {
      setEmailCodeLoading(false);
    }
  };

  const requestPhoneCode = async (newPhone: string) => {
    setPhoneCodeLoading(true); setPhoneCodeError("");
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_phone_change", customer_id: customer.id, new_phone: newPhone }),
      });
      const d = await res.json();
      if (d.error) { setEditError(d.error); return; }
      setPendingPhone(newPhone);
      setPhoneCode("");
      setPhoneCodeSent(true);
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
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_email_change", customer_id: customer.id, new_email: pendingEmail, code: emailCode }),
      });
      const d = await res.json();
      if (d.error) { setEmailCodeError(d.error); return; }
      if (d.success && d.customer) {
        onCustomerUpdate(d.customer);
        localStorage.setItem("customer_phone", d.customer.phone);
        localStorage.setItem("customer_profile", JSON.stringify({ name: d.customer.name, phone: d.customer.phone, email: d.customer.email }));
      }
      // После смены email — проверим телефон
      const phoneChanged = editPhone.trim() !== customer.phone;
      if (phoneChanged) {
        await requestPhoneCode(editPhone.trim());
        return;
      }
      setSuccess("Email успешно изменён!");
      setTimeout(() => setSuccess(""), 4000);
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
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_phone_change", customer_id: customer.id, new_phone: pendingPhone, code: phoneCode }),
      });
      const d = await res.json();
      if (d.error) { setPhoneCodeError(d.error); return; }
      if (d.success && d.customer) {
        onCustomerUpdate(d.customer);
        localStorage.setItem("customer_phone", d.customer.phone);
        localStorage.setItem("customer_profile", JSON.stringify({ name: d.customer.name, phone: d.customer.phone, email: d.customer.email }));
      }
      setSuccess("Телефон успешно изменён!");
      setTimeout(() => setSuccess(""), 4000);
      setMode("view");
    } finally {
      setPhoneCodeLoading(false);
    }
  };

  // === VIEW MODE ===
  if (mode === "view") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {success && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{success}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Мой профиль</h2>
          <Button onClick={openEdit} className="bg-violet-600 hover:bg-violet-500 text-white gap-2 h-9 px-4 text-sm">
            <Icon name="Pencil" size={14} />
            Редактировать
          </Button>
        </div>

        {/* Аватар + имя */}
        <div className="flex items-center gap-4 mb-8 p-5 bg-white/4 border border-white/8 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {customer.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{customer.name}</div>
            {customer.city && (
              <div className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                <Icon name="MapPin" size={13} />{customer.city}
              </div>
            )}
          </div>
        </div>

        {/* Данные */}
        <div className="space-y-3">
          {[
            { label: "Email", value: customer.email, icon: "Mail" },
            { label: "Телефон", value: customer.phone || "Не указан", icon: "Phone" },
            { label: "Город", value: customer.city || "Не указан", icon: "MapPin" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-4 p-4 bg-white/4 border border-white/8 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                <Icon name={icon} size={16} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                <div className="text-white text-sm font-medium truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-xs mt-6 text-center">
          При изменении email или телефона потребуется подтверждение кодом на почту
        </p>
      </div>
    );
  }

  // === EDIT MODE ===
  if (mode === "edit") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setMode("view")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Редактировать профиль</h2>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Имя *</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Иван Иванов" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Город</label>
            <CitySelect value={editCity} onChange={setEditCity} allCitiesLabel="Не указан" variant="glass" className="w-full" />
          </div>

          <div className="border-t border-white/8 pt-5">
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={13} className="text-amber-400" />
              Для изменения email или телефона потребуется подтверждение кодом
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" placeholder="email@example.com" className={inputCls} />
                  {editEmail.toLowerCase() !== customer.email.toLowerCase() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">Изменён</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Телефон</label>
                <div className="relative">
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} type="tel" placeholder="+7 (999) 000-00-00" className={inputCls} />
                  {editPhone !== customer.phone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">Изменён</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <Icon name="AlertCircle" size={15} />{editError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button onClick={() => setMode("view")} variant="ghost" className="flex-1 border border-white/10 text-gray-400 hover:text-white">
              Отмена
            </Button>
            <Button onClick={handleSaveBasic} disabled={editLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
              {editLoading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Сохранение...</span>
              ) : "Сохранить"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === VERIFY EMAIL MODE ===
  if (mode === "verify_email") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setMode("edit")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Подтверждение email</h2>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
            <Icon name="Mail" size={24} className="text-violet-400" />
          </div>
          <p className="text-center text-white font-semibold mb-1">Код отправлен на почту</p>
          <p className="text-center text-gray-400 text-sm mb-6">
            Мы отправили 6-значный код на <span className="text-white font-medium">{pendingEmail}</span>. Введите его ниже.
          </p>

          {emailCodeSent && (
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
                  <Icon name="AlertCircle" size={15} />{emailCodeError}
                </div>
              )}
              <Button type="submit" disabled={emailCodeLoading || emailCode.length < 6} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                {emailCodeLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Проверка...</span>
                ) : "Подтвердить"}
              </Button>
              <button
                type="button"
                onClick={() => requestEmailCode(pendingEmail)}
                disabled={emailCodeLoading}
                className="w-full text-center text-violet-400 hover:text-violet-300 text-sm transition-colors py-1"
              >
                Отправить код повторно
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // === VERIFY PHONE MODE ===
  if (mode === "verify_phone") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setMode("edit")} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Подтверждение телефона</h2>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <Icon name="Phone" size={24} className="text-emerald-400" />
          </div>
          <p className="text-center text-white font-semibold mb-1">Подтверждение номера</p>
          <p className="text-center text-gray-400 text-sm mb-6">
            Код подтверждения отправлен на почту <span className="text-white font-medium">{customer.email}</span>
          </p>

          {phoneCodeSent && (
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
                  <Icon name="AlertCircle" size={15} />{phoneCodeError}
                </div>
              )}
              <Button type="submit" disabled={phoneCodeLoading || phoneCode.length < 6} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                {phoneCodeLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Проверка...</span>
                ) : "Подтвердить"}
              </Button>
              <button
                type="button"
                onClick={() => requestPhoneCode(pendingPhone)}
                disabled={phoneCodeLoading}
                className="w-full text-center text-violet-400 hover:text-violet-300 text-sm transition-colors py-1"
              >
                Отправить код повторно
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return null;
}
