export default function Offer() {
  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-8">
          <a href="/" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">← На главную</a>
        </div>

        <h1 className="text-3xl font-bold mb-2">Публичная оферта</h1>
        <p className="text-gray-400 mb-10 text-sm">Дата публикации: 16 марта 2026 г.</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Общие положения</h2>
            <p>Настоящий документ является публичной офертой самозанятого гражданина Харисова Эрнеста Иреко­вича (ИНН 860234992431, далее — «Исполнитель») и содержит все существенные условия договора об оказании информационных услуг.</p>
            <p className="mt-2">Сервис <strong className="text-white">HandyMan</strong> (сайт handysen.poehali.dev, далее — «Сервис») — это информационная платформа, соединяющая заказчиков бытовых услуг с мастерами-исполнителями.</p>
            <p className="mt-2">Акцептом настоящей оферты считается оплата любого из пакетов откликов, описанных в разделе 3.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Предмет договора</h2>
            <p>Исполнитель оказывает Пользователю (мастеру) информационную услугу — предоставление доступа к базе заявок от заказчиков бытовых услуг на платформе HandyMan. Услуга предоставляется в виде «откликов» — единиц доступа, позволяющих мастеру откликнуться на заявку заказчика и передать ему свои контактные данные.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Услуги и цены</h2>
            <p className="mb-3">Исполнитель предоставляет следующие пакеты информационных услуг:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-6 text-white font-semibold">Наименование</th>
                    <th className="text-left py-2 pr-6 text-white font-semibold">Состав услуги</th>
                    <th className="text-left py-2 text-white font-semibold">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-6">Пакет «Старт»</td>
                    <td className="py-3 pr-6">5 откликов на заявки заказчиков</td>
                    <td className="py-3">199 ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Пакет «Стандарт»</td>
                    <td className="py-3 pr-6">15 откликов на заявки заказчиков</td>
                    <td className="py-3">499 ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Пакет «Профи»</td>
                    <td className="py-3 pr-6">30 откликов на заявки заказчиков</td>
                    <td className="py-3">799 ₽</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">Стоимость включает НПД по ставке 6%. НДС не облагается в соответствии с применяемым налоговым режимом.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Порядок оплаты и доступ к услуге</h2>
            <p>4.1. Оплата производится через платёжный сервис ЮKassa (yookassa.ru) с использованием банковской карты, СБП или иных доступных способов.</p>
            <p className="mt-2">4.2. Доступ к откликам предоставляется немедленно после успешного подтверждения оплаты — откликов зачисляются на баланс личного кабинета мастера автоматически.</p>
            <p className="mt-2">4.3. Купленные отклики не имеют срока действия и сохраняются на балансе до использования.</p>
            <p className="mt-2">4.4. Один отклик списывается в момент отправки отклика на заявку заказчика.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Возврат денежных средств</h2>
            <p>5.1. Возврат возможен в течение 14 дней с момента оплаты при условии, что купленные отклики не были использованы (баланс не уменьшился).</p>
            <p className="mt-2">5.2. Для возврата необходимо обратиться по e-mail, указанному в разделе 8, с указанием номера телефона, привязанного к аккаунту, и даты платежа.</p>
            <p className="mt-2">5.3. Частично использованные пакеты возврату не подлежат.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Права и обязанности сторон</h2>
            <p>6.1. Исполнитель обязуется обеспечивать работоспособность Сервиса и своевременно зачислять отклики после оплаты.</p>
            <p className="mt-2">6.2. Исполнитель не является стороной договора между мастером и заказчиком и не несёт ответственности за качество работ, выполненных мастером.</p>
            <p className="mt-2">6.3. Пользователь обязуется предоставлять достоверные данные при регистрации и не использовать Сервис в противоправных целях.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Персональные данные</h2>
            <p>Регистрируясь в Сервисе, Пользователь даёт согласие на обработку персональных данных (имя, номер телефона, город, категория услуг) в целях исполнения настоящего договора. Данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Реквизиты и контакты</h2>
            <div className="bg-white/4 border border-white/8 rounded-xl p-5 space-y-2">
              <p><span className="text-gray-500">Исполнитель:</span> Харисов Эрнест Иреко­вич</p>
              <p><span className="text-gray-500">Статус:</span> Самозанятый (плательщик НПД)</p>
              <p><span className="text-gray-500">ИНН:</span> 860234992431</p>
              <p><span className="text-gray-500">Сервис:</span> HandyMan</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/8 text-gray-600 text-xs">
          © 2026 HandyMan. Все права защищены.
        </div>
      </div>
    </div>
  );
}