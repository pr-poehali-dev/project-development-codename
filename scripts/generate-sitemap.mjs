// Скрипт для генерации public/sitemap.xml
// Запуск: node scripts/generate-sitemap.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const TOP_CATEGORIES = [
  "santekhnik", "elektrik", "remont-zhilya", "klining", "byuti",
  "massazh", "it-pomoshch", "perevozki", "mebel", "avtoremont",
  "repetitor", "nyanya", "stroitelstvo", "kuryer", "yurist",
];

const ALL_CATEGORIES = [
  ...TOP_CATEGORIES,
  "ozelenenie", "zoopomoshch", "dizayn", "foto-video", "uborka-snega",
  "povar", "trener", "animator", "buhgalter", "svadba",
  "ohrana", "meditsina", "perevodchik", "hendmeyd",
];

const TOP_CITIES = [
  "moskva", "spb", "novosibirsk", "ekaterinburg", "kazan",
  "nizhniy-novgorod", "chelyabinsk", "samara", "ufa", "rostov-na-donu",
  "krasnoyarsk", "perm", "voronezh", "volgograd", "krasnodar",
  "tyumen", "irkutsk", "habarovsk", "yaroslavl", "vladivostok",
  "tomsk", "ryazan", "kaliningrad", "tula", "stavropol",
  "surgut", "sochi", "belyy-yar", "hanty-mansiysk", "novyy-urengoy",
];

const RU_CATEGORIES = {
  "Авторемонт": "%D0%90%D0%B2%D1%82%D0%BE%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82",
  "Ремонт жилья": "%D0%A0%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%20%D0%B6%D0%B8%D0%BB%D1%8C%D1%8F",
  "Сантехника": "%D0%A1%D0%B0%D0%BD%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA%D0%B0",
  "Электрика": "%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%B8%D0%BA%D0%B0",
  "Клининг": "%D0%9A%D0%BB%D0%B8%D0%BD%D0%B8%D0%BD%D0%B3",
  "Бьюти": "%D0%91%D1%8C%D1%8E%D1%82%D0%B8",
  "Массаж": "%D0%9C%D0%B0%D1%81%D1%81%D0%B0%D0%B6",
  "IT-помощь": "IT-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C",
};

const BASE = "https://handyman.poehali.dev";
const today = new Date().toISOString().split("T")[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const add = (path, priority, changefreq = "weekly") => {
  xml += `  <url>\n    <loc>${BASE}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
};

// Главные страницы
add("/", 1.0, "daily");
add("/masters", 0.9, "daily");
add("/orders", 0.9, "daily");
add("/rules", 0.5, "monthly");
add("/offer", 0.4, "monthly");

// Старые категорийные страницы /category/:name
Object.values(RU_CATEGORIES).forEach(cat => add(`/category/${cat}`, 0.7));

// Новые SEO landing — общие по категориям
ALL_CATEGORIES.forEach(cat => add(`/uslugi/${cat}`, 0.85, "weekly"));

// Связки категория + город (топ комбинации)
TOP_CATEGORIES.forEach(cat => {
  TOP_CITIES.forEach(city => {
    add(`/uslugi/${cat}-${city}`, 0.75, "weekly");
  });
});

xml += `</urlset>\n`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../public/sitemap.xml");
writeFileSync(out, xml, "utf-8");

const totalUrls = (xml.match(/<url>/g) || []).length;
console.log(`✓ sitemap.xml сгенерирован: ${totalUrls} URL`);
console.log(`  → ${out}`);
