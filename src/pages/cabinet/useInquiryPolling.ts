import { useState, useEffect } from "react";
import { Customer, MY_ORDERS_URL } from "./cabinetTypes";

export function useInquiryPolling(customer: Customer | null) {
  const [inquiryCount, setInquiryCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!customer) return;
    const poll = async () => {
      try {
        const res = await fetch(MY_ORDERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_customer_inquiries", customer_email: customer.email, customer_phone: customer.phone }),
        });
        const data = await res.json();
        const inqs: { id: number }[] = data.inquiries || [];
        setInquiryCount(inqs.length);
        let totalUnread = 0;
        await Promise.all(inqs.map(async (inq) => {
          try {
            const r = await fetch(`${MY_ORDERS_URL}?inquiry_id=${inq.id}`);
            const d = await r.json();
            const msgs: { id: number; sender_role: string }[] = d.messages || [];
            const lastSeen = parseInt(localStorage.getItem(`chat_last_seen_${inq.id}`) || "0", 10);
            totalUnread += msgs.filter(m => m.sender_role === "master" && m.id > lastSeen).length;
          } catch { /* игнор */ }
        }));
        setUnreadMessages(totalUnread);
      } catch { /* игнорируем */ }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [customer?.id]);

  return { inquiryCount, unreadMessages, setInquiryCount, setUnreadMessages };
}
