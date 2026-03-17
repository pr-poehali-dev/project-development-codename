import { useState } from "react";
import Icon from "@/components/ui/icon";
import MasterLoginFormLogin from "./MasterLoginFormLogin";
import MasterLoginFormRegister from "./MasterLoginFormRegister";
import MasterLoginFormReset from "./MasterLoginFormReset";

const AUTH_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface MasterLoginFormProps {
  onLogin: (phone: string) => void;
}

export default function MasterLoginForm({ onLogin }: MasterLoginFormProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [regStep, setRegStep] = useState<"form" | "code" | "password">("form");
  const [resetStep, setResetStep] = useState<"email" | "code_password">("email");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

        {mode === "login" && (
          <MasterLoginFormLogin
            identifier={identifier} setIdentifier={setIdentifier}
            password={password} setPassword={setPassword}
            error={error} loading={loading}
            onSubmit={handleLogin}
            onGoRegister={() => { setMode("register"); setRegStep("form"); setError(""); }}
            onGoReset={() => { setMode("reset"); setResetStep("email"); setResetEmail(""); setResetCode(""); setResetPassword(""); setResetPasswordConfirm(""); setError(""); }}
          />
        )}

        {mode === "register" && (
          <MasterLoginFormRegister
            regStep={regStep} setRegStep={setRegStep}
            regName={regName} setRegName={setRegName}
            regEmail={regEmail} setRegEmail={setRegEmail}
            regPhone={regPhone} setRegPhone={setRegPhone}
            regCode={regCode} setRegCode={setRegCode}
            regPassword={regPassword} setRegPassword={setRegPassword}
            regPasswordConfirm={regPasswordConfirm} setRegPasswordConfirm={setRegPasswordConfirm}
            error={error} loading={loading}
            onRegister={handleRegister}
            onVerifyCode={handleVerifyCode}
            onSetPassword={handleSetPassword}
            onClearError={() => setError("")}
          />
        )}

        {mode === "reset" && (
          <MasterLoginFormReset
            resetStep={resetStep} setResetStep={setResetStep}
            resetEmail={resetEmail} setResetEmail={setResetEmail}
            resetCode={resetCode} setResetCode={setResetCode}
            resetPassword={resetPassword} setResetPassword={setResetPassword}
            resetPasswordConfirm={resetPasswordConfirm} setResetPasswordConfirm={setResetPasswordConfirm}
            error={error} loading={loading}
            onResetRequest={handleResetRequest}
            onResetConfirm={handleResetConfirm}
            onGoLogin={() => { setMode("login"); setError(""); }}
          />
        )}
      </div>
    </div>
  );
}
