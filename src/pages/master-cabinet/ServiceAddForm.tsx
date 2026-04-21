import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categories as CATEGORIES } from "@/components/home/categories";
import CitySelect from "@/components/ui/city-select";
import Icon from "@/components/ui/icon";

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
  const tokenCost = servicesCount === 0 ? 10 : servicesCount === 1 ? 8 : 6;
  const addSubcategories = CATEGORIES.find(c => c.name === addMainCat)?.subcategories ?? [];
  const selectedSubs = serviceForm.subcategories || [];
  const selectedCat = CATEGORIES.find(c => c.name === addMainCat);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleSub = (sub: string) => {
    const next = selectedSubs.includes(sub)
      ? selectedSubs.filter(s => s !== sub)
      : [...selectedSubs, sub];
    setServiceForm(f => ({ ...f, subcategories: next, category: addMainCat || f.category }));
  };

  return (
    <form onSubmit={onSubmit} className="bg-white/4 border border-violet-500/30 rounded-2xl p-5 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold">Новая услуга</h3>
        <span className="text-violet-400 text-sm font-medium">
          {tokenCost} токенов / 30 дней
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
        <div ref={catRef} className="relative">
          <button
            type="button"
            onClick={() => setCatOpen(o => !o)}
            className={`w-full flex items-center gap-2 bg-[#0f1117] border rounded-xl pl-3 pr-8 py-2.5 text-sm text-white transition-colors ${catOpen ? "border-violet-500" : "border-white/10 hover:border-white/20"}`}
          >
            {selectedCat ? (
              <>
                <Icon name={selectedCat.icon} size={14} className="text-violet-400 flex-shrink-0" />
                <span className="truncate">{selectedCat.name}</span>
              </>
            ) : (
              <>
                <Icon name="LayoutGrid" size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-500">Категория *</span>
              </>
            )}
            <Icon
              name={catOpen ? "ChevronUp" : "ChevronDown"}
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </button>
          {catOpen && (
            <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-[#0f1117] border border-white/10 rounded-xl shadow-xl overflow-hidden">
              <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
                {CATEGORIES.map(c => (
                  <li
                    key={c.name}
                    role="option"
                    aria-selected={addMainCat === c.name}
                    onClick={() => {
                      setAddMainCat(c.name);
                      setServiceForm(f => ({ ...f, category: c.name, subcategories: [] }));
                      setCatOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                      addMainCat === c.name ? "bg-violet-600/20 text-violet-300" : "text-gray-400 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon name={c.icon} size={14} />
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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