import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const DONATIONS_URL = "https://functions.poehali.dev/64a0e43a-4d64-4be5-bc69-90e6d3138e97";

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [100, 300, 500, 1000, 2000];

export default function DonateModal({ open, onClose }: DonateModalProps) {
  const [amount, setAmount] = useState<number>(300);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (finalAmount < 50) {
      setError("Минимальная сумма — 50 ₽");
      return;
    }
    if (finalAmount > 100000) {
      setError("Максимальная сумма — 100 000 ₽");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(DONATIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          amount: finalAmount,
          donor_name: name,
          message,
          return_url: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.confirmation_url && data.donation_id) {
        try { localStorage.setItem("pending_donation_id", String(data.donation_id)); } catch { /* ignore */ }
        window.location.href = data.confirmation_url;
      }
    } catch {
      setError("Не удалось создать платёж. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#13161f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-pink-500/30 flex items-center justify-center">
              <Icon name="Heart" size={16} className="text-pink-400" />
            </div>
            <h3 className="text-white font-bold text-base">Поддержать проект</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <p className="text-gray-400 text-sm leading-relaxed">
            HandyMan — некоммерческий проект, который держится на энтузиазме. Любая сумма помогает оплачивать серверы, домен и развивать платформу. Спасибо!
          </p>

          <div>
            <label className="text-gray-300 text-xs font-medium mb-2 block">Сумма, ₽</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAmount(p); setCustomAmount(""); }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    !customAmount && amount === p
                      ? "bg-violet-600 border-violet-500 text-white font-medium"
                      : "bg-white/5 border-white/10 text-gray-300 hover:border-violet-500/40"
                  }`}
                >
                  {p} ₽
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="numeric"
              min={50}
              max={100000}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Своя сумма от 50 до 100 000 ₽"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-xs font-medium mb-1.5 block">Имя (необязательно)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как вас зовут"
              maxLength={150}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-xs font-medium mb-1.5 block">Пожелание (необязательно)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Что хочется улучшить, какие функции нужны..."
              rows={2}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <Icon name="AlertCircle" size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || finalAmount < 50}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white py-3 text-sm font-semibold rounded-xl"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Создаём платёж...
              </>
            ) : (
              <>
                <Icon name="Heart" size={15} className="mr-2" />
                Поддержать на {finalAmount || 0} ₽
              </>
            )}
          </Button>

          <p className="text-gray-600 text-[11px] text-center leading-relaxed">
            Платёж проходит через ЮKassa. Карты Visa, Mastercard, МИР, СБП, ЮMoney.
            Никаких подписок и автосписаний.
          </p>
        </form>
      </div>
    </div>
  );
}