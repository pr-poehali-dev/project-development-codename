import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface AdminLoginProps {
  loginForm: { login: string; password: string };
  setLoginForm: (f: { login: string; password: string }) => void;
  loginError: string;
  setupMode: boolean;
  setSetupMode: (v: boolean) => void;
  onLogin: () => void;
}

export default function AdminLogin({
  loginForm,
  setLoginForm,
  loginError,
  setupMode,
  setSetupMode,
  onLogin,
}: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="Shield" size={28} className="text-purple-600" />
          <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="Логин"
            value={loginForm.login}
            onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
          />
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={onLogin}>
            {setupMode ? "Создать аккаунт" : "Войти"}
          </Button>
          <button
            className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
            onClick={() => setSetupMode(!setupMode)}
          >
            {setupMode ? "Уже есть аккаунт" : "Первый вход? Создать аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}
