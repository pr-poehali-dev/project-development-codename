export interface Master {
  id: number;
  name: string;
  category: string | null;
  categories: string[];
  city: string;
  about: string;
  avatar_color: string;
  rating: number | null;
  reviews_count: number;
  services_count: number;
}

export interface Service {
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
  boosted_until: string | null;
}

export interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ContactMasterTarget {
  id: number;
  name: string;
  serviceId?: number;
}

export const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";
