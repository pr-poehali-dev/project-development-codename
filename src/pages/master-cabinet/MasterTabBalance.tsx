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
}

export default function MasterTabBalance({ packages, buyingId, onBuy }: MasterTabBalanceProps) {
  return (
    <>
      <p className="text-gray-400 text-sm mb-4">Выберите пакет откликов — после подключения оплаты деньги спишутся автоматически:</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {packages.map((pkg, i) => (
          <div
            key={pkg.id}
            className={`bg-gradient-to-br ${PACKAGE_COLORS[i % PACKAGE_COLORS.length]} border rounded-2xl p-5 flex flex-col gap-4`}
          >
            <div>
              <p className="text-white font-semibold text-lg">{pkg.name}</p>
              <p className="text-gray-400 text-sm">{pkg.responses_count} откликов</p>
            </div>
            <p className="text-3xl font-bold text-white">{pkg.price} ₽</p>
            <Button
              onClick={() => onBuy(pkg)}
              disabled={buyingId === pkg.id}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full"
            >
              {buyingId === pkg.id ? "Обработка..." : "Выбрать"}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <Icon name="Info" size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-amber-300/80 text-xs leading-relaxed">
          Оплата через ЮKassa будет подключена в ближайшее время. Сейчас пакеты зачисляются без списания средств для тестирования.
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
