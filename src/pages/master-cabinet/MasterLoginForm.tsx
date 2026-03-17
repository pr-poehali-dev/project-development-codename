import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface MasterLoginFormProps {
  onLogin: (phone: string) => void;
}

export default function MasterLoginForm({ onLogin }: MasterLoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerSent, setRegisterSent] = useState(false);

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auth_login",
          email: identifier.includes("@") ? identifier : undefined,
          phone: !identifier.includes("@") ? identifier : undefined,
          password,
        }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setError(d.error); return; }
      if (d.success) onLogin(d.user.phone);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email: regEmail, phone: regPhone, name: regName, user_type: "master" }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) {
        if (d.already_exists) setMode("login");
        setError(d.error);
        return;
      }
      if (d.success) setRegisterSent(true);
    } finally {
      setLoading(false);
    }
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

        {/* Табы */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
          <button onClick={() => { setMode("login"); setError(""); setRegisterSent(false); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${mode === "login" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Войти
          </button>
          <button onClick={() => { setMode("register"); setError(""); setRegisterSent(false); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${mode === "register" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Регистрация
          </button>
        </div>

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
            <p className="text-center text-gray-500 text-xs">Нет аккаунта?{" "}
              <button type="button" onClick={() => setMode("register")} className="text-violet-400 hover:underline">Зарегистрироваться</button>
            </p>
          </form>
        ) : registerSent ? (
          <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="Mail" size={26} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold mb-2">Проверьте почту</h2>
            <p className="text-gray-400 text-sm">Мы отправили письмо на <span className="text-white">{regEmail}</span>.<br />Перейдите по ссылке в письме, чтобы подтвердить email и задать пароль.</p>
          </div>
        ) : (
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
              {loading ? "Отправка..." : "Зарегистрироваться"}
            </Button>
            <p className="text-center text-gray-500 text-xs">Уже есть аккаунт?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-violet-400 hover:underline">Войти</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}