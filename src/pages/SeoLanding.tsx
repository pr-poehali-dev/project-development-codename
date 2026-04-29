import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import {
  CATEGORY_SLUGS,
  CITY_SLUGS,
  TOP_CITIES,
  TOP_CATEGORIES,
  parseSeoSlug,
  buildSeoSlug,
} from "@/lib/seoSlugs";

const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  master_id: number;
  master_name: string;
  avatar_color: string;
  rating: number | null;
  reviews_count: number;
}

export default function SeoLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { categorySlug, citySlug } = parseSeoSlug(slug || "");
  const cat = categorySlug ? CATEGORY_SLUGS[categorySlug] : null;
  const cityName = citySlug ? CITY_SLUGS[citySlug] : null;

  const seoTitle = cat
    ? cityName
      ? `${cat.titleSingular} в городе ${cityName} — заказать услуги ${cat.pluralProf} | HandyMan`
      : `${cat.titleSingular} — заказать услуги ${cat.pluralProf} в России | HandyMan`
    : "Услуги мастеров | HandyMan";

  const seoDescription = cat
    ? cityName
      ? `Найдите ${cat.pluralProf} в ${cityName} на HandyMan. Проверенные мастера, реальные отзывы, прозрачные цены. Закажите ${cat.titleSingular.toLowerCase()}а онлайн за 5 минут.`
      : `Найдите ${cat.pluralProf} рядом с вами на HandyMan. Проверенные мастера в любом городе России. Реальные отзывы, прозрачные цены, быстрый заказ.`
    : "Маркетплейс бытовых услуг HandyMan";

  useSeoMeta(seoTitle, seoDescription);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cat) return;
    setLoading(true);
    const params = new URLSearchParams({ action: "services", category: cat.name });
    if (cityName) params.set("city", cityName);
    fetch(`${MASTER_URL}?${params}`)
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setServices(parsed.services || []);
      })
      .finally(() => setLoading(false));
  }, [cat?.name, cityName]);

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <Icon name="SearchX" size={48} className="mx-auto mb-4 text-gray-600" />
          <h1 className="text-xl font-bold mb-2">Страница не найдена</h1>
          <p className="text-gray-400 mb-6">Услуга или город указаны некорректно</p>
          <a href="/masters" className="text-violet-400 hover:text-violet-300">← К каталогу мастеров</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Хлебные крошки */}
      <div className="border-b border-white/8 bg-[#0a0d16]/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs flex-wrap">
          <a href="/" className="text-gray-500 hover:text-white transition-colors">Главная</a>
          <Icon name="ChevronRight" size={12} className="text-gray-700" />
          <a href="/masters" className="text-gray-500 hover:text-white transition-colors">Каталог</a>
          <Icon name="ChevronRight" size={12} className="text-gray-700" />
          <span className="text-violet-300">{cat.name}{cityName ? ` в ${cityName}` : ""}</span>
        </div>
      </div>

      {/* Герой */}
      <section className="py-12 sm:py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <Badge className="mb-4 bg-violet-600/20 text-violet-300 border-violet-500/30 px-3 py-1 text-xs">
            <Icon name={cat.icon} size={12} className="mr-1.5" />
            {cat.name}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            {cat.titleSingular}
            {cityName && (
              <> в <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{cityName}</span></>
            )}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-6">
            {cityName
              ? `Найдите проверенного ${cat.titleSingular.toLowerCase()}а в ${cityName} на HandyMan. Реальные отзывы, прозрачные цены, прямой контакт с мастером.`
              : `Услуги «${cat.pluralProf}» по всей России. Закажите мастера онлайн — быстро, удобно, надёжно.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`/masters?category=${encodeURIComponent(cat.name)}${cityName ? `&city=${encodeURIComponent(cityName)}` : ""}`}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 rounded-xl">
                <Icon name="Search" size={15} className="mr-2" />
                Найти мастера
              </Button>
            </a>
            <a href="/orders">
              <Button variant="ghost" className="border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 px-6 rounded-xl">
                Разместить заявку
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-10 px-4 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "ShieldCheck", title: "Проверенные мастера", text: "С верификацией и отзывами" },
            { icon: "Star", title: "Реальные отзывы", text: "Только от настоящих клиентов" },
            { icon: "Wallet", title: "Прозрачные цены", text: "Без скрытых наценок" },
            { icon: "Zap", title: "Быстрый отклик", text: "Мастер свяжется за минуты" },
          ].map(b => (
            <div key={b.title} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center mx-auto mb-2">
                <Icon name={b.icon} size={18} className="text-violet-400" />
              </div>
              <p className="text-white text-sm font-semibold">{b.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Услуги мастеров */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Объявления{cityName ? ` в ${cityName}` : ""}
            {!loading && services.length > 0 && <span className="text-gray-500 font-normal text-base ml-2">{services.length}</span>}
          </h2>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Загрузка...
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-8 text-center">
              <Icon name="Briefcase" size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">Объявлений пока нет{cityName ? ` в городе ${cityName}` : ""}</p>
              <p className="text-gray-500 text-sm mb-5">Разместите заявку — мастера сами откликнутся</p>
              <a href="/orders">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                  Разместить заявку
                </Button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.slice(0, 12).map(s => (
                <a
                  key={s.id}
                  href={`/master-page?id=${s.master_id}`}
                  className="bg-white/4 border border-white/8 rounded-xl p-4 hover:border-violet-500/40 hover:bg-white/6 transition-all flex flex-col gap-2"
                >
                  <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{s.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.avatar_color }}>
                      {s.master_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-xs truncate">{s.master_name}</span>
                    {s.rating && (
                      <span className="ml-auto flex items-center gap-0.5 text-amber-400 text-xs">
                        <Icon name="Star" size={11} />{s.rating}
                      </span>
                    )}
                  </div>
                  {s.city && (
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Icon name="MapPin" size={10} />{s.city}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    {s.price ? (
                      <span className="text-emerald-400 font-semibold text-sm">от {s.price.toLocaleString("ru-RU")} ₽</span>
                    ) : (
                      <span className="text-gray-500 text-xs">По договорённости</span>
                    )}
                    <span className="text-violet-400 text-xs">Профиль →</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {services.length > 12 && (
            <div className="text-center mt-6">
              <a href={`/masters?category=${encodeURIComponent(cat.name)}${cityName ? `&city=${encodeURIComponent(cityName)}` : ""}`}>
                <Button variant="ghost" className="border border-white/10 text-gray-300 hover:text-white px-8">
                  Все мастера ({services.length})
                  <Icon name="ArrowRight" size={14} className="ml-2" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* SEO-текст */}
      <section className="py-12 px-4 border-t border-white/5 bg-white/2">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h2 className="text-xl font-bold mb-4">
            Как заказать {cat.titleSingular.toLowerCase()}а{cityName ? ` в ${cityName}` : ""} на HandyMan
          </h2>
          <ol className="space-y-3 text-gray-300 text-sm leading-relaxed list-decimal list-inside">
            <li><span className="text-white font-medium">Опишите задачу.</span> Расскажите, что нужно сделать — кратко и по делу. Укажите адрес и удобное время.</li>
            <li><span className="text-white font-medium">Получите отклики.</span> {cat.pluralProf.charAt(0).toUpperCase() + cat.pluralProf.slice(1)}{cityName ? ` из ${cityName}` : ""} увидят вашу заявку и предложат свои услуги с ценами.</li>
            <li><span className="text-white font-medium">Выберите подходящего.</span> Сравните рейтинги, отзывы и цены. Свяжитесь с мастером в чате.</li>
            <li><span className="text-white font-medium">Оцените работу.</span> После выполнения задачи оставьте отзыв — это поможет другим заказчикам.</li>
          </ol>

          <h2 className="text-xl font-bold mt-8 mb-4">
            Почему HandyMan{cityName ? ` в ${cityName}` : ""}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            HandyMan — современный маркетплейс бытовых услуг, который соединяет заказчиков и проверенных мастеров напрямую.
            {cityName ? ` В ${cityName} мы помогаем находить ${cat.pluralProf} быстро и без посредников.` : ` Мы работаем по всей России и помогаем находить ${cat.pluralProf} в любом городе.`}
            {" "}Без комиссий за заказ, без скрытых платежей — мастер получает 100% от стоимости услуги.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Все специалисты проходят верификацию: мы проверяем телефон, e-mail и собираем настоящие отзывы от клиентов.
            Это означает, что вы получаете доступ только к реальным мастерам с подтверждёнными контактами и репутацией.
          </p>
        </div>
      </section>

      {/* Перелинковка: другие города */}
      {!cityName && (
        <section className="py-10 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">{cat.titleSingular} в городах России</h2>
            <div className="flex flex-wrap gap-2">
              {TOP_CITIES.map(cs => (
                <a
                  key={cs}
                  href={`/uslugi/${buildSeoSlug(categorySlug!, cs)}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:border-violet-500/40 hover:bg-violet-600/10 text-gray-300 hover:text-violet-300 text-xs transition-all"
                >
                  {CITY_SLUGS[cs]}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Перелинковка: другие услуги в этом городе */}
      {cityName && (
        <section className="py-10 px-4 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Другие услуги в {cityName}</h2>
            <div className="flex flex-wrap gap-2">
              {TOP_CATEGORIES.filter(c => c !== categorySlug).map(cs => (
                <a
                  key={cs}
                  href={`/uslugi/${buildSeoSlug(cs, citySlug!)}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:border-violet-500/40 hover:bg-violet-600/10 text-gray-300 hover:text-violet-300 text-xs transition-all flex items-center gap-1.5"
                >
                  <Icon name={CATEGORY_SLUGS[cs].icon} size={12} />
                  {CATEGORY_SLUGS[cs].titleSingular}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 px-4 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Нужен {cat.titleSingular.toLowerCase()}{cityName ? ` в ${cityName}` : ""}?
          </h2>
          <p className="text-gray-400 mb-6">
            Разместите заявку — мастера откликнутся за несколько минут
          </p>
          <a href="/orders">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 text-base rounded-xl">
              Разместить заявку
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/8 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">© HandyMan — маркетплейс бытовых услуг</a>
        </div>
      </footer>
    </div>
  );
}
