import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface LoginRegisterModalsProps {
  loginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;
  registerModalOpen: boolean;
  setRegisterModalOpen: (v: boolean) => void;
  setOrderModalOpen: (v: boolean) => void;
}

const LoginRegisterModals = ({
  loginModalOpen,
  setLoginModalOpen,
  registerModalOpen,
  setRegisterModalOpen,
  setOrderModalOpen,
}: LoginRegisterModalsProps) => {
  return (
    <>
      {/* Модалка входа */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="bg-[#0f1117] border border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Войти</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm text-center -mt-2">Выберите роль для входа</p>
          <div className="flex flex-col gap-3 mt-2">
            <a href="/master" onClick={() => setLoginModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="Wrench" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я исполнитель</p>
                  <p className="text-gray-400 text-xs mt-0.5">Вход в кабинет мастера</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-violet-400 ml-auto transition-colors" />
              </div>
            </a>
            <a href="/cabinet" onClick={() => setLoginModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardList" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я заказчик</p>
                  <p className="text-gray-400 text-xs mt-0.5">Вход в кабинет заказчика</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-indigo-400 ml-auto transition-colors" />
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка выбора роли при регистрации */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="bg-[#0f1117] border border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Кто вы?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm text-center -mt-2">Выберите роль для регистрации</p>
          <div className="flex flex-col gap-3 mt-2">
            <a href="/master" onClick={() => setRegisterModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="Wrench" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я мастер</p>
                  <p className="text-gray-400 text-xs mt-0.5">Принимаю заказы и зарабатываю</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-violet-400 ml-auto transition-colors" />
              </div>
            </a>
            <a href="/cabinet" onClick={() => setRegisterModalOpen(false)}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/4 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardList" size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Я заказчик</p>
                  <p className="text-gray-400 text-xs mt-0.5">Размещаю заявку и нахожу специалиста</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-indigo-400 ml-auto transition-colors" />
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginRegisterModals;