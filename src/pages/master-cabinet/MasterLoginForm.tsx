import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface MasterLoginFormProps {
  onEmailLogin: (phone: string) => void;
}

export default function MasterLoginForm({ onEmailLogin }: MasterLoginFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [masterName, setMasterName] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_code", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Ошибка отправки");
      } else {
        setMasterName(data.name);
        setStep("code");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_code", email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Неверный код");
      } else {
        onEmailLogin(data.phone);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="Wrench" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Кабинет мастера</h1>
          <p className="text-gray-400 text-sm">Войдите по email — пришлём код</p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email адрес</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
            <Button type="submit" disabled={emailLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full">
              {emailLoading ? "Отправка..." : "Получить код"}
            </Button>
            <p className="text-center text-xs text-gray-600">
              Код придёт на почту, которую вы указали при регистрации
            </p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div className="text-center mb-1">
              <p className="text-white font-medium">Привет, {masterName}!</p>
              <p className="text-gray-400 text-sm mt-1">Код отправлен на <span className="text-violet-400">{email}</span></p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Код из письма</label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-center tracking-widest text-lg font-bold"
              />
            </div>
            {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
            <Button type="submit" disabled={emailLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full">
              {emailLoading ? "Проверка..." : "Войти"}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setEmailError(""); }}
              className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Изменить email или отправить код повторно
            </button>
          </form>
        )}
      </div>
    </div>
  );
}