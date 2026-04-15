import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Props {
  masterId: number;
}

export default function MasterTabReferral({ masterId }: Props) {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [invited, setInvited] = useState(0);
  const [earned, setEarned] = useState(0);
  const [bonus, setBonus] = useState(3);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_referral_info", master_id: masterId }),
    })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setCode(parsed.referral_code || "");
        setInvited(parsed.invited_count || 0);
        setEarned(parsed.earned_tokens || 0);
        setBonus(parsed.bonus_per_invite || 3);
      })
      .finally(() => setLoading(false));
  }, [masterId]);

  const referralLink = code ? `${window.location.origin}/master?ref=${code}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const text = `Присоединяйся к HandyMan — маркетплейсу бытовых услуг! Зарегистрируйся по моей ссылке и получи ${bonus} бонусных токенов: ${referralLink}`;
    if (navigator.share) {
      navigator.share({ title: "HandyMan — приглашение", text }).catch(() => {});
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Присоединяйся к HandyMan! +${bonus} токенов за регистрацию`)}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Загрузка...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/30 flex items-center justify-center">
            <Icon name="Users" size={24} className="text-violet-300" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Приглашай друзей</h2>
            <p className="text-gray-400 text-sm">Получайте по {bonus} токенов каждый</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <p className="text-gray-400 text-xs mb-2">Ваша реферальная ссылка</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none truncate"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className={`flex-shrink-0 text-xs ${copied ? "bg-emerald-600 hover:bg-emerald-500" : "bg-violet-600 hover:bg-violet-500"} text-white`}
            >
              <Icon name={copied ? "Check" : "Copy"} size={14} className="mr-1" />
              {copied ? "Скопировано" : "Копировать"}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
        >
          <Icon name="Share2" size={16} className="mr-2" />
          Поделиться ссылкой
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{invited}</div>
          <div className="text-gray-400 text-xs">Приглашено мастеров</div>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">+{earned}</div>
          <div className="text-gray-400 text-xs">Токенов заработано</div>
        </div>
      </div>

      <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Icon name="HelpCircle" size={16} className="text-violet-400" />
          Как это работает?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-violet-300 text-xs font-bold">1</span>
            </div>
            <p className="text-gray-300 text-sm">Скопируйте ссылку и отправьте другу-мастеру</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-violet-300 text-xs font-bold">2</span>
            </div>
            <p className="text-gray-300 text-sm">Друг регистрируется по вашей ссылке</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-violet-300 text-xs font-bold">3</span>
            </div>
            <p className="text-gray-300 text-sm">Вы оба получаете по <span className="text-violet-300 font-semibold">{bonus} токенов</span> на баланс</p>
          </div>
        </div>
      </div>
    </div>
  );
}
