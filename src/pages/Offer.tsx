import { useEffect } from "react";

export default function Offer() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <div className="mb-8">
          <a href="/" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">← На главную</a>
        </div>

        <h1 className="text-3xl font-bold mb-2">Публичная оферта</h1>
        <p className="text-gray-400 mb-10 text-sm">Дата публикации: 17 марта 2026 г.</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Общие положения</h2>
            <p>Настоящий документ является публичной офертой самозанятого гражданина Харисова Эрнеста Иреко­вича (ИНН 860234992431, далее — «Исполнитель») и содержит все существенные условия договора об оказании информационных услуг.</p>
            <p className="mt-2">Сервис <strong className="text-white">HandyMan</strong> (сайт хандиман.рф, далее — «Сервис») — это информационная платформа, соединяющая заказчиков бытовых услуг с мастерами-исполнителями.</p>
            <p className="mt-2">Акцептом настоящей оферты считается оплата любого из пакетов токенов, описанных в разделе 3.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Предмет договора</h2>
            <p>Исполнитель оказывает Пользователю (мастеру) информационную услугу — предоставление доступа к базе заявок от заказчиков бытовых услуг на платформе HandyMan. Услуга предоставляется в виде «токенов» — внутренней валюты платформы, которая списывается при определённых действиях мастера: когда заказчик выбирает мастера исполнителем, при публикации объявления об услуге, а также при поднятии объявления в топ.</p>
            <p className="mt-2">Отклик на заявку заказчика является бесплатным и не требует списания токенов.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Тарифы и стоимость</h2>
            <p className="mb-3">Пакеты токенов (внутренняя валюта платформы):</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-6 text-white font-semibold">Наименование</th>
                    <th className="text-left py-2 pr-6 text-white font-semibold">Состав</th>
                    <th className="text-left py-2 text-white font-semibold">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-6">Токен (поштучно)</td>
                    <td className="py-3 pr-6">1 токен</td>
                    <td className="py-3">49 ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Пакет «Старт»</td>
                    <td className="py-3 pr-6">5 токенов (~40 ₽/шт)</td>
                    <td className="py-3">199 ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Пакет «Стандарт»</td>
                    <td className="py-3 pr-6">15 токенов (~37 ₽/шт)</td>
                    <td className="py-3">549 ₽</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6">Пакет «Профи»</td>
                    <td className="py-3 pr-6">30 токенов (~30 ₽/шт)</td>
                    <td className="py-3">899 ₽</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 mb-2">Списание токенов происходит в следующих случаях:</p>
            <ul className="space-y-1 list-none pl-0">
              <li>— Заказчик выбрал мастера исполнителем заявки: <strong className="text-white">−5 токенов</strong></li>
              <li>— Публикация объявления об услуге на 30 дней (1-я услуга): <strong className="text-white">−6 токенов</strong></li>
              <li>— Публикация объявления об услуге на 30 дней (2-я услуга): <strong className="text-white">−5 токенов</strong></li>
              <li>— Публикация объявления об услуге на 30 дней (3-я и далее): <strong className="text-white">−4 токена</strong></li>
              <li>— Поднятие объявления в топ на 7 дней: <strong className="text-white">−1 токен</strong></li>
              <li>— Отклик на заявку заказчика: <strong className="text-white">бесплатно</strong></li>
            </ul>
            <p className="mt-3">Стоимость включает НПД по ставке 6%. НДС не облагается в соответствии с применяемым налоговым режимом.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Порядок оплаты и доступ к услуге</h2>
            <p>4.1. Оплата производится через платёжный сервис ЮKassa (yookassa.ru) с использованием банковской карты, СБП или иных доступных способов.</p>
            <p className="mt-2">4.2. Токены зачисляются на баланс личного кабинета мастера немедленно после успешного подтверждения оплаты.</p>
            <p className="mt-2">4.3. Купленные токены не имеют срока действия и сохраняются на балансе до использования.</p>
            <p className="mt-2">4.4. Списание токенов происходит автоматически в момент совершения соответствующего действия (выбор мастера заказчиком, публикация услуги, поднятие в топ).</p>
            <p className="mt-2">4.5. Если на балансе мастера менее 5 токенов, заказчик не может выбрать его исполнителем — кнопка выбора становится недоступной.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Возврат денежных средств</h2>
            <p>5.1. Возврат возможен в течение 14 дней с момента оплаты при условии, что купленные токены не были использованы (баланс не уменьшился).</p>
            <p className="mt-2">5.2. Для возврата необходимо обратиться по e-mail, указанному в разделе 8, с указанием номера телефона или email, привязанных к аккаунту, и даты платежа.</p>
            <p className="mt-2">5.3. Частично использованные пакеты возврату не подлежат.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Права и обязанности сторон</h2>
            <p>6.1. Исполнитель обязуется обеспечивать работоспособность Сервиса и своевременно зачислять токены после оплаты.</p>
            <p className="mt-2">6.2. Исполнитель не является стороной договора между мастером и заказчиком и не несёт ответственности за качество работ, выполненных мастером.</p>
            <p className="mt-2">6.3. Пользователь обязуется предоставлять достоверные данные при регистрации и не использовать Сервис в противоправных целях.</p>
          </section>

          <section id="7">
            <h2 className="text-lg font-semibold text-white mb-3">7. Персональные данные и конфиденциальность</h2>
            <p>7.1. Регистрируясь в Сервисе, Пользователь даёт согласие на обработку персональных данных (имя, номер телефона, email, город, категория услуг) в целях исполнения настоящего договора.</p>
            <p className="mt-2">7.2. Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
            <p className="mt-2">7.3. Номер телефона и email мастера передаются заказчику только после выбора мастера исполнителем — до этого момента контактные данные скрыты.</p>
            <p className="mt-2">7.4. Пользователь вправе в любой момент запросить удаление своих персональных данных, обратившись по контактам раздела 8.</p>
            <p className="mt-2">7.5. Сервис использует cookies и аналогичные технологии для обеспечения работоспособности платформы. Продолжая использование Сервиса, Пользователь соглашается с их использованием.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Реквизиты и контакты</h2>
            <div className="bg-white/4 border border-white/8 rounded-xl p-5 space-y-2">
              <p><span className="text-gray-500">Исполнитель:</span> Харисов Эрнест Иреко­вич</p>
              <p><span className="text-gray-500">Статус:</span> Самозанятый (плательщик НПД)</p>
              <p><span className="text-gray-500">ИНН:</span> 860234992431</p>
              <p><span className="text-gray-500">Сервис:</span> HandyMan</p>
              <p><span className="text-gray-500">Почтовый адрес:</span> Тюменская область, ХМАО-Югра, пгт. Белый Яр, ДНТ «Птицевод Севера», 6 проезд, уч. 261</p>
              <p><span className="text-gray-500">Телефон:</span> <a href="tel:+79966869812" className="text-violet-400 hover:text-violet-300 transition-colors">+7 (996) 686-98-12</a></p>
              <p><span className="text-gray-500">Электронная почта:</span> <a href="mailto:handymanbusiness@yandex.ru" className="text-violet-400 hover:text-violet-300 transition-colors">handymanbusiness@yandex.ru</a></p>
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