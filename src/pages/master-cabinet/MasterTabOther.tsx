import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { categories } from "@/components/home/categories";
import CitySelect from "@/components/ui/city-select";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  categories: string[];
  city: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: number;
  type: "purchase" | "spend";
  amount: number;
  description: string;
  created_at: string;
}

interface MyResponse {
  id: number;
  order_id: number;
  order_title: string;
  order_category: string;
  order_status: string;
  order_city: string;
  message: string;
  created_at: string;
}

type Tab = "responses" | "history" | "profile";

interface MasterTabOtherProps {
  tab: Tab;
  master: Master;
  transactions: Transaction[];
  myResponses: MyResponse[];

  // Profile edit
  editName: string;
  setEditName: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editAbout: string;
  setEditAbout: (v: string) => void;
  editCategories: string[];
  setEditCategories: (v: string[]) => void;
  profileLoading: boolean;
  profileSuccess: string;
  onSaveProfile: (e: React.FormEvent) => void;

  // Password change
  pwOld: string;
  setPwOld: (v: string) => void;
  pwNew: string;
  setPwNew: (v: string) => void;
  pwConfirm: string;
  setPwConfirm: (v: string) => void;
  pwLoading: boolean;
  pwError: string;
  pwSuccess: string;
  onChangePassword: (e: React.FormEvent) => void;
}

export default function MasterTabOther({
  tab,
  master,
  transactions,
  myResponses,
  editName, setEditName,
  editCity, setEditCity,
  editAbout, setEditAbout,
  editCategories, setEditCategories,
  profileLoading, profileSuccess,
  onSaveProfile,
  pwOld, setPwOld,
  pwNew, setPwNew,
  pwConfirm, setPwConfirm,
  pwLoading, pwError, pwSuccess,
  onChangePassword,
}: MasterTabOtherProps) {
  if (tab === "responses") {
    return (
      <div className="flex flex-col gap-3">
        {myResponses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Icon name="MessageCircle" size={32} className="mx-auto mb-3 opacity-40" />
            <p>Вы ещё не откликались на заявки</p>
            <a href="/orders"><Button className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm">Смотреть заявки</Button></a>
          </div>
        ) : (
          myResponses.map((r) => {
            const statusMap: Record<string, { label: string; color: string }> = {
              new: { label: "Новая", color: "text-blue-400 bg-blue-600/15 border-blue-500/20" },
              in_progress: { label: "В работе", color: "text-amber-400 bg-amber-600/15 border-amber-500/20" },
              done: { label: "Выполнена", color: "text-emerald-400 bg-emerald-600/15 border-emerald-500/20" },
              cancelled: { label: "Отменена", color: "text-gray-400 bg-gray-600/15 border-gray-500/20" },
            };
            const st = statusMap[r.order_status] || statusMap.new;
            return (
              <div key={r.id} className="bg-white/4 border border-white/8 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{r.order_title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {r.order_category && <span className="text-gray-500 text-xs">{r.order_category}</span>}
                      {r.order_city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10} />{r.order_city}</span>}
                      <span className="text-gray-600 text-xs">{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border flex-shrink-0 ${st.color}`}>{st.label}</span>
                </div>
                {r.message && <p className="text-gray-400 text-sm border-t border-white/6 pt-2 mt-2">{r.message}</p>}
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (tab === "history") {
    return (
      <div className="flex flex-col gap-3">
        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Icon name="ClockFading" size={32} className="mx-auto mb-3 opacity-40" fallback="Clock" />
            <p>История пока пуста</p>
          </div>
        )}
        {transactions.map((t) => (
          <div key={t.id} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "purchase" ? "bg-emerald-600/20" : "bg-violet-600/20"}`}>
                <Icon name={t.type === "purchase" ? "Plus" : "Zap"} size={15} className={t.type === "purchase" ? "text-emerald-400" : "text-violet-400"} />
              </div>
              <div>
                <p className="text-sm text-white">{t.description}</p>
                <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
              </div>
            </div>
            <Badge className={`text-xs ${t.type === "purchase" ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20" : "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
              {t.type === "purchase" ? "+" : "-"}{t.amount}
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  // tab === "profile"
  return (
    <div className="flex flex-col gap-6 max-w-md">
      {/* Редактирование профиля */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Данные профиля</h3>
        {profileSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={15} />{profileSuccess}
          </div>
        )}
        <form onSubmit={onSaveProfile} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Имя</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ваше имя"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Категории услуг</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const selected = editCategories.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setEditCategories(editCategories.filter((x) => x !== c.name));
                      } else {
                        setEditCategories([...editCategories, c.name]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      selected
                        ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-gray-200"
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {c.name}
                  </button>
                );
              })}
            </div>
            {editCategories.length === 0 && (
              <p className="text-amber-400/70 text-xs mt-2">Выберите хотя бы одну категорию</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Город</label>
            <CitySelect value={editCity} onChange={setEditCity} placeholder="Ваш город" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">О себе</label>
            <textarea value={editAbout} onChange={e => setEditAbout(e.target.value)} rows={4}
              placeholder="Расскажите о своём опыте, специализации, достижениях..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
          </div>
          <Button type="submit" disabled={profileLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full">
            {profileLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </div>

      {/* Смена пароля */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Изменить пароль</h3>
        {pwSuccess && (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-emerald-400 text-sm">
            <Icon name="CheckCircle" size={15} />{pwSuccess}
          </div>
        )}
        <form onSubmit={onChangePassword} className="flex flex-col gap-3">
          {["Текущий пароль", "Новый пароль", "Повторите новый"].map((label, i) => {
            const vals = [pwOld, pwNew, pwConfirm];
            const setters = [setPwOld, setPwNew, setPwConfirm];
            return (
              <div key={label}>
                <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                <input type="password" required value={vals[i]} onChange={e => setters[i](e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            );
          })}
          {pwError && <p className="text-amber-400 text-sm">{pwError}</p>}
          <Button type="submit" disabled={pwLoading} className="bg-violet-600 hover:bg-violet-500 text-white w-full mt-1">
            {pwLoading ? "Сохранение..." : "Изменить пароль"}
          </Button>
        </form>
      </div>
    </div>
  );
}