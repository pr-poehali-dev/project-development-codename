import { useState } from "react";
import { Master, PROFILE_URL } from "./masterPageTypes";

export function useContactMasterForm(master: Master | null) {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState(() => {
    const saved = localStorage.getItem("customer_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        return { name: p.name || "", phone: p.phone || "", email: p.email || "", message: "" };
      } catch { /* ignore */ }
    }
    return { name: "", phone: "", email: "", message: "" };
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!master) return;
    setContactLoading(true); setContactError("");
    try {
      const res = await fetch(PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contact_master",
          master_id: master.id,
          contact_name: contactForm.name,
          contact_phone: contactForm.phone,
          contact_email: contactForm.email,
          message: contactForm.message,
        }),
      });
      const data = await res.json();
      if (data.error) { setContactError(data.error); return; }
      setContactSent(true);
    } finally { setContactLoading(false); }
  };

  return {
    contactOpen, setContactOpen,
    contactForm, setContactForm,
    contactLoading,
    contactSent, setContactSent,
    contactError, setContactError,
    handleContactSubmit,
  };
}
