import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";

const SUBJECTS = [
  { value: "question", label: "Вопрос" },
  { value: "complaint", label: "Жалоба на пользователя" },
  { value: "bug", label: "Технический сбой" },
  { value: "fraud", label: "Мошенничество" },
  { value: "other", label: "Другое" },
];

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "question", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setSent(false);
    setError("");
    // Автозаполнение из профиля
    try {
      const cp = localStorage.getItem("customer_profile");
      if (cp) { const p = JSON.parse(cp); setForm(f => ({ ...f, name: p.name || "", email: p.email || "" })); return; }
      const mp = localStorage.getItem("master_phone");
      if (mp) setForm(f => ({ ...f, name: f.name }));
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}?action=support_create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setSent(true);
    } catch { setError("Ошибка соединения. Попробуйте позже."); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Фиксированная кнопка */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-violet-900/40 transition-all duration-200 hover:scale-105 text-sm font-medium"
        aria-label="Чат с поддержкой"
      >
        <Icon name={open ? "X" : "MessageCircleQuestion"} size={16} />
        <span>Поддержка</span>
      </button>

      {/* Всплывающее окно */}
      {open && (
        <div className="fixed bottom-20 left-6 z-50 w-80 bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Шапка */}
          <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b border-white/8 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center">
                <Icon name="HeadphonesIcon" size={16} className="text-violet-300" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Поддержка HandyMan</p>
                <p className="text-gray-500 text-xs">Ответим на почту в течение 24 ч</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
              <Icon name="X" size={16} />
            </button>
          </div>

          {sent ? (
            <div className="px-5 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={28} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold mb-1">Обращение отправлено!</p>
              <p className="text-gray-400 text-sm">Мы ответим вам на email в течение 24 часов</p>
              <Button onClick={() => { setSent(false); setForm(f => ({ ...f, message: "" })); }} className="mt-5 bg-violet-600 hover:bg-violet-500 text-white w-full text-sm">
                Новое обращение
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Ваше имя</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Иван"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email для ответа</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Тема</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {SUBJECTS.map(s => <option key={s.value} value={s.value} className="bg-[#0f1117]">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Сообщение *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Опишите ваш вопрос или проблему..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <Button type="submit" disabled={loading || !form.message.trim()} className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm">
                {loading ? "Отправка..." : "Отправить обращение"}
              </Button>
              <p className="text-gray-600 text-xs text-center">
                Ознакомьтесь с{" "}
                <a href="/rules" className="text-violet-500 hover:text-violet-400 transition-colors">правилами платформы</a>
              </p>
            </form>
          )}
        </div>
      )}
    </>
  );
}
