import Icon from "@/components/ui/icon";

interface AuthPromptDialogProps {
  authPromptOpen: boolean;
  setAuthPromptOpen: (v: boolean) => void;
}

export default function AuthPromptDialog({ authPromptOpen, setAuthPromptOpen }: AuthPromptDialogProps) {
  if (!authPromptOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setAuthPromptOpen(false)}>
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Требуется вход</h3>
          <button onClick={() => setAuthPromptOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-5">Чтобы написать мастеру, войдите или зарегистрируйтесь как заказчик</p>
        <div className="flex flex-col gap-3">
          <a href="/cabinet" className="w-full">
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/4 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Icon name="ClipboardList" size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Войти как заказчик</p>
                <p className="text-gray-400 text-xs">Найду мастера и закажу услугу</p>
              </div>
            </div>
          </a>
          <a href="/master" className="w-full">
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/4 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Wrench" size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Войти как мастер</p>
                <p className="text-gray-400 text-xs">Принимаю заказы и зарабатываю</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
