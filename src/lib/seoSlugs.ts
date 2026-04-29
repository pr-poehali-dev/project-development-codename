// Карта slug → название категории
export const CATEGORY_SLUGS: Record<string, { name: string; icon: string; titleSingular: string; pluralProf: string }> = {
  "santekhnik": { name: "Сантехника", icon: "Wrench", titleSingular: "Сантехник", pluralProf: "сантехники" },
  "elektrik": { name: "Электрика", icon: "Zap", titleSingular: "Электрик", pluralProf: "электрики" },
  "remont-zhilya": { name: "Ремонт жилья", icon: "Hammer", titleSingular: "Мастер по ремонту", pluralProf: "мастера по ремонту" },
  "stroitelstvo": { name: "Строительство", icon: "HardHat", titleSingular: "Строитель", pluralProf: "строители" },
  "avtoremont": { name: "Авторемонт", icon: "Car", titleSingular: "Автомастер", pluralProf: "автомастера" },
  "byuti": { name: "Бьюти", icon: "Sparkles", titleSingular: "Бьюти-мастер", pluralProf: "бьюти-мастера" },
  "massazh": { name: "Массаж", icon: "HandHeart", titleSingular: "Массажист", pluralProf: "массажисты" },
  "it-pomoshch": { name: "IT-помощь", icon: "Monitor", titleSingular: "IT-специалист", pluralProf: "IT-специалисты" },
  "klining": { name: "Клининг", icon: "Sparkle", titleSingular: "Клинер", pluralProf: "клинеры" },
  "perevozki": { name: "Перевозки", icon: "Truck", titleSingular: "Грузчик", pluralProf: "грузчики и перевозки" },
  "nyanya": { name: "Няня", icon: "Baby", titleSingular: "Няня", pluralProf: "няни" },
  "repetitor": { name: "Репетиторство", icon: "GraduationCap", titleSingular: "Репетитор", pluralProf: "репетиторы" },
  "ozelenenie": { name: "Озеленение", icon: "Leaf", titleSingular: "Садовник", pluralProf: "садовники" },
  "zoopomoshch": { name: "Зоопомощь", icon: "PawPrint", titleSingular: "Специалист по животным", pluralProf: "специалисты по животным" },
  "mebel": { name: "Мебель", icon: "Package", titleSingular: "Сборщик мебели", pluralProf: "сборщики мебели" },
  "dizayn": { name: "Дизайн интерьера", icon: "PenRuler", titleSingular: "Дизайнер интерьера", pluralProf: "дизайнеры интерьера" },
  "foto-video": { name: "Фото/Видео", icon: "Camera", titleSingular: "Фотограф", pluralProf: "фотографы и видеографы" },
  "uborka-snega": { name: "Уборка снега", icon: "Snowflake", titleSingular: "Специалист по уборке снега", pluralProf: "специалисты по уборке снега" },
  "povar": { name: "Повар на мероприятие", icon: "ChefHat", titleSingular: "Повар", pluralProf: "повара" },
  "trener": { name: "Тренер", icon: "Dumbbell", titleSingular: "Тренер", pluralProf: "тренеры" },
  "animator": { name: "Аниматор", icon: "PartyPopper", titleSingular: "Аниматор", pluralProf: "аниматоры" },
  "yurist": { name: "Юрист", icon: "Scale", titleSingular: "Юрист", pluralProf: "юристы" },
  "buhgalter": { name: "Бухгалтер", icon: "Calculator", titleSingular: "Бухгалтер", pluralProf: "бухгалтеры" },
  "svadba": { name: "Свадьба и торжества", icon: "Heart", titleSingular: "Организатор торжеств", pluralProf: "организаторы торжеств" },
  "kuryer": { name: "Курьер и доставка", icon: "PackageCheck", titleSingular: "Курьер", pluralProf: "курьеры" },
  "ohrana": { name: "Охрана и безопасность", icon: "ShieldCheck", titleSingular: "Специалист по охране", pluralProf: "специалисты по безопасности" },
  "meditsina": { name: "Медицина на дому", icon: "Stethoscope", titleSingular: "Медработник", pluralProf: "медработники на дом" },
  "perevodchik": { name: "Переводчик", icon: "Languages", titleSingular: "Переводчик", pluralProf: "переводчики" },
  "hendmeyd": { name: "Хендмейд", icon: "Scissors", titleSingular: "Мастер хендмейд", pluralProf: "мастера хендмейд" },
};

