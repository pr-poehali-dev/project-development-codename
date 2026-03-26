import { useState, useEffect, useRef } from "react";

const PROFILE_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

export interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  categories: string[];
  city: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: "purchase" | "spend";
  amount: number;
  description: string;
  created_at: string;
}

export interface MyResponse {
  id: number;
  order_id: number;
  order_title: string;
  order_category: string;
  order_status: string;
  order_city: string;
  message: string;
  created_at: string;
}

export interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

export interface Inquiry {
  id: number;
  service_id: number | null;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useMasterProfile() {
  const [phone, setPhone] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [master, setMaster] = useState<Master | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myResponses, setMyResponses] = useState<MyResponse[]>([]);
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Поля редактирования профиля — живут здесь, передаются в useMasterProfileEdit
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);

  const loadProfile = async (p: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PROFILE_URL}?phone=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (data.not_found) {
        setError("Мастер не найден. Сначала зарегистрируйтесь на главной странице.");
        setMaster(null);
      } else {
        setMaster(data.master);
        setTransactions(data.transactions || []);
        setMyResponses(data.my_responses || []);
        setMyServices(data.my_services || []);
        setInquiries(data.inquiries || []);
        setUnreadInquiries(data.unread_inquiries || 0);
        localStorage.setItem("master_phone", p);
        setEditName(data.master?.name || "");
        setEditCity(data.master?.city || "");
        setEditAbout(data.master?.about || "");
        setEditCategories(data.master?.categories?.length ? data.master.categories : (data.master?.category ? [data.master.category] : []));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("master_phone");
    setMaster(null);
    setPhone("");
    setInputPhone("");
    setTransactions([]);
  };

  const markInquiriesRead = () => {
    if (!master) return;
    fetch(PROFILE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read_inquiries", master_id: master.id }) });
    setUnreadInquiries(0);
    setInquiries(prev => prev.map(i => ({ ...i, is_read: true })));
  };

  // Polling: проверяем новые обращения каждые 15 секунд
  const masterRef = useRef<Master | null>(null);
  masterRef.current = master;

  useEffect(() => {
    const poll = async () => {
      const m = masterRef.current;
      if (!m) return;
      try {
        const res = await fetch(`${PROFILE_URL}?action=unread&master_id=${m.id}`);
        const data = await res.json();
        if (typeof data.unread_inquiries === 'number') {
          setUnreadInquiries(data.unread_inquiries);
        }
        if (data.inquiries) {
          setInquiries(data.inquiries);
        }
      } catch { /* тихо игнорируем */ }
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  return {
    phone, setPhone,
    inputPhone, setInputPhone,
    master, setMaster,
    transactions,
    myResponses,
    myServices, setMyServices,
    inquiries,
    unreadInquiries,
    loading,
    error,
    editName, setEditName,
    editCity, setEditCity,
    editAbout, setEditAbout,
    editCategories, setEditCategories,
    loadProfile,
    handleLogout,
    markInquiriesRead,
  };
}