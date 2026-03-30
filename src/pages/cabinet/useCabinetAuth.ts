import { useState } from "react";

const AUTH_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface UseCabinetAuthProps {
  loadProfile: (phone: string) => Promise<void>;
  setCustomer: (c: Customer | null) => void;
  setOrders: (o: never[]) => void;
}

export function useCabinetAuth({ loadProfile, setCustomer, setOrders }: UseCabinetAuthProps) {
  const [loginMode, setLoginMode] = useState<"login" | "register" | "reset">("login");
  const [regStep, setRegStep] = useState<"form" | "code" | "password">("form");
  const [resetStep, setResetStep] = useState<"email" | "code_password">("email");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCity, setLoginCity] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth_login", email: loginIdentifier.includes("@") ? loginIdentifier : undefined, phone: !loginIdentifier.includes("@") ? loginIdentifier : undefined, password: loginPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        if (parsed.master_phone) localStorage.setItem("master_phone", parsed.master_phone);
        await loadProfile(parsed.user.phone);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (regPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email: loginEmail, phone: loginPhone, name: loginName, city: loginCity }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) {
        if (parsed.already_exists) setLoginMode("login");
        setLoginError(parsed.error);
        return;
      }
      if (parsed.success) setRegStep("code");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_code", email: loginEmail, code: regCode }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        const res2 = await fetch(AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set_password", email: loginEmail, password: regPassword }),
        });
        const data2 = await res2.json();
        const parsed2 = typeof data2 === "string" ? JSON.parse(data2) : data2;
        if (parsed2.error) { setLoginError(parsed2.error); return; }
        if (parsed2.success) {
          localStorage.setItem("customer_phone", parsed2.user.phone);
          await loadProfile(parsed2.user.phone);
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (regPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_password", email: loginEmail, password: regPassword }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally { setLoginLoading(false); }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password_request", email: resetEmail }) });
      const d = await res.json();
      const parsed = typeof d === "string" ? JSON.parse(d) : d;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) setResetStep("code_password");
    } finally { setLoginLoading(false); }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword !== resetPasswordConfirm) { setLoginError("Пароли не совпадают"); return; }
    if (resetPassword.length < 6) { setLoginError("Пароль минимум 6 символов"); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password_confirm", email: resetEmail, code: resetCode, password: resetPassword }) });
      const d = await res.json();
      const parsed = typeof d === "string" ? JSON.parse(d) : d;
      if (parsed.error) { setLoginError(parsed.error); return; }
      if (parsed.success) {
        localStorage.setItem("customer_phone", parsed.user.phone);
        await loadProfile(parsed.user.phone);
      }
    } finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_phone");
    setCustomer(null);
    setOrders([]);
    setLoginIdentifier("");
    setLoginPassword("");
  };

  return {
    loginMode, setLoginMode: (m: "login" | "register" | "reset") => { setLoginMode(m); setLoginError(""); },
    regStep, setRegStep,
    resetStep, setResetStep,
    loginIdentifier, setLoginIdentifier,
    loginPassword, setLoginPassword,
    loginName, setLoginName,
    loginPhone, setLoginPhone,
    loginEmail, setLoginEmail,
    loginCity, setLoginCity,
    regCode, setRegCode,
    regPassword, setRegPassword,
    regPasswordConfirm, setRegPasswordConfirm,
    resetEmail, setResetEmail,
    resetCode, setResetCode,
    resetPassword, setResetPassword,
    resetPasswordConfirm, setResetPasswordConfirm,
    loginError, loginLoading,
    handleLogin,
    handleRegister,
    handleVerifyCode,
    handleSetPassword,
    handleResetRequest,
    handleResetConfirm,
    handleLogout,
  };
}