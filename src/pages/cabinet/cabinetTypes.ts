export interface Review {
  id: number;
  rating: number;
  comment: string;
}

export interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  master_id: number | null;
  message: string;
  created_at: string;
  review: Review | null;
}

export interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  status: string;
  accepted_response_id: number | null;
  created_at: string;
  responses: Response[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

export const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
