import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import CitySelect from "@/components/ui/city-select";
import { categories } from "@/components/home/categories";

interface OrderForm {
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

interface OrderModalProps {
  orderModalOpen: boolean;
  setOrderModalOpen: (v: boolean) => void;
  orderForm: OrderForm;
  setOrderForm: (form: OrderForm) => void;
  orderSent: boolean;
  setOrderSent: (v: boolean) => void;
  orderLoading: boolean;
  orderError: string;
  setOrderError: (v: string) => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
}

const OrderModal = ({
  orderModalOpen,
  setOrderModalOpen,
  orderForm,
  setOrderForm,
  orderSent,
  setOrderSent,
  orderLoading,
  orderError,
  setOrderError,
  handleOrderSubmit,
}: OrderModalProps) => {
  const [selectedMainCat, setSelectedMainCat] = React.useState("");

  React.useEffect(() => {
    if (orderModalOpen && orderForm.category) {
      const isMain = categories.some(c => c.name === orderForm.category);
      if (isMain) {
        setSelectedMainCat(orderForm.category);
      } else {
        const parent = categories.find(c => c.subcategories.includes(orderForm.category));
        if (parent) setSelectedMainCat(parent.name);
      }
    }
    if (!orderModalOpen) setSelectedMainCat("");
  }, [orderModalOpen]);

  const mainCatObj = categories.find(c => c.name === selectedMainCat);
  const subcategories = mainCatObj?.subcategories ?? [];

  const handleMainCatChange = (name: string) => {
    setSelectedMainCat(name);
    setOrderForm({ ...orderForm, category: name });
  };

  const handleSubcatSelect = (sub: string) => {
    setOrderForm({ ...orderForm, category: sub });
  };

  return (
    <Dialog open={orderModalOpen} onOpenChange={(v) => { setOrderModalOpen(v); if (!v) { setOrderSent(false); setOrderError(""); setSelectedMainCat(""); } }}>
      <DialogContent className="bg-[#1a1d27] border border-white/10 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {orderSent ? "Заявка опубликована!" : "Создать заявку"}
          </DialogTitle>
        </DialogHeader>

        {orderSent ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-emerald-400" />
            </div>
            <p className="text-gray-300 mb-2">Заявка опубликована, <span className="text-white font-semibold">{orderForm.contact_name}</span>!</p>
            <p className="text-gray-500 text-sm">Мастера увидят вашу заявку и начнут откликаться. Мы сообщим вам об откликах.</p>
            <Button
              className="mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
              onClick={() => { setOrderModalOpen(false); setOrderSent(false); }}
            >
              Отлично!
            </Button>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Что нужно сделать? *</label>
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Например: починить кран на кухне"
                value={orderForm.title}
                onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Категория *</label>
                <select
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  style={{ colorScheme: "dark" }}
                  value={selectedMainCat}
                  onChange={(e) => handleMainCatChange(e.target.value)}
                >
                  <option value="" disabled style={{ background: "#0f1117", color: "#9ca3af" }}>Выберите</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name} style={{ background: "#0f1117", color: "#fff" }}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Город *</label>
                <CitySelect
                  value={orderForm.city}
                  onChange={(c) => setOrderForm({ ...orderForm, city: c })}
                  required
                />
              </div>
            </div>

            {/* Подкатегории */}
            {subcategories.length > 0 && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Уточните подкатегорию
                  {orderForm.category && orderForm.category !== selectedMainCat && (
                    <span className="ml-2 text-violet-400 font-medium">— {orderForm.category}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcatSelect(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        orderForm.category === sub
                          ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-gray-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Подробное описание *</label>
              <textarea
                required
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Опишите задачу подробнее: объём работ, адрес, особые пожелания..."
                value={orderForm.description}
                onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Бюджет, ₽</label>
              <input
                type="number"
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Оставьте пустым, если не знаете"
                value={orderForm.budget}
                onChange={(e) => setOrderForm({ ...orderForm, budget: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ваше имя *</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Иван"
                  value={orderForm.contact_name}
                  onChange={(e) => setOrderForm({ ...orderForm, contact_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Телефон *</label>
                <input
                  required
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="+7 (999) 000-00-00"
                  value={orderForm.contact_phone}
                  onChange={(e) => setOrderForm({ ...orderForm, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="для уведомлений об откликах"
                value={orderForm.contact_email}
                onChange={(e) => setOrderForm({ ...orderForm, contact_email: e.target.value })}
              />
            </div>
            {orderError && (
              <p className="text-red-400 text-sm">{orderError}</p>
            )}
            <Button
              type="submit"
              disabled={orderLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {orderLoading ? "Публикуем..." : "Опубликовать заявку"}
              {!orderLoading && <Icon name="ArrowRight" size={16} className="ml-2" />}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
