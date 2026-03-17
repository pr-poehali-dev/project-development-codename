import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface MasterLoginFormProps {
  inputPhone: string;
  setInputPhone: (v: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MasterLoginForm({ inputPhone, setInputPhone, error, onSubmit }: MasterLoginFormProps) {
  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Icon name="Wrench" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Кабинет мастера</h1>
          <p className="text-gray-400 text-sm">Войдите по номеру телефона</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона</label>
            <input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="+7 (999) 000-00-00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white w-full">
            Войти
          </Button>
          <p className="text-center text-xs text-gray-600">
            Нет аккаунта?{" "}
            <a href="/" className="text-violet-500 hover:text-violet-400 transition-colors">
              Зарегистрируйтесь на главной
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
