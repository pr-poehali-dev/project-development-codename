import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { categories } from "@/components/home/categories";

interface MasterForm {
  name: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  about: string;
  status: string;
}

interface MasterRegisterModalProps {
  masterModalOpen: boolean;
  setMasterModalOpen: (v: boolean) => void;
  masterForm: MasterForm;
  setMasterForm: (form: MasterForm) => void;
  masterSent: boolean;
  setMasterSent: (v: boolean) => void;
  masterLoading: boolean;
  masterError: string;
  handleMasterSubmit: (e: React.FormEvent) => void;
}

const MasterRegisterModal = ({
  masterModalOpen,
  setMasterModalOpen,
  masterForm,
  setMasterForm,
  masterSent,
  setMasterSent,
  masterLoading,
  masterError,
  handleMasterSubmit,
}: MasterRegisterModalProps) => {
  return (
    <Dialog open={masterModalOpen} onOpenChange={(v) => { setMasterModalOpen(v); if (!v) setMasterSent(false); }}>
      <DialogContent className="bg-[#1a1d27] border border-white/10 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {masterSent ? "Заявка отправлена!" : "Регистрация мастера"}
          </DialogTitle>
        </DialogHeader>

        {masterSent ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-emerald-400" />
            </div>
            <p className="text-gray-300 mb-2">Добро пожаловать, <span className="text-white font-semibold">{masterForm.name}</span>!</p>
            <p className="text-gray-500 text-sm mb-1">Аккаунт создан. Откликайтесь на заявки бесплатно — токены нужны только когда заказчик выбирает вас исполнителем.</p>
            <p className="text-gray-600 text-xs mb-6">Для входа используйте email <span className="text-violet-400">{masterForm.email}</span></p>
            <div className="flex flex-col gap-3">
              <a href="/master" onClick={() => { setMasterModalOpen(false); setMasterSent(false); }}>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Перейти в кабинет мастера
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </a>
              <a href="/orders" onClick={() => { setMasterModalOpen(false); setMasterSent(false); }}>
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  Смотреть заявки
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleMasterSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя *</label>
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Иван Иванов"
                value={masterForm.name}
                onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Номер телефона (для связи с клиентами)</label>
              <input
                type="tel"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="+7 (999) 000-00-00"
                value={masterForm.phone}
                onChange={(e) => setMasterForm({ ...masterForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email *</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="you@example.com"
                value={masterForm.email}
                onChange={(e) => setMasterForm({ ...masterForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
              <CitySelect
                value={masterForm.city || ""}
                onChange={(c) => setMasterForm({ ...masterForm, city: c })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Категория услуг *</label>
              <select
                required
                className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                style={{ colorScheme: "dark" }}
                value={masterForm.category}
                onChange={(e) => setMasterForm({ ...masterForm, category: e.target.value })}
              >
                <option value="" disabled style={{ background: "#0f1117", color: "#9ca3af" }}>Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name} style={{ background: "#0f1117", color: "#fff" }}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Статус</label>
              <div className="flex gap-3">
                {["Самозанятый / ИП / Компания", "Без статуса"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMasterForm({ ...masterForm, status: s })}
                    className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                      masterForm.status === s
                        ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                        : "bg-white/4 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">О себе</label>
              <textarea
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Опыт работы, специализация, достижения..."
                value={masterForm.about}
                onChange={(e) => setMasterForm({ ...masterForm, about: e.target.value })}
              />
            </div>
            {masterError && <p className="text-red-400 text-sm">{masterError}</p>}
            <Button
              type="submit"
              disabled={masterLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {masterLoading ? "Регистрация..." : "Зарегистрироваться"}
              {!masterLoading && <Icon name="ArrowRight" size={16} className="ml-2" />}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MasterRegisterModal;
