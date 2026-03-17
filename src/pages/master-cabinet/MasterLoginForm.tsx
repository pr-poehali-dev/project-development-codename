import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface MasterLoginFormProps {
  onLogin: (phone: string) => void;
}

export default function MasterLoginForm({ onLogin }: MasterLoginFormProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [regStep, setRegStep] = useState<"form" | "code" | "password">("form");
  const [resetStep, setResetStep] = useState<"email" | "code_password">("email");

  // Вход
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Регистрация
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  // Сброс пароля
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

  const post = async (body: object) => {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return typeof data === "string" ? JSON.parse(data) : data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const d = await post({
        action: "auth_login",
        email: identifier.includes("@") ? identifier : undefined,
        phone: !identifier.includes("@") ? identifier : undefined,
        password,
      });
      if (d.error) { setError(d.error); return; }
      if (d.success) onLogin(d.user.phone);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const d = await post({ action: "register", email: regEmail, phone: regPhone, name: regName });
      if (d.error) {
        if (d.already_exists) setMode("login");
        setError(d.error); return;
      }
      if (d.success) setRegStep("code");
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const d = await post({ action: "verify_code_reg", email: regEmail, code: regCode });
      if (d.error) { setError(d.error); return; }
      if (d.success) setRegStep("password");
    } finally { setLoading(false); }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) { setError("Пароли не совпадают"); return; }
    if (regPassword.length < 6) { setError("Пароль минимум 6 символов"); return; }
    setError(""); setLoading(true);
    try {
      const d = await post({ action: "set_password", email: regEmail, password: regPassword });
      if (d.error) { setError(d.error); return; }
      if (d.success) onLogin(d.user.phone);
    } finally { setLoading(false); }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const d = await post({ action: "reset_password_request", email: resetEmail });
      if (d.error) { setError(d.error); return; }
      setResetStep("code_password");
    } finally { setLoading(false); }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword !== resetPasswordConfirm) { setError("Пароли не совпадают"); return; }
    if (resetPassword.length < 6) { setError("Пароль минимум 6 символов"); return; }
    setError(""); setLoading(true);
    try {
      const d = await post({ action: "reset_password_confirm", email: resetEmail, code: resetCode, password: resetPassword });
      if (d.error) { setError(d.error); return; }
      if (d.success) onLogin(d.user.phone);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
      <a href="/" className="absolute top-5 left-5 flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <Icon name="ArrowLeft" size={16} />
        На главную
      </a>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="Wrench" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Кабинет мастера</h1>
        </div>

        {/* Табы — только на входе и первом шаге регистрации */}
        {mode !== "reset" && (mode === "login" || regStep === "form") && (
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${mode === "login" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Войти
            </button>
            <button onClick={() => { setMode("register"); setRegStep("form"); setError(""); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${mode === "register" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Регистрация
            </button>
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email или телефон</label>
              <input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder="email@example.com или +7..." className={inputCls} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Ваш пароль" className={inputCls} />
            </div>
            {error && <p className="text-amber-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
              {loading ? "Вход..." : "Войти"}
            </Button>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs">Нет аккаунта?{" "}
                <button type="button" onClick={() => { setMode("register"); setRegStep("form"); setError(""); }} className="text-violet-400 hover:underline">Зарегистрироваться</button>
              </p>
              <button type="button" onClick={() => { setMode("reset"); setResetStep("email"); setResetEmail(""); setResetCode(""); setResetPassword(""); setResetPasswordConfirm(""); setError(""); }}
                className="text-gray-500 text-xs hover:text-gray-400 transition-colors">
                Забыл пароль
              </button>
            </div>
          </form>
        ) : mode === "reset" ? (
          resetStep === "email" ? (
            <form onSubmit={handleResetRequest} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                  <Icon name="KeyRound" size={22} className="text-violet-400" />
                </div>
                <p className="text-white font-medium">Сброс пароля</p>
                <p className="text-gray-500 text-sm mt-1">Введите email — пришлём код</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  placeholder="email@example.com" className={inputCls} autoFocus />
              </div>
              {error && <p className="text-amber-400 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loading ? "Отправка..." : "Получить код"}
              </Button>
              <button type="button" onClick={() => { setMode("login"); setError(""); }}
                className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">← Вернуться ко входу</button>
            </form>
          ) : (
            <form onSubmit={handleResetConfirm} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <p className="text-white font-medium">Новый пароль</p>
                <p className="text-gray-500 text-sm mt-1">Код отправлен на <span className="text-gray-300">{resetEmail}</span></p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Код из письма</label>
                <input type="text" required maxLength={6} value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000" className={`${inputCls} text-center tracking-widest text-xl font-bold`} autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Новый пароль</label>
                <input type="password" required value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                  placeholder="Минимум 6 символов" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Повторите пароль</label>
                <input type="password" required value={resetPasswordConfirm} onChange={e => setResetPasswordConfirm(e.target.value)}
                  placeholder="Повторите пароль" className={inputCls} />
              </div>
              {error && <p className="text-amber-400 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loading ? "Сохранение..." : "Сохранить пароль"}
              </Button>
              <button type="button" onClick={() => setResetStep("email")}
                className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">← Ввести другой email</button>
            </form>
          )
        ) : regStep === "form" ? (
          <form onSubmit={handleRegister} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
        ) : regStep === "code" ? (
          <form onSubmit={handleVerifyCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
            <button type="button" onClick={() => { setRegStep("form"); setRegCode(""); setError(""); }}
              className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">
              Ввести данные снова
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
        )}
      </div>
    </div>
  );
}