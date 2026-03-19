import { Button } from "@/components/ui/button";
import { categories as CATEGORIES } from "@/components/home/categories";

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  city: string;
  price: string;
}

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

const getParentCategory = (value: string) =>
  CATEGORIES.find(c => c.subcategories.includes(value))?.name ?? (CATEGORIES.some(c => c.name === value) ? value : "");

interface ServiceAddFormProps {
  master: Master;
  serviceForm: ServiceForm;
  setServiceForm: (fn: (f: ServiceForm) => ServiceForm) => void;
  serviceLoading: boolean;
  servicesCount: number;
  addMainCat: string;
  setAddMainCat: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ServiceAddForm({
  master,
  serviceForm,
  setServiceForm,
  serviceLoading,
  servicesCount,
  addMainCat,
  setAddMainCat,
  onSubmit,
  onCancel,
}: ServiceAddFormProps) {
  const tokenCost = servicesCount === 0 ? "10" : servicesCount === 1 ? "8" : "6";
  const addSubcategories = CATEGORIES.find(c => c.name === addMainCat)?.subcategories ?? [];

  return (
    <form onSubmit={onSubmit} className="bg-white/4 border border-violet-500/30 rounded-2xl p-5 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold">Новая услуга</h3>
        <span className="text-violet-400 text-sm font-medium">{tokenCost} токенов / 14 дней</span>
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
          value={addMainCat || getParentCategory(serviceForm.category) || (CATEGORIES.some(c => c.name === serviceForm.category) ? serviceForm.category : "")}
          onChange={e => { setAddMainCat(e.target.value); setServiceForm(f => ({ ...f, category: e.target.value })); }}
          className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled>Категория *</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <input
          placeholder={`Город (${master?.city || "укажите"})`}
          value={serviceForm.city || master?.city || ""}
          onChange={e => setServiceForm(f => ({ ...f, city: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>
      {addSubcategories.length > 0 && (
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Подкатегория
            {serviceForm.category && serviceForm.category !== addMainCat && (
              <span className="ml-2 text-violet-400 font-medium">— {serviceForm.category}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {addSubcategories.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setServiceForm(f => ({ ...f, category: sub }))}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  serviceForm.category === sub
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
      <input
        type="number"
        placeholder="Цена от (₽)"
        value={serviceForm.price}
        onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
      />
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={onCancel}>Отмена</Button>
        <Button type="submit" disabled={serviceLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
          {serviceLoading ? "Публикация..." : `Опубликовать — ${tokenCost} токенов`}
        </Button>
      </div>
    </form>
  );
}