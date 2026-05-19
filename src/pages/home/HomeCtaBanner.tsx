import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HomeCtaBannerProps {
  onBecomeMaster: () => void;
  onCreateOrder: () => void;
}

export default function HomeCtaBanner({ onBecomeMaster, onCreateOrder }: HomeCtaBannerProps) {
  return (
    <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border-b border-violet-500/15 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-300">
          <span className="text-white font-semibold">Готов предложить свои услуги?</span>
          {" "}Зарегистрируйся как мастер и получай заказы от клиентов уже сегодня
        </p>
        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-center">
          <Button onClick={onBecomeMaster} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 rounded-lg">
            Стать мастером
            <Icon name="ArrowRight" size={14} className="ml-1.5" />
          </Button>
          <a href="/masters">
            <Button size="sm" variant="ghost" className="border border-violet-500/40 text-violet-300 hover:bg-violet-600/15 text-xs px-4 rounded-lg">
              <Icon name="Search" size={13} className="mr-1.5" />
              Найти мастера
            </Button>
          </a>
          <Button onClick={onCreateOrder} size="sm" variant="ghost" className="border border-white/10 text-gray-300 hover:bg-white/8 text-xs px-4 rounded-lg">
            <Icon name="FilePlus" size={13} className="mr-1.5" />
            Создать заявку
          </Button>
        </div>
      </div>
    </div>
  );
}