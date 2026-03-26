import { useState } from "react";

const AUTH_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface UseCabinetProfileProps {
  customer: Customer | null;
  setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
}

export function useCabinetProfile({ customer, setCustomer }: UseCabinetProfileProps) {
  // Смена пароля
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Редактирование профиля
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setEditLoading(true); setEditError(""); setEditSuccess("");
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", customer_id: customer.id, name: editName, phone: editPhone, email: editEmail, city: editCity }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setEditError(d.error); return; }
      if (d.success && d.customer) {
        setCustomer(d.customer);
        localStorage.setItem("customer_phone", d.customer.phone);
        setEditSuccess("Профиль сохранён!");
        setTimeout(() => setEditSuccess(""), 3000);
      }
    } finally { setEditLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError("Пароли не совпадают"); return; }
    if (pwNew.length < 6) { setPwError("Минимум 6 символов"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", customer_id: customer?.id, old_password: pwOld, new_password: pwNew }),
      });
      const data = await res.json();
      const d = typeof data === "string" ? JSON.parse(data) : data;
      if (d.error) { setPwError(d.error); return; }
      setPwSuccess("Пароль изменён!");
      setPwOld(""); setPwNew(""); setPwConfirm("");
      setShowPwForm(false);
      setTimeout(() => setPwSuccess(""), 3000);
    } finally { setPwLoading(false); }
  };

  return {
    showPwForm, setShowPwForm,
    pwOld, setPwOld,
    pwNew, setPwNew,
    pwConfirm, setPwConfirm,
    pwLoading, pwError, setPwError, pwSuccess,
    handleChangePassword,
    showEditProfile, setShowEditProfile,
    editName, setEditName,
    editPhone, setEditPhone,
    editEmail, setEditEmail,
    editCity, setEditCity,
    editLoading, editError, editSuccess,
    handleSaveProfile,
  };
}
