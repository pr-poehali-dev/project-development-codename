import { useState, useEffect, useCallback } from "react";
import { Customer, Order, MY_ORDERS_URL } from "./cabinetTypes";

interface EditFieldSetters {
  setEditName: (v: string) => void;
  setEditPhone: (v: string) => void;
  setEditEmail: (v: string) => void;
  setEditCity: (v: string) => void;
}

export function useCustomerProfile() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editFieldSetters, setEditFieldSetters] = useState<EditFieldSetters | null>(null);

  const loadProfile = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.customer) {
        setCustomer(parsed.customer);
        setOrders(parsed.orders || []);
        localStorage.setItem("customer_phone", parsed.customer.phone);
        localStorage.setItem("customer_profile", JSON.stringify({ name: parsed.customer.name, phone: parsed.customer.phone, email: parsed.customer.email }));
        if (editFieldSetters) {
          editFieldSetters.setEditName(parsed.customer.name || "");
          editFieldSetters.setEditPhone(parsed.customer.phone || "");
          editFieldSetters.setEditEmail(parsed.customer.email || "");
          editFieldSetters.setEditCity(parsed.customer.city || "");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [editFieldSetters]);

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone");
    if (saved) loadProfile(saved);
  }, []);

  return {
    customer,
    setCustomer,
    orders,
    setOrders,
    loading,
    loadProfile,
    setEditFieldSetters,
  };
}
