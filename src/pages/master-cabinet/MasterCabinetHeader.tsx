import Icon from "@/components/ui/icon";

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

type Tab = "balance" | "history" | "responses" | "services" | "profile";

interface MasterCabinetHeaderProps {
  master: Master;
  tab: Tab;
  setTab: (t: Tab) => void;
  myServices: { id: number }[];
  myResponses: { id: number }[];
  buySuccess: string;
  serviceSuccess: string;
  serviceError: string;
  onLogout: () => void;
}

export default function MasterCabinetHeader({
  master,
  tab,
  setTab,
  myServices,
  myResponses,
  buySuccess,
  serviceSuccess,
  serviceError,
  onLogout,
}: MasterCabinetHeaderProps) {
  return (
    <>
      {/* Шапка */}
      <div className="border-b border-white/8 bg-[#0a0d16]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </a>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
              {master?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{master?.name}</p>
              <p className="text-gray-500 text-xs">{master?.category} · {master?.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {master?.id && (
              <a href={`/master-page?id=${master.id}`} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1.5 transition-colors">
                <Icon name="User" size={15} />
                Мой профиль
              </a>
            )}
            <button onClick={onLogout} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1.5 transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Баланс */}
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Баланс токенов</p>
            <p className="text-5xl font-bold text-white">{master?.balance ?? 0}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center">
            <Icon name="Zap" size={30} className="text-violet-400" />
          </div>
        </div>

        {/* Уведомления */}
        {buySuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{buySuccess}
          </div>
        )}
        {serviceSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={16} />{serviceSuccess}
          </div>
        )}
        {serviceError && (
          <div className="bg-red-600/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
            <Icon name="AlertCircle" size={16} />{serviceError}
          </div>
        )}

        {/* Вкладки */}
        <div className="grid grid-cols-5 gap-1 bg-white/4 rounded-xl p-1 mb-6">
          <button onClick={() => setTab("balance")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "balance" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Баланс
          </button>
          <button onClick={() => setTab("services")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "services" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Услуги
            {myServices.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "services" ? "bg-white/20" : "bg-white/10"}`}>{myServices.length}</span>}
          </button>
          <button onClick={() => setTab("responses")} className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${tab === "responses" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Отклики
            {myResponses.length > 0 && <span className={`text-[10px] px-1 py-0.5 rounded ${tab === "responses" ? "bg-white/20" : "bg-white/10"}`}>{myResponses.length}</span>}
          </button>
          <button onClick={() => setTab("history")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "history" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            История
          </button>
          <button onClick={() => setTab("profile")} className={`py-2 rounded-lg text-xs font-medium transition-all ${tab === "profile" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Профиль
          </button>
        </div>
      </div>
    </>
  );
}