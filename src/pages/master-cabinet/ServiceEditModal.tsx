import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { categories as CATEGORIES } from "@/components/home/categories";

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  city: string;
  price: string;
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

interface ServiceEditModalProps {
  editService: MyService | null;
  editForm: ServiceForm;
  setEditForm: (fn: (f: ServiceForm) => ServiceForm) => void;
  editMainCat: string;
  setEditMainCat: (v: string) => void;
  editLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ServiceEditModal({
  editService,
  editForm,
  setEditForm,
  editMainCat,
  setEditMainCat,
  editLoading,
  onSubmit,
  onClose,
}: ServiceEditModalProps) {
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!editService) return null;

  const editSubcategories = CATEGORIES.find(c => c.name === editMainCat)?.subcategories ?? [];
  const selectedCat = CATEGORIES.find(c => c.name === editMainCat);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">Редактировать услугу</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 overflow-y-auto flex-1 pr-1">
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
                      <span className="text-gray-500">Выберите</span>
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
                          aria-selected={editMainCat === c.name}
                          onClick={() => {
                            setEditMainCat(c.name);
                            setEditForm(f => ({ ...f, category: c.name }));
                            setCatOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                            editMainCat === c.name ? "bg-violet-600/20 text-violet-300" : "text-gray-400 hover:bg-white/8 hover:text-white"
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
          {editSubcategories.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Подкатегория
                {editForm.category && editForm.category !== editMainCat && (
                  <span className="ml-2 text-violet-400 font-medium">— {editForm.category}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {editSubcategories.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, category: sub }))}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      editForm.category === sub
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
            <Button type="button" variant="ghost" className="flex-1 text-gray-400" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={editLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
              {editLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}