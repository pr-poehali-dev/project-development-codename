import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HomeNavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  installPrompt: Event | null;
  isInstalled: boolean;
  handleInstall: () => void;
  isMaster: boolean;
  isCustomer: boolean;
  masterBannerDismissed: boolean;
  setMasterBannerDismissed: (v: boolean) => void;
  setRegisterModalOpen: (v: boolean) => void;
  setMasterModalOpen: (v: boolean) => void;
  setLoginModalOpen: (v: boolean) => void;
}

const HomeNavbar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  installPrompt,
  isInstalled,
  handleInstall,
  isMaster,
  isCustomer,
  masterBannerDismissed,
  setMasterBannerDismissed,
  setRegisterModalOpen,
  setMasterModalOpen,
  setLoginModalOpen,
}: HomeNavbarProps) => {
  const isLoggedIn = isMaster || isCustomer;
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

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
            <a href="/masters" className="text-gray-400 hover:text-white text-sm transition-colors">Мастера</a>
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
            {!installPrompt && !isInstalled && (
              <Button
                variant="ghost"
                onClick={() => setInstallGuideOpen(true)}
                className="text-gray-400 hover:text-white hover:bg-white/8 text-sm gap-2"
              >
                <Icon name="Smartphone" size={15} />
                Приложение
              </Button>
            )}

            {/* Кнопки Войти и Зарегистрироваться — только если не залогинен */}
            {!isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-gray-300 hover:text-white hover:bg-white/8 text-sm gap-2"
                >
                  <Icon name="LogIn" size={15} />
                  Войти
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setRegisterModalOpen(true)}
                  className="text-gray-300 hover:text-white hover:bg-white/8 text-sm gap-2"
                >
                  <Icon name="UserPlus" size={15} />
                  Зарегистрироваться
                </Button>
              </>
            )}

            {/* Кабинет заказчика — если залогинен как заказчик */}
            {isCustomer && (
              <a href="/cabinet">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/8 text-sm gap-2">
                  <Icon name="LayoutDashboard" size={15} />
                  Мой кабинет
                </Button>
              </a>
            )}

            {/* Кабинет мастера — если мастер, или никто не залогинен */}
            {(isMaster || !isLoggedIn) && (
              <a href="/master">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm px-4">
                  <Icon name="Briefcase" size={15} className="mr-2" />
                  Кабинет мастера
                </Button>
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isMaster && (
              <a href="/master">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs px-3 h-8">
                  <Icon name="Briefcase" size={13} className="mr-1" />
                  Кабинет
                </Button>
              </a>
            )}
            {isCustomer && (
              <a href="/cabinet">
                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white border border-white/10 text-xs px-3 h-8">
                  <Icon name="LayoutDashboard" size={13} className="mr-1" />
                  Кабинет
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              className="text-gray-400 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#categories" className="block text-gray-400 hover:text-white text-sm">Категории</a>
            <a href="/masters" className="block text-gray-400 hover:text-white text-sm">Мастера</a>
            <a href="/orders" className="block text-gray-400 hover:text-white text-sm">Лента заявок</a>
            <a href="#pricing" className="block text-gray-400 hover:text-white text-sm">Тарифы</a>

            {!isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10"
                >
                  <Icon name="LogIn" size={15} />
                  Войти
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setRegisterModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10"
                >
                  <Icon name="UserPlus" size={15} />
                  Зарегистрироваться
                </Button>
              </>
            )}

            {isCustomer && (
              <a href="/cabinet" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10">
                  <Icon name="LayoutDashboard" size={15} />
                  Мой кабинет
                </Button>
              </a>
            )}

            {isMaster ? (
              <a href="/master" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm mt-2">
                  <Icon name="Briefcase" size={15} className="mr-2" />
                  Кабинет мастера
                </Button>
              </a>
            ) : !isCustomer && (
              <Button
                onClick={() => { setMasterModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm mt-2"
              >
                Кабинет мастера
              </Button>
            )}

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
            {!installPrompt && !isInstalled && (
              <Button
                variant="ghost"
                onClick={() => { setInstallGuideOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10 text-sm gap-2 border border-white/10 mt-1"
              >
                <Icon name="Smartphone" size={15} />
                Добавить на экран
              </Button>
            )}
          </div>
        )}
      </nav>

      {/* Модалка — установка приложения */}
      {installGuideOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setInstallGuideOpen(false)}>
          <div className="bg-[#13161f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Icon name="Smartphone" size={20} className="text-violet-400" />
                <h3 className="text-white font-bold text-base">Добавить на экран телефона</h3>
              </div>
              <button onClick={() => setInstallGuideOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* iPhone */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍎</span>
                  <span className="text-white font-semibold text-sm">iPhone / iPad (Safari)</span>
                </div>
                <ol className="space-y-2">
                  {[
                    { icon: "Share2", text: 'Нажмите кнопку «Поделиться» (квадрат со стрелкой вверх) внизу экрана' },
                    { icon: "PlusSquare", text: 'Прокрутите вниз и выберите «На экран "Домой"»' },
                    { icon: "Check", text: 'Нажмите «Добавить» — иконка появится на рабочем столе' },
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                      <div className="flex items-start gap-2">
                        <Icon name={step.icon} size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-snug">{step.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-white/8" />

              {/* Android */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <span className="text-white font-semibold text-sm">Android (Chrome)</span>
                </div>
                <ol className="space-y-2">
                  {[
                    { icon: "MoreVertical", text: 'Нажмите три точки (⋮) в правом верхнем углу браузера' },
                    { icon: "PlusSquare", text: 'Выберите «Добавить на главный экран»' },
                    { icon: "Check", text: 'Подтвердите — иконка появится на рабочем столе' },
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                      <div className="flex items-start gap-2">
                        <Icon name={step.icon} size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-snug">{step.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-gray-600 text-xs text-center pb-1">Сайт будет открываться как приложение — без адресной строки</p>
            </div>
          </div>
        </div>
      )}

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