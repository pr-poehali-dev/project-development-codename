import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HomeNavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  installPrompt: Event | null;
  isInstalled: boolean;
  handleInstall: () => void;
  isMaster: boolean;
  masterBannerDismissed: boolean;
  setMasterBannerDismissed: (v: boolean) => void;
  setRegisterModalOpen: (v: boolean) => void;
  setMasterModalOpen: (v: boolean) => void;
}

const HomeNavbar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  installPrompt,
  isInstalled,
  handleInstall,
  isMaster,
  masterBannerDismissed,
  setMasterBannerDismissed,
  setRegisterModalOpen,
  setMasterModalOpen,
}: HomeNavbarProps) => {
  return (
    <>
      {/* Навигация */}
      <nav className="bg-[#0f1117]/95 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              HandyMan
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#categories" className="text-gray-400 hover:text-white text-sm transition-colors">Категории</a>
            <a href="/orders" className="text-gray-400 hover:text-white text-sm transition-colors">Лента заявок</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Тарифы</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {installPrompt && !isInstalled && (
              <Button
                variant="ghost"
                onClick={handleInstall}
                className="text-gray-400 hover:text-white hover:bg-white/8 text-sm gap-2"
              >
                <Icon name="Download" size={15} />
                Приложение
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setRegisterModalOpen(true)}
              className="text-gray-300 hover:text-white hover:bg-white/8 text-sm gap-2"
            >
              <Icon name="UserPlus" size={15} />
              Зарегистрироваться
            </Button>
            <a href="/master">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm px-4">
                <Icon name="Briefcase" size={15} className="mr-2" />
                Кабинет мастера
              </Button>
            </a>
          </div>

          <Button
            variant="ghost"
            className="md:hidden text-gray-400 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#categories" className="block text-gray-400 hover:text-white text-sm">Категории</a>
            <a href="/orders" className="block text-gray-400 hover:text-white text-sm">Лента заявок</a>
            <a href="#pricing" className="block text-gray-400 hover:text-white text-sm">Тарифы</a>
            <Button
              variant="ghost"
              onClick={() => { setRegisterModalOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10"
            >
              <Icon name="UserPlus" size={15} />
              Зарегистрироваться
            </Button>
            <Button onClick={() => setMasterModalOpen(true)} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm mt-2">
              Кабинет мастера
            </Button>
            {installPrompt && !isInstalled && (
              <Button
                variant="ghost"
                onClick={handleInstall}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10 mt-1"
              >
                <Icon name="Download" size={15} />
                Установить приложение
              </Button>
            )}
          </div>
        )}
      </nav>

      {/* Баннер для мастеров */}
      {isMaster && !masterBannerDismissed && (
        <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b border-violet-500/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center flex-shrink-0">
                <Icon name="Briefcase" size={15} className="text-violet-400" />
              </div>
              <p className="text-sm text-gray-300">
                Вы зарегистрированы как мастер —{" "}
                <a href="/master" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  опубликуйте свои услуги
                </a>
                {" "}чтобы клиенты могли вас найти
              </p>
            </div>
            <button
              onClick={() => { setMasterBannerDismissed(true); localStorage.setItem("master_banner_dismissed", "1"); }}
              className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeNavbar;
