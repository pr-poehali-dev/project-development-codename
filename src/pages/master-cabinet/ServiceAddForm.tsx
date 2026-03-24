import { Button } from "@/components/ui/button";
import { categories as CATEGORIES } from "@/components/home/categories";
import CitySelect from "@/components/ui/city-select";

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  subcategories: string[];
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
  const selectedSubs = serviceForm.subcategories || [];
  const totalTokens = Math.max(selectedSubs.length, 1) * Number(tokenCost);

  const toggleSub = (sub: string) => {
    const next = selectedSubs.includes(sub)
      ? selectedSubs.filter(s => s !== sub)
      : [...selectedSubs, sub];
    setServiceForm(f => ({ ...f, subcategories: next, category: next[0] || addMainCat }));
  };

  return (
    <form onSubmit={onSubmit} className="bg-white/4 border border-violet-500/30 rounded-2xl p-5 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold">Новая услуга</h3>
        <span className="text-violet-400 text-sm font-medium">
          {tokenCost} токенов / 30 дней
          {selectedSubs.length > 1 && <span className="ml-1 text-indigo-400">× {selectedSubs.length} = {totalTokens}</span>}
        </span>
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
          value={addMainCat}
          onChange={e => {
            setAddMainCat(e.target.value);
            setServiceForm(f => ({ ...f, category: e.target.value, subcategories: [] }));
          }}
          className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled>Категория *</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <CitySelect
          value={serviceForm.city || master?.city || ""}
          onChange={c => setServiceForm(f => ({ ...f, city: c }))}
          placeholder={`Город (${master?.city || "укажите"})`}
        />
      </div>
      {addSubcategories.length > 0 && (
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Подкатегории
            {selectedSubs.length > 0 && (
              <span className="ml-2 text-violet-400 font-medium">({selectedSubs.length} выбрано)</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {addSubcategories.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => toggleSub(sub)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  selectedSubs.includes(sub)
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-gray-200"
                }`}
              >
                {selectedSubs.includes(sub) && <span className="mr-1">✓</span>}
                {sub}
              </button>
            ))}
          </div>
          {selectedSubs.length > 1 && (
            <p className="text-xs text-indigo-400/80 mt-2">
              Будет создано {selectedSubs.length} отдельных услуги — по одной на каждую подкатегорию
            </p>
          )}
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
          {serviceLoading ? "Публикация..." : `Опубликовать — ${totalTokens} токенов`}
        </Button>
      </div>
    </form>
  );
}