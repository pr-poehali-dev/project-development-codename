import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const CATEGORIES = [
  "Авторемонт","Ремонт жилья","Строительство","Бьюти","IT-помощь",
  "Сантехника","Электрика","Перевозки","Няня","Клининг","Прочее",
];

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  city: string;
  price: string;
}

interface MasterTabServicesProps {
  master: Master;
  myServices: MyService[];
  showServiceForm: boolean;
  setShowServiceForm: (v: boolean) => void;
  serviceForm: ServiceForm;
  setServiceForm: (fn: (f: ServiceForm) => ServiceForm) => void;
  serviceLoading: boolean;
  onAddService: (e: React.FormEvent) => void;
  onToggleService: (serviceId: number, isActive: boolean) => void;
  onBoostService: (serviceId: number) => void;
  onUpdateService: (serviceId: number, data: ServiceForm) => Promise<void>;
  onDeleteService: (serviceId: number) => Promise<void>;
}

export default function MasterTabServices({
  master,
  myServices,
  showServiceForm,
  setShowServiceForm,
  serviceForm,
  setServiceForm,
  serviceLoading,
  onAddService,
  onToggleService,
  onBoostService,
  onUpdateService,
  onDeleteService,
}: MasterTabServicesProps) {
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [deleteServiceLoading, setDeleteServiceLoading] = useState(false);

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    setDeleteServiceLoading(true);
    await onDeleteService(deleteServiceId);
    setDeleteServiceLoading(false);
    setDeleteServiceId(null);
  };

  const [editService, setEditService] = useState<MyService | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>({ title: "", description: "", category: "", city: "", price: "" });
  const [editLoading, setEditLoading] = useState(false);

  const openEditService = (s: MyService) => {
    setEditService(s);
    setEditForm({ title: s.title, description: s.description, category: s.category, city: s.city, price: s.price ? String(s.price) : "" });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    setEditLoading(true);
    await onUpdateService(editService.id, editForm);
    setEditLoading(false);
    setEditService(null);
  };

  return (
    <div>
      {/* Модальное окно подтверждения удаления */}
      {deleteServiceId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-600/15 flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={24} className="text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Удалить услугу?</h3>
            <p className="text-gray-400 text-sm mb-6">Услуга будет удалена с сайта навсегда.</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 text-gray-400" onClick={() => setDeleteServiceId(null)}>Отмена</Button>
              <Button disabled={deleteServiceLoading} onClick={handleDeleteService} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
                {deleteServiceLoading ? "Удаление..." : "Удалить"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования услуги */}
      {editService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Редактировать услугу</h3>
              <button onClick={() => setEditService(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Название *</label>
                <input
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Описание</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Категория *</label>
                  <select
                    required
                    value={editForm.category}
                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="" disabled>Выберите</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Город *</label>
                  <input
                    required
                    value={editForm.city}
                    onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Цена от, ₽</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="Оставьте пустым если договорная"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={() => setEditService(null)}>Отмена</Button>
                <Button type="submit" disabled={editLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                  {editLoading ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ценник публикации */}
      {!showServiceForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-600/15 to-indigo-600/5 border border-violet-500/25 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <Icon name="Briefcase" size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Публикация услуги</p>
                <p className="text-violet-300 text-sm font-bold">300 ₽ / месяц</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {["Размещение в разделе «Все услуги»", "Показ всем клиентам на главной", "Ссылка на ваш профиль"].map(f => (
                <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Icon name="Check" size={12} className="text-violet-400 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button onClick={() => setShowServiceForm(true)} className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm gap-1.5">
              <Icon name="Plus" size={15} />Добавить услугу
            </Button>
          </div>
          <div className="bg-gradient-to-br from-amber-600/15 to-orange-600/5 border border-amber-500/25 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
                <Icon name="TrendingUp" size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Поднятие в топ</p>
                <p className="text-amber-300 text-sm font-bold">50 ₽ за раз</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {["Ваша услуга поднимается выше всех", "Новые клиенты видят вас первым", "Действует до следующей публикации"].map(f => (
                <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Icon name="Check" size={12} className="text-amber-400 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-xs text-center">Доступно после публикации услуги</p>
          </div>
        </div>
      )}

      {showServiceForm && (
        <form onSubmit={onAddService} className="bg-white/4 border border-violet-500/30 rounded-2xl p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-semibold">Новая услуга</h3>
            <span className="text-violet-400 text-sm font-medium">300 ₽ / месяц</span>
          </div>
          <input
            required
            placeholder="Название услуги *"
            value={serviceForm.title}
            onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <textarea
            rows={2}
            placeholder="Описание (необязательно)"
            value={serviceForm.description}
            onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={serviceForm.category || master?.category || ""}
              onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="" disabled>Категория *</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder={`Город (${master?.city || "укажите"})`}
              value={serviceForm.city || master?.city || ""}
              onChange={e => setServiceForm(f => ({ ...f, city: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <input
            type="number"
            placeholder="Цена от (₽)"
            value={serviceForm.price}
            onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
            <Icon name="Info" size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-amber-300/80 text-xs leading-relaxed">Оплата через ЮKassa будет подключена в ближайшее время. Сейчас услуги публикуются бесплатно для тестирования.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={() => setShowServiceForm(false)}>Отмена</Button>
            <Button type="submit" disabled={serviceLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
              {serviceLoading ? "Публикация..." : "Опубликовать — 300 ₽"}
            </Button>
          </div>
        </form>
      )}

      {myServices.length === 0 && !showServiceForm ? (
        <div className="text-center py-8 text-gray-500">
          <Icon name="Briefcase" size={32} className="mx-auto mb-3 opacity-40" />
          <p>Услуг пока нет — добавьте первую</p>
        </div>
      ) : myServices.length > 0 && (
        <div className="flex flex-col gap-3">
          {myServices.map(s => {
            const isPaid = s.paid_until && new Date(s.paid_until) > new Date();
            const isBoosted = s.boosted_until && new Date(s.boosted_until) > new Date();
            return (
              <div key={s.id} className={`bg-white/4 border rounded-xl p-4 ${isBoosted ? "border-amber-500/30" : s.is_active ? "border-white/8" : "border-white/4 opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-medium text-sm">{s.title}</p>
                      {isBoosted && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Icon name="TrendingUp" size={9}/>В топе</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-gray-500 text-xs">{s.category}</span>
                      <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10}/>{s.city}</span>
                      {s.price && <span className="text-emerald-400 text-xs">от {s.price.toLocaleString("ru-RU")} ₽</span>}
                      {isPaid && s.paid_until && <span className="text-violet-400 text-xs">до {new Date(s.paid_until).toLocaleDateString("ru-RU", {day:"numeric",month:"short"})}</span>}
                    </div>
                    {s.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{s.description}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEditService(s)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border bg-white/8 text-gray-300 border-white/10 hover:bg-white/15 transition-colors flex items-center gap-1"
                    >
                      <Icon name="Pencil" size={11}/>Изменить
                    </button>
                    <button
                      onClick={() => setDeleteServiceId(s.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border bg-red-600/10 text-red-400 border-red-500/20 hover:bg-red-600/20 transition-colors flex items-center gap-1"
                    >
                      <Icon name="Trash2" size={11}/>Удалить
                    </button>
                    <button
                      onClick={() => onBoostService(s.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border bg-amber-600/15 text-amber-400 border-amber-500/20 hover:bg-amber-600/25 transition-colors flex items-center gap-1"
                    >
                      <Icon name="TrendingUp" size={11}/>50 ₽
                    </button>
                    <button
                      onClick={() => onToggleService(s.id, !s.is_active)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${s.is_active ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20 hover:bg-red-600/15 hover:text-red-400 hover:border-red-500/20" : "bg-gray-600/15 text-gray-400 border-gray-500/20 hover:bg-emerald-600/15 hover:text-emerald-400 hover:border-emerald-500/20"}`}
                    >
                      {s.is_active ? "Скрыть" : "Показать"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}