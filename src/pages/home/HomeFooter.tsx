import Icon from "@/components/ui/icon";

interface HomeFooterProps {
  isCustomer: boolean;
}

export default function HomeFooter({ isCustomer }: HomeFooterProps) {
  return (
    <footer className="border-t border-white/8 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pb-6 border-b border-white/6">
          <p className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
            <Icon name="MapPin" size={14} className="text-violet-400" />
            Мастера в городах ХМАО — Югры
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a href="/surgut" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Сургут и ХМАО</a>
            <a href="/masters?city=Сургут" className="text-gray-600 hover:text-gray-400 transition-colors">Сургут</a>
            <a href="/masters?city=Нижневартовск" className="text-gray-600 hover:text-gray-400 transition-colors">Нижневартовск</a>
            <a href="/masters?city=Нефтеюганск" className="text-gray-600 hover:text-gray-400 transition-colors">Нефтеюганск</a>
            <a href="/masters?city=Когалым" className="text-gray-600 hover:text-gray-400 transition-colors">Когалым</a>
            <a href="/masters?city=Ханты-Мансийск" className="text-gray-600 hover:text-gray-400 transition-colors">Ханты-Мансийск</a>
            <a href="/masters?city=Нягань" className="text-gray-600 hover:text-gray-400 transition-colors">Нягань</a>
            <a href="/masters?city=Мегион" className="text-gray-600 hover:text-gray-400 transition-colors">Мегион</a>
            <a href="/masters?city=Радужный" className="text-gray-600 hover:text-gray-400 transition-colors">Радужный</a>
            <a href="/masters?city=Пыть-Ях" className="text-gray-600 hover:text-gray-400 transition-colors">Пыть-Ях</a>
            <a href="/masters?city=Лангепас" className="text-gray-600 hover:text-gray-400 transition-colors">Лангепас</a>
            <a href="/masters?city=Урай" className="text-gray-600 hover:text-gray-400 transition-colors">Урай</a>
            <a href="/masters?city=Югорск" className="text-gray-600 hover:text-gray-400 transition-colors">Югорск</a>
            <a href="/masters?city=Лянтор" className="text-gray-600 hover:text-gray-400 transition-colors">Лянтор</a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-white">HandyMan</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">Маркетплейс бытовых услуг в Сургуте и городах ХМАО — Югры. Находите проверенных мастеров быстро и удобно.</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-3">Контакты</p>
            <div className="space-y-2">
              <a href="tel:+79966869812" className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm transition-colors">
                <Icon name="Phone" size={13} />
                +7 (996) 686-98-12
              </a>
              <a href="mailto:handymanbusiness@yandex.ru" className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm transition-colors">
                <Icon name="Mail" size={13} />
                handymanbusiness@yandex.ru
              </a>
              <p className="flex items-start gap-2 text-gray-600 text-sm">
                <Icon name="MapPin" size={13} className="mt-0.5 flex-shrink-0" />
                ХМАО-Югра, пгт. Белый Яр
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-3">Кабинеты</p>
            <div className="space-y-2">
              {isCustomer && (
                <a href="/cabinet" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Кабинет заказчика</a>
              )}
              <a href="/master" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Кабинет мастера</a>
              <a href="/orders" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Лента заявок</a>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-3 mt-5">Документы</p>
            <div className="space-y-2">
              <a href="/rules" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Правила платформы</a>
              <a href="/offer" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Публичная оферта</a>
              <a href="/offer#7" className="block text-gray-600 hover:text-gray-400 text-sm transition-colors">Политика конфиденциальности</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/6 pt-6">
          <p className="text-gray-700 text-xs text-center">© 2026 HandyMan. Харисов Эрнест Иреко­вич, ИНН 860234992431. Самозанятый (плательщик НПД).</p>
        </div>
      </div>
    </footer>
  );
}