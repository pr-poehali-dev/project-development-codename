import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

interface MasterLoginFormRegisterProps {
  regStep: "form" | "code" | "password";
  setRegStep: (s: "form" | "code" | "password") => void;
  regName: string; setRegName: (v: string) => void;
  regEmail: string; setRegEmail: (v: string) => void;
  regPhone: string; setRegPhone: (v: string) => void;
  regCode: string; setRegCode: (v: string) => void;
  regPassword: string; setRegPassword: (v: string) => void;
  regPasswordConfirm: string; setRegPasswordConfirm: (v: string) => void;
  error: string;
  loading: boolean;
  onRegister: (e: React.FormEvent) => void;
  onVerifyCode: (e: React.FormEvent) => void;
  onSetPassword: (e: React.FormEvent) => void;
  onClearError: () => void;
}

export default function MasterLoginFormRegister({
  regStep, setRegStep,
  regName, setRegName,
  regEmail, setRegEmail,
  regPhone, setRegPhone,
  regCode, setRegCode,
  regPassword, setRegPassword,
  regPasswordConfirm, setRegPasswordConfirm,
  error, loading,
  onRegister, onVerifyCode, onSetPassword, onClearError,
}: MasterLoginFormRegisterProps) {
  if (regStep === "form") {
    return (
      <form onSubmit={onRegister} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя</label>
          <input type="text" required value={regName} onChange={e => setRegName(e.target.value)}
            placeholder="Иван Иванов" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
          <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
            placeholder="email@example.com" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Телефон</label>
          <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00" className={inputCls} />
        </div>
        {error && <p className="text-amber-400 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
          {loading ? "Отправка..." : "Продолжить"}
        </Button>
      </form>
    );
  }

  if (regStep === "code") {
    return (
      <form onSubmit={onVerifyCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
        <div className="text-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
            <Icon name="Mail" size={22} className="text-violet-400" />
          </div>
          <p className="text-white font-medium">Введите код из письма</p>
          <p className="text-gray-500 text-sm mt-1">Отправили на <span className="text-gray-300">{regEmail}</span></p>
        </div>
        <input type="text" required maxLength={6} value={regCode} onChange={e => setRegCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000" className={`${inputCls} text-center tracking-widest text-xl font-bold`} autoFocus />
        {error && <p className="text-amber-400 text-sm text-center">{error}</p>}
        <Button type="submit" disabled={loading || regCode.length < 6} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
          {loading ? "Проверка..." : "Подтвердить"}
        </Button>
        <button type="button" onClick={() => { setRegStep("form"); setRegCode(""); onClearError(); }}
          className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">
          Ввести данные снова
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSetPassword} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
      <div className="text-center mb-1">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
          <Icon name="Lock" size={22} className="text-violet-400" />
        </div>
        <p className="text-white font-medium">Придумайте пароль</p>
        <p className="text-gray-500 text-sm mt-1">Email подтверждён!</p>
      </div>
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
        <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
          placeholder="Минимум 6 символов" className={inputCls} autoFocus />
      </div>
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Повторите пароль</label>
        <input type="password" required value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)}
          placeholder="Повторите пароль" className={inputCls} />
      </div>
      {error && <p className="text-amber-400 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
        {loading ? "Сохранение..." : "Сохранить и войти"}
      </Button>
    </form>
  );
}
