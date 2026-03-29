import Icon from "@/components/ui/icon";

export default function Rules() {
  return (
    <div className="min-h-screen bg-[#0a0d16] text-white">
      {/* Шапка */}
      <div className="border-b border-white/8 bg-[#0a0d16]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <a href="/" className="flex items-center gap-2">
            <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
          </a>
          <span className="text-gray-600 text-sm">/ Правила платформы</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Правила платформы HandyMan</h1>
          <p className="text-gray-400 text-sm">Последнее обновление: март 2026 г.</p>
          <p className="text-gray-300 mt-4 leading-relaxed">
            Используя платформу HandyMan, вы соглашаетесь с настоящими правилами. Нарушение правил влечёт санкции — от предупреждения до постоянной блокировки аккаунта.
          </p>
        </div>

        {/* КРИТИЧЕСКОЕ — договор вне сайта */}
        <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-red-400 font-bold text-lg mb-2">Договорённости вне платформы — запрещены</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Категорически запрещено договариваться об оказании услуг в обход платформы — передавать личные контакты (телефон, email, мессенджеры) до взаимного подтверждения через кнопку «Договорились» в чате.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">Запрещено писать номер телефона, email или ссылки в чате до подтверждения</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">Запрещено предлагать расчёты в обход платформы</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="X" size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">Запрещено просить предоплату вне системы</p>
                </div>
              </div>
              <div className="mt-4 bg-red-500/10 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm font-semibold">⛔ Санкции: немедленная блокировка аккаунта без предупреждения.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Shield" size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-amber-400 font-bold text-lg mb-3">Правила безопасности</h2>
              <div className="space-y-2.5">
                {[
                  "Никогда не сообщайте пароли, коды из SMS и секретные слова — ни другим пользователям, ни тем, кто представляется сотрудником платформы.",
                  "Не переходите по ссылкам от незнакомых пользователей в чате.",
                  "Проверяйте адресную строку браузера — сайт HandyMan работает только на домене handyman.poehali.dev.",
                  "Если вам предлагают перевести деньги заранее до начала работы — это мошенничество. Сообщите нам.",
                  "HandyMan никогда не просит ввести данные банковской карты в чате.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icon name="ShieldCheck" size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Правила для всех */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Users" size={18} className="text-violet-400" /> Общие правила
          </h2>
          <div className="space-y-3">
            {[
              "Запрещено создавать несколько аккаунтов одному лицу.",
              "Запрещено публиковать ложную, вводящую в заблуждение или оскорбительную информацию.",
              "Запрещено использовать платформу для рассылки спама.",
              "Запрещено указывать чужие контактные данные.",
              "Платформа не несёт ответственности за качество услуг. Все споры решаются между исполнителем и заказчиком.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="Circle" size={6} className="text-gray-600 mt-1.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Правила для мастеров */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Wrench" size={18} className="text-violet-400" /> Правила для мастеров
          </h2>
          <div className="space-y-3">
            {[
              "Указывайте только реальные услуги и актуальные цены.",
              "Не публикуйте объявления в категориях, не соответствующих вашей специализации.",
              "Отвечайте на обращения заказчиков в разумные сроки.",
              "Запрещено размещать контактные данные в описании услуги или объявлении.",
              "Токены списываются только при взаимном подтверждении договорённости — 5 токенов за успешную сделку.",
              "Некорректное поведение с заказчиком является основанием для блокировки.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="Circle" size={6} className="text-gray-600 mt-1.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Правила для заказчиков */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="UserCheck" size={18} className="text-violet-400" /> Правила для заказчиков
          </h2>
          <div className="space-y-3">
            {[
              "Описывайте задачи точно и честно — вводящие в заблуждение заявки удаляются.",
              "Не создавайте дублирующие заявки.",
              "Оставляйте честные отзывы — фиктивные оценки запрещены.",
              "Не используйте платформу для сбора контактных данных мастеров без реального намерения заказать услугу.",
              "Подтверждайте договорённость через кнопку «Договорились» в чате — это единственный способ безопасно обменяться контактами.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="Circle" size={6} className="text-gray-600 mt-1.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Санкции */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon name="Gavel" size={18} className="text-violet-400" /> Система санкций
          </h2>
          <div className="space-y-4">
            {[
              { level: "1", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", title: "Предупреждение", desc: "Первичное нарушение незначительного характера. Аккаунт продолжает работать." },
              { level: "2", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", title: "Временная блокировка", desc: "Повторное нарушение или грубое первичное нарушение. Срок: от 3 до 30 дней." },
              { level: "3", color: "bg-red-500/20 text-red-400 border-red-500/30", title: "Постоянная блокировка", desc: "Систематические нарушения, мошенничество, обход платформы. Аккаунт блокируется навсегда." },
            ].map((s) => (
              <div key={s.level} className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${s.color}`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.color} flex-shrink-0`}>{s.level}</span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Связь */}
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-6 text-center">
          <Icon name="MessageSquare" size={28} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-2">Есть вопросы или хотите пожаловаться?</p>
          <p className="text-gray-400 text-sm mb-4">Напишите нам через кнопку поддержки на любой странице сайта</p>
          <a href="/" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">← На главную</a>
        </div>
      </div>
    </div>
  );
}