// Карта slug → название города (топ городов РФ)
export const CITY_SLUGS: Record<string, string> = {
  "moskva": "Москва",
  "spb": "Санкт-Петербург",
  "sankt-peterburg": "Санкт-Петербург",
  "novosibirsk": "Новосибирск",
  "ekaterinburg": "Екатеринбург",
  "kazan": "Казань",
  "nizhniy-novgorod": "Нижний Новгород",
  "chelyabinsk": "Челябинск",
  "samara": "Самара",
  "ufa": "Уфа",
  "rostov-na-donu": "Ростов-на-Дону",
  "krasnoyarsk": "Красноярск",
  "perm": "Пермь",
  "voronezh": "Воронеж",
  "volgograd": "Волгоград",
  "krasnodar": "Краснодар",
  "saratov": "Саратов",
  "tyumen": "Тюмень",
  "tolyatti": "Тольятти",
  "izhevsk": "Ижевск",
  "barnaul": "Барнаул",
  "ulyanovsk": "Ульяновск",
  "irkutsk": "Иркутск",
  "habarovsk": "Хабаровск",
  "yaroslavl": "Ярославль",
  "vladivostok": "Владивосток",
  "mahachkala": "Махачкала",
  "tomsk": "Томск",
  "orenburg": "Оренбург",
  "kemerovo": "Кемерово",
  "ryazan": "Рязань",
  "naberezhnye-chelny": "Набережные Челны",
  "astrahan": "Астрахань",
  "penza": "Пенза",
  "kirov": "Киров",
  "lipetsk": "Липецк",
  "cheboksary": "Чебоксары",
  "balashiha": "Балашиха",
  "kaliningrad": "Калининград",
  "tula": "Тула",
  "kursk": "Курск",
  "stavropol": "Ставрополь",
  "ulan-ude": "Улан-Удэ",
  "tver": "Тверь",
  "magnitogorsk": "Магнитогорск",
  "ivanovo": "Иваново",
  "bryansk": "Брянск",
  "belgorod": "Белгород",
  "surgut": "Сургут",
  "vladimir": "Владимир",
  "nizhniy-tagil": "Нижний Тагил",
  "arhangelsk": "Архангельск",
  "chita": "Чита",
  "kaluga": "Калуга",
  "smolensk": "Смоленск",
  "volzhskiy": "Волжский",
  "kurgan": "Курган",
  "orel": "Орёл",
  "vologda": "Вологда",
  "saransk": "Саранск",
  "cherepovets": "Череповец",
  "vladikavkaz": "Владикавказ",
  "murmansk": "Мурманск",
  "tambov": "Тамбов",
  "groznyy": "Грозный",
  "petrozavodsk": "Петрозаводск",
  "kostroma": "Кострома",
  "nizhnevartovsk": "Нижневартовск",
  "yakutsk": "Якутск",
  "komsomolsk-na-amure": "Комсомольск-на-Амуре",
  "belyy-yar": "Белый Яр",
  "hanty-mansiysk": "Ханты-Мансийск",
  "noyabrsk": "Ноябрьск",
  "novyy-urengoy": "Новый Уренгой",
  "salehard": "Салехард",
  "sochi": "Сочи",
  "simferopol": "Симферополь",
  "sevastopol": "Севастополь",
  "yalta": "Ялта",
};

// Топ-30 городов для перелинковки и sitemap
export const TOP_CITIES = [
  "moskva", "spb", "novosibirsk", "ekaterinburg", "kazan",
  "nizhniy-novgorod", "chelyabinsk", "samara", "ufa", "rostov-na-donu",
  "krasnoyarsk", "perm", "voronezh", "volgograd", "krasnodar",
  "tyumen", "irkutsk", "habarovsk", "yaroslavl", "vladivostok",
  "tomsk", "ryazan", "kaliningrad", "tula", "stavropol",
  "surgut", "sochi", "belyy-yar", "hanty-mansiysk", "novyy-urengoy",
];

// Топ категорий для landing-страниц (наибольший спрос)
export const TOP_CATEGORIES = [
  "santekhnik", "elektrik", "remont-zhilya", "klining", "byuti",
  "massazh", "it-pomoshch", "perevozki", "mebel", "avtoremont",
  "repetitor", "nyanya", "stroitelstvo", "kuryer", "yurist",
];

export function parseSeoSlug(slug: string): { categorySlug?: string; citySlug?: string } {
  if (!slug) return {};

  // Поиск самого длинного совпадения с началом slug = категория
  const sortedCats = Object.keys(CATEGORY_SLUGS).sort((a, b) => b.length - a.length);
  for (const cs of sortedCats) {
    if (slug === cs) return { categorySlug: cs };
    if (slug.startsWith(cs + "-")) {
      const cityPart = slug.slice(cs.length + 1);
      if (CITY_SLUGS[cityPart]) {
        return { categorySlug: cs, citySlug: cityPart };
      }
    }
  }
  return {};
}

export function buildSeoSlug(categorySlug: string, citySlug?: string): string {
  return citySlug ? `${categorySlug}-${citySlug}` : categorySlug;
}
