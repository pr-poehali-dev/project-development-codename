import { Button } from "@/components/ui/button";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

interface MasterLoginFormLoginProps {
  identifier: string;
  setIdentifier: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoRegister: () => void;
  onGoReset: () => void;
}

export default function MasterLoginFormLogin({
  identifier,
  setIdentifier,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  onGoRegister,
  onGoReset,
}: MasterLoginFormLoginProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
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
          <button type="button" onClick={onGoRegister} className="text-violet-400 hover:underline">Зарегистрироваться</button>
        </p>
        <button type="button" onClick={onGoReset} className="text-gray-500 text-xs hover:text-gray-400 transition-colors">
          Забыл пароль
        </button>
      </div>
    </form>
  );
}
