import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Package {
  id: number;
  name: string;
  responses_count: number;
  price: number;
}

const PACKAGE_COLORS = [
  "from-violet-600/20 to-violet-800/10 border-violet-500/30",
  "from-indigo-600/20 to-indigo-800/10 border-indigo-500/30",
  "from-purple-600/20 to-purple-800/10 border-purple-500/30",
];

interface MasterTabBalanceProps {
  packages: Package[];
  buyingId: number | null;
  onBuy: (pkg: Package) => void;
  paymentChecking?: boolean;
}

export default function MasterTabBalance({ packages, buyingId, onBuy, paymentChecking }: MasterTabBalanceProps) {
  const singlePkg = packages.find(p => p.responses_count === 1);
  const bundlePkgs = packages.filter(p => p.responses_count > 1);
  const pricePerToken = singlePkg ? singlePkg.price : 49;

  return (
    <>
      {paymentChecking && (
        <div className="mb-5 bg-violet-600/15 border border-violet-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-violet-300 text-sm">Проверяем статус оплаты...</p>
        </div>
      )}
      <p className="text-gray-400 text-sm mb-5">Токены списываются когда заказчик выбирает вас исполнителем (−5 токенов). Буст услуги — 1 токен. Публикация услуги — 4–6 токенов/месяц.</p>

      {/* Поштучная покупка */}
      {singlePkg && (
        <div className="bg-white/4 border border-white/10 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Поштучно</p>
            <p className="text-gray-500 text-xs mt-0.5">Самый дорогой способ — {singlePkg.price} ₽ за токен</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="text-2xl font-bold text-white">{singlePkg.price} ₽</p>
            <Button
              onClick={() => onBuy(singlePkg)}
              disabled={buyingId === singlePkg.id}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              {buyingId === singlePkg.id ? "..." : "Купить"}
            </Button>
          </div>
        </div>
      )}

      {/* Пакеты */}
      <div className="grid gap-4 sm:grid-cols-3 mb-5">
        {bundlePkgs.map((pkg, i) => {
          const perToken = Math.round(pkg.price / pkg.responses_count);
          const discount = Math.round((1 - perToken / pricePerToken) * 100);
          return (
            <div
              key={pkg.id}
              className={`bg-gradient-to-br ${PACKAGE_COLORS[i % PACKAGE_COLORS.length]} border rounded-2xl p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{pkg.name}</p>
                  <p className="text-gray-400 text-sm">{pkg.responses_count} токенов</p>
                </div>
                {discount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-medium">
                    −{discount}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{pkg.price} ₽</p>
                <p className="text-gray-600 text-xs mt-0.5">{perToken} ₽ за токен</p>
              </div>
              <Button
                onClick={() => onBuy(pkg)}
                disabled={buyingId === pkg.id}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
              >
                {buyingId === pkg.id ? "Обработка..." : "Выбрать"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-2 bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-start gap-3">
        <Icon name="ShieldCheck" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
        <p className="text-gray-400 text-xs leading-relaxed">
          Оплата через ЮKassa — безопасно. После оплаты токены зачисляются автоматически.
        </p>
      </div>
      <p className="mt-4 text-gray-600 text-xs text-center">
        Нажимая «Выбрать», вы соглашаетесь с{" "}
        <a href="/offer" target="_blank" className="text-violet-500 hover:text-violet-400 underline transition-colors">
          публичной офертой
        </a>
        . Исполнитель: Харисов Э.И., ИНН 860234992431.
      </p>
    </>
  );
}