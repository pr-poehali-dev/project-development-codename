import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const userType = params.get("type") || "customer";

  const [step, setStep] = useState<"verifying" | "set_password" | "error" | "success">("verifying");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setStep("error"); setError("Токен не найден"); return; }
    const authUrl = userType === "master" ? MASTER_URL : MY_ORDERS_URL;
    fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_token", token }),
    })
      .then(r => r.json())
      .then(data => {
        const d = typeof data === "string" ? JSON.parse(data) : data;
        if (d.error) { setStep("error"); setError(d.error); }
        else { setEmail(d.email); setStep("set_password"); }
      })
      .catch(() => { setStep("error"); setError("Ошибка соединения"); });
  }, [token]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Минимум 6 символов"); return; }
    if (password !== passwordConfirm) { setError("Пароли не совпадают"); return; }
    setError("");
    setLoading(true);
    try {
      const authUrl = userType === "master" ? MASTER_URL : MY_ORDERS_URL;
      const res = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_password", token, password }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setError(d.error); return; }
      if (d.success) {
        localStorage.setItem(userType === "master" ? "master_phone" : "customer_phone", d.user.phone);
        setStep("success");
        setTimeout(() => navigate(userType === "master" ? "/master" : "/cabinet"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white">HandyMan</span>
          </a>
        </div>

        {step === "verifying" && (
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Проверяем ссылку...</p>
          </div>
        )}

        {step === "error" && (
          <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={26} className="text-red-400" />
            </div>
            <h2 className="text-white font-semibold mb-2">Ошибка</h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <a href={userType === "master" ? "/master" : "/cabinet"} className="text-violet-400 text-sm hover:underline">
              Вернуться
            </a>
          </div>
        )}

        {step === "set_password" && (
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                <Icon name="Lock" size={24} className="text-violet-400" />
              </div>
              <h2 className="text-white font-semibold text-xl mb-1">Придумайте пароль</h2>
              <p className="text-gray-500 text-sm">Для аккаунта <span className="text-gray-300">{email}</span></p>
            </div>
            <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Повторите пароль</label>
                <input type="password" required value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Повторите пароль" className={inputCls} />
              </div>
              {error && <p className="text-amber-400 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full mt-1">
                {loading ? "Сохранение..." : "Сохранить и войти"}
              </Button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={26} className="text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold mb-2">Пароль установлен!</h2>
            <p className="text-gray-400 text-sm">Переходим в кабинет...</p>
          </div>
        )}
      </div>
    </div>
  );
}