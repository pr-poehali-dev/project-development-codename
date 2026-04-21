export interface Master {
  id: number;
  name: string;
  category: string;
  categories: string[];
  city: string;
  about: string | null;
  avatar_color: string;
  responses_count: number;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  subcategories: string[];
  city: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  order_title: string;
  created_at: string;
}

export const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
export const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
