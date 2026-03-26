import { useState } from "react";

const ORDERS_URL = "https://functions.poehali.dev/34db9bab-e58a-479e-b1cc-c27fb8e0b728";
const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Review {
  id: number;
  rating: number;
  comment: string;
}

interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  master_id: number | null;
  message: string;
  created_at: string;
  review: Review | null;
}

interface Order {
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

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface UseCabinetOrdersProps {
  customer: Customer | null;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  loadProfile: (phone: string) => Promise<void>;
}

export function useCabinetOrders({ customer, orders: _orders, setOrders, loadProfile }: UseCabinetOrdersProps) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ title: "", description: "", category: "", city: "", budget: "", contact_name: "", contact_phone: "", contact_email: "" });
  const [orderSent, setOrderSent] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [selectMasterLoading, setSelectMasterLoading] = useState<number | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState("");

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true); setOrderError("");
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) { setOrderError(parsed.error); return; }
      setOrderSent(true);
      if (customer) await loadProfile(customer.phone);
    } finally { setOrderLoading(false); }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!customer) return;
    const res = await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_order", order_id: orderId, customer_id: customer.id }),
    });
    const data = await res.json();
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleUpdateOrder = async (orderId: number, data: { title: string; description: string; category: string; city: string; budget: string }) => {
    if (!customer) return;
    await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_order",
        order_id: orderId,
        customer_id: customer.id,
        title: data.title,
        description: data.description,
        category: data.category,
        city: data.city,
        budget: data.budget ? parseInt(data.budget) : null,
      }),
    });
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      title: data.title,
      description: data.description,
      category: data.category,
      city: data.city,
      budget: data.budget ? parseInt(data.budget) : null,
    } : o));
  };

  const handleSelectMaster = async (orderId: number, responseId: number) => {
    if (!customer) return;
    setSelectMasterLoading(responseId);
    await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select_master", order_id: orderId, response_id: responseId, customer_id: customer.id }),
    });
    await loadProfile(customer.phone);
    setSelectMasterLoading(null);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    if (!customer) return;
    setStatusLoading(orderId);
    await fetch(PROFILE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, status, customer_id: customer.id }),
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    setStatusLoading(null);
  };

  const handleReview = async (
    e: React.FormEvent,
    form: { orderId: number; masterName: string; masterId: number | null },
    rating: number,
    comment: string,
  ) => {
    e.preventDefault();
    if (!customer) return;
    const res = await fetch(MY_ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "review",
        customer_id: customer.id,
        order_id: form.orderId,
        master_name: form.masterName,
        master_id: form.masterId,
        rating,
        comment,
      }),
    });
    const data = await res.json();
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed.success) {
      setReviewSuccess("Отзыв отправлен!");
      await loadProfile(customer.phone);
      setTimeout(() => setReviewSuccess(""), 3000);
    }
  };

  return {
    orderModalOpen, setOrderModalOpen,
    orderForm, setOrderForm,
    orderSent, setOrderSent,
    orderLoading,
    orderError, setOrderError,
    statusLoading,
    selectMasterLoading,
    reviewSuccess,
    handleOrderSubmit,
    handleDeleteOrder,
    handleUpdateOrder,
    handleSelectMaster,
    handleStatusChange,
    handleReview,
  };
}
