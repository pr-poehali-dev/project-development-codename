import { useState, useEffect } from "react";
import { MASTER_URL, ORDERS_URL, MY_ORDERS_URL } from "./homeTypes";

export function useHomeMasterForm() {
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [masterForm, setMasterForm] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    categories: [] as string[],
    city: "",
    about: "",
    status: "Самозанятый / ИП / Компания",
  });
  const [masterSent, setMasterSent] = useState(false);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState("");

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterLoading(true);
    setMasterError("");
    try {
      const res = await fetch(MASTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: masterForm.name,
          phone: masterForm.phone,
          email: masterForm.email,
          category: masterForm.categories[0] || masterForm.category,
          categories: masterForm.categories,
          city: masterForm.city,
          about: masterForm.about,
        }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.master) {
        if (parsed.master.phone) localStorage.setItem("master_phone", parsed.master.phone);
        setMasterSent(true);
      } else {
        setMasterError(parsed.error || "Ошибка регистрации");
      }
    } catch {
      setMasterError("Не удалось подключиться. Попробуйте позже.");
    } finally {
      setMasterLoading(false);
    }
  };

  return {
    masterModalOpen, setMasterModalOpen,
    masterForm, setMasterForm,
    masterSent, setMasterSent,
    masterLoading,
    masterError,
    handleMasterSubmit,
  };
}

export function useHomeOrderForm() {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    budget: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
  });
  const [orderSent, setOrderSent] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const phone = localStorage.getItem("customer_phone");
    if (!phone) return;
    fetch(`${MY_ORDERS_URL}?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.customer) {
          setOrderForm(f => ({
            ...f,
            contact_name: parsed.customer.name || "",
            contact_phone: parsed.customer.phone || "",
            contact_email: parsed.customer.email || "",
          }));
        }
      });
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError("");
    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderForm, budget: orderForm.budget ? parseInt(orderForm.budget) : null }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderSent(true);
      } else {
        setOrderError(data.error || "Ошибка при отправке");
      }
    } catch {
      setOrderError("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setOrderLoading(false);
    }
  };

  return {
    orderModalOpen, setOrderModalOpen,
    orderForm, setOrderForm,
    orderSent, setOrderSent,
    orderLoading,
    orderError, setOrderError,
    handleOrderSubmit,
  };
}
