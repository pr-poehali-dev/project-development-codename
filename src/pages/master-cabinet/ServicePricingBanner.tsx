import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ServicePricingBannerProps {
  onAddService: () => void;
}

export default function ServicePricingBanner({ onAddService }: ServicePricingBannerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-gradient-to-br from-violet-600/15 to-indigo-600/5 border border-violet-500/25 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <Icon name="Briefcase" size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Публикация услуги</p>
            <p className="text-violet-300 text-sm font-bold">4–6 токенов / месяц</p>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          {["1-я услуга — 6 токенов/мес", "2-я услуга — 5 токенов/мес", "3-я и далее — 4 токена/мес"].map(f => (
            <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
              <Icon name="Check" size={12} className="text-violet-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
        <Button onClick={onAddService} className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm gap-1.5">
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
            <p className="text-amber-300 text-sm font-bold">1 токен за раз</p>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          {["Ваша услуга поднимается выше всех", "Новые клиенты видят вас первым", "Действует 7 дней"].map(f => (
            <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
              <Icon name="Check" size={12} className="text-amber-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
        <p className="text-gray-600 text-xs text-center">Доступно после публикации услуги</p>
      </div>
    </div>
  );
}
