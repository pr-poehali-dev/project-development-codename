import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

interface MasterLoginFormResetProps {
  resetStep: "email" | "code_password";
  setResetStep: (s: "email" | "code_password") => void;
  resetEmail: string; setResetEmail: (v: string) => void;
  resetCode: string; setResetCode: (v: string) => void;
  resetPassword: string; setResetPassword: (v: string) => void;
  resetPasswordConfirm: string; setResetPasswordConfirm: (v: string) => void;
  error: string;
  loading: boolean;
  onResetRequest: (e: React.FormEvent) => void;
  onResetConfirm: (e: React.FormEvent) => void;
  onGoLogin: () => void;
}

export default function MasterLoginFormReset({
  resetStep, setResetStep,
  resetEmail, setResetEmail,
  resetCode, setResetCode,
  resetPassword, setResetPassword,
  resetPasswordConfirm, setResetPasswordConfirm,
  error, loading,
  onResetRequest, onResetConfirm, onGoLogin,
}: MasterLoginFormResetProps) {
  if (resetStep === "email") {
    return (
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
        {error && <p className="text-amber-400 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full">
          {loading ? "Отправка..." : "Получить код"}
        </Button>
        <button type="button" onClick={onGoLogin}
          className="text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">← Вернуться ко входу</button>
      </form>
    );
  }

  return (
    <form onSubmit={onResetConfirm} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
  );
}
