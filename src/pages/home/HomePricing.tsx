import Icon from "@/components/ui/icon";

export default function HomePricing() {
  return (
    <section id="pricing" className="py-16 px-4 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-3">Простая и честная система токенов</h2>
        <p className="text-gray-400 text-center mb-10">Отклики бесплатны — токены списываются только когда заказчик выбирает вас исполнителем (−5 токенов). Чем больше пакет — тем дешевле токен.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { name: "Старт", count: 5, price: 99, per: 20, color: "violet" },
            { name: "Стандарт", count: 15, price: 249, per: 17, color: "indigo" },
            { name: "Профи", count: 30, price: 399, per: 13, color: "purple" },
          ].map((pkg) => (
            <div key={pkg.name} className={`bg-${pkg.color}-600/10 border border-${pkg.color}-500/20 rounded-2xl p-6 flex flex-col gap-3`}>
              <p className="text-white font-semibold text-lg">{pkg.name}</p>
              <p className="text-4xl font-extrabold text-white">{pkg.price} <span className="text-lg font-normal text-gray-400">₽</span></p>
              <p className="text-gray-400 text-sm">{pkg.count} токенов · {pkg.per} ₽/шт</p>
              <ul className="space-y-1.5 mt-1">
                {["Без срока действия", "Мгновенное зачисление", "Отклики бесплатные"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Icon name="Check" size={13} className={`text-${pkg.color}-400 flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm">
          Также доступна поштучная покупка токенов по 29 ₽ — в{" "}
          <a href="/master" className="text-violet-400 hover:text-violet-300 transition-colors">кабинете мастера</a>
        </p>
      </div>
    </section>
  );
}
