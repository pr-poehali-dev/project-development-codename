import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

interface CabinetAuthProps {
  loginMode: "login" | "register" | "reset";
  setLoginMode: (m: "login" | "register" | "reset") => void;
  regStep: "form" | "code" | "password";
  setRegStep: (s: "form" | "code" | "password") => void;
  resetStep: "email" | "code_password";
  setResetStep: (s: "email" | "code_password") => void;
  loginIdentifier: string;
  setLoginIdentifier: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  loginName: string;
  setLoginName: (v: string) => void;
  loginPhone: string;
  setLoginPhone: (v: string) => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginCity: string;
  setLoginCity: (v: string) => void;
  regCode: string;
  setRegCode: (v: string) => void;
  regPassword: string;
  setRegPassword: (v: string) => void;
  regPasswordConfirm: string;
  setRegPasswordConfirm: (v: string) => void;
  resetEmail: string;
  setResetEmail: (v: string) => void;
  resetCode: string;
  setResetCode: (v: string) => void;
  resetPassword: string;
  setResetPassword: (v: string) => void;
  resetPasswordConfirm: string;
  setResetPasswordConfirm: (v: string) => void;
  loginError: string;
  loginLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  onVerifyCode: (e: React.FormEvent) => void;
  onSetPassword: (e: React.FormEvent) => void;
  onResetRequest: (e: React.FormEvent) => void;
  onResetConfirm: (e: React.FormEvent) => void;
}

export default function CabinetAuth({
  loginMode, setLoginMode,
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
  onLogin, onRegister, onVerifyCode, onSetPassword, onResetRequest, onResetConfirm,
}: CabinetAuthProps) {
  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white">HandyMan</span>
          </a>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="LayoutDashboard" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Кабинет заказчика</h1>
        </div>

        {loginMode !== "reset" && (regStep === "form" || loginMode === "login") && (
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
            <button onClick={() => { setLoginMode("login"); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${loginMode === "login" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Войти
            </button>
            <button onClick={() => { setLoginMode("register"); setRegStep("form"); }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${loginMode === "register" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Регистрация
            </button>
          </div>
        )}

        {loginMode === "login" ? (
          <form onSubmit={onLogin} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email или телефон</label>
              <input type="text" required value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="email@example.com или +7..." className={inputCls} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder="Ваш пароль" className={inputCls} />
            </div>
            {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
            <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
              {loginLoading ? "Вход..." : "Войти"}
            </Button>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs">Нет аккаунта?{" "}
                <button type="button" onClick={() => { setLoginMode("register"); setRegStep("form"); }} className="text-violet-400 hover:underline">Зарегистрироваться</button>
              </p>
              <button type="button" onClick={() => { setLoginMode("reset"); setResetStep("email"); setResetEmail(""); setResetCode(""); setResetPassword(""); setResetPasswordConfirm(""); }}
                className="text-gray-500 text-xs hover:text-gray-400 transition-colors">
                Забыл пароль
              </button>
            </div>
          </form>
        ) : loginMode === "reset" ? (
          resetStep === "email" ? (
            <form onSubmit={onResetRequest} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Отправка..." : "Отправить код"}
              </Button>
              <button type="button" onClick={() => setLoginMode("login")} className="text-gray-500 text-xs hover:text-gray-400 text-center transition-colors">
                Вернуться ко входу
              </button>
            </form>
          ) : (
            <form onSubmit={onResetConfirm} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <p className="text-white font-medium">Новый пароль</p>
                <p className="text-gray-500 text-sm mt-1">Введите код из письма и новый пароль</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Код из письма</label>
                <input type="text" required value={resetCode} onChange={e => setResetCode(e.target.value)}
                  placeholder="Код подтверждения" className={inputCls} autoFocus />
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
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Сохранение..." : "Сохранить пароль"}
              </Button>
            </form>
          )
        ) : (
          regStep === "form" ? (
            <form onSubmit={onRegister} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя</label>
                <input type="text" required value={loginName} onChange={e => setLoginName(e.target.value)}
                  placeholder="Иван Иванов" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Телефон</label>
                <input type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                <CitySelect value={loginCity} onChange={setLoginCity} variant="glass" className="w-full" required />
              </div>
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>
          ) : regStep === "code" ? (
            <form onSubmit={onVerifyCode} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Mail" size={22} className="text-emerald-400" />
                </div>
                <p className="text-white font-medium">Подтверждение email</p>
                <p className="text-gray-500 text-sm mt-1">Мы отправили код на {loginEmail}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Код из письма</label>
                <input type="text" required value={regCode} onChange={e => setRegCode(e.target.value)}
                  placeholder="Код подтверждения" className={inputCls} autoFocus />
              </div>
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Проверка..." : "Подтвердить"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSetPassword} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-center mb-1">
                <p className="text-white font-medium">Придумайте пароль</p>
                <p className="text-gray-500 text-sm mt-1">Минимум 6 символов</p>
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
              {loginError && <p className="text-amber-400 text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
                {loginLoading ? "Сохранение..." : "Сохранить и войти"}
              </Button>
            </form>
          )
        )}
      </div>
    </div>
  );
}